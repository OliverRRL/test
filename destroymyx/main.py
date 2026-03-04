from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel
from typing import Optional
import anthropic
import os
import re
import time
import json
from collections import defaultdict
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="DestroyMyX API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase: Client = create_client(
    os.getenv("SUPABASE_URL"),
    os.getenv("SUPABASE_ANON_KEY")
)

claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

CATEGORIES = ["LinkedIn Bio", "Dating Profile", "Business Pitch", "Cover Letter", "Social Bio"]
REACTIONS = ["💀", "🔥", "🤌", "😬", "🫡", "😭"]
REACTION_WEIGHTS = {"💀": 10, "🔥": 8, "🤌": 9, "😬": 6, "🫡": 4, "😭": 7}

INPUT_MAX_CHARS = 1200
COOLDOWN_SECONDS = 45

# In-memory IP cooldown tracker {ip: last_request_timestamp}
_cooldowns: dict[str, float] = defaultdict(float)

# Minimal banned pattern list — slurs and obvious hate triggers only
BANNED_PATTERNS = [
    r'\bn[i!1]+gg[ae]r\b', r'\bf[a@]+gg[o0]t\b', r'\bk[i!1]+ke\b',
    r'\bsp[i!1]+c\b', r'\bch[i!1]+nk\b', r'\btr[a@]+nn[yi]\b',
    r'\bretard\b', r'\bc[u\*]+nt\b', r'\bwh[o0]+re\b',
]
BANNED_RE = re.compile('|'.join(BANNED_PATTERNS), re.IGNORECASE)

OUTPUT_REJECT_PATTERNS = [
    r'\bn[i!1]+gg', r'\bf[a@]+gg', r'kill yourself', r'kys\b',
    r'self.?harm', r'suicide',
]
OUTPUT_REJECT_RE = re.compile('|'.join(OUTPUT_REJECT_PATTERNS), re.IGNORECASE)


def check_input(text: str):
    if BANNED_RE.search(text):
        raise HTTPException(400, "Input contains prohibited content.")


def check_output(text: str) -> bool:
    return not OUTPUT_REJECT_RE.search(text)


def check_cooldown(ip: str):
    elapsed = time.time() - _cooldowns[ip]
    if elapsed < COOLDOWN_SECONDS:
        remaining = int(COOLDOWN_SECONDS - elapsed)
        raise HTTPException(429, f"Slow down. Try again in {remaining}s.")
    _cooldowns[ip] = time.time()


async def call_claude(prompt: str, text: str) -> dict:
    message = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=700,
        messages=[{"role": "user", "content": f"{prompt}\n\nInput:\n{text}"}]
    )
    raw = message.content[0].text.strip()
    return json.loads(raw.replace("```json", "").replace("```", "").strip())


class RoastRequest(BaseModel):
    text: str
    category: str
    is_public: bool = False
    savage_mode: bool = False
    display_name: Optional[str] = None


class ReactRequest(BaseModel):
    emoji: str
    previous_emoji: Optional[str] = None


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/api/roast")
@limiter.limit("10/hour")
async def roast(request: Request, body: RoastRequest):
    ip = get_remote_address(request)

    # Validation
    if body.category not in CATEGORIES:
        raise HTTPException(400, "Invalid category.")
    if len(body.text.strip()) < 20:
        raise HTTPException(400, "Give us more to work with.")
    if len(body.text) > INPUT_MAX_CHARS:
        raise HTTPException(400, f"Max {INPUT_MAX_CHARS} characters.")

    check_input(body.text)
    check_cooldown(ip)

    if body.savage_mode:
        prompt = f"""You are the most savage roast comedian alive. The user submitted their {body.category}.

Rules:
- Roast: 150 words max, absolutely merciless, mock patterns and archetypes NOT personal identifying details
- No fix section — they don't deserve one
- Score: integer 1-10 savagery (10 = obliterated)
- One_liner: single devastating sentence under 15 words
- Subscores: rate 1-10 for creativity, brutality, accuracy

Return ONLY valid JSON, no markdown, no backticks:
{{"roast": "...", "score": 9, "one_liner": "...", "subscores": {{"creativity": 8, "brutality": 10, "accuracy": 7}}}}"""
    else:
        prompt = f"""You are a savage but witty roast comedian. The user submitted their {body.category}.

Rules:
- Roast: 120 words max, brutal but clever, mock patterns and archetypes NOT personal identifying details
- Fix: 60 words max, genuine and actionable
- Score: integer 1-10 savagery (10 = absolutely obliterated)
- One_liner: single devastating sentence under 15 words
- Subscores: rate 1-10 for creativity, brutality, accuracy

Return ONLY valid JSON, no markdown, no backticks:
{{"roast": "...", "fix": "...", "score": 8, "one_liner": "...", "subscores": {{"creativity": 7, "brutality": 8, "accuracy": 6}}}}"""

    try:
        result = await call_claude(prompt, body.text)

        # Output sanity check — retry once if response looks bad
        if not check_output(result.get("roast", "") + result.get("one_liner", "")):
            result = await call_claude(prompt, body.text)
            if not check_output(result.get("roast", "") + result.get("one_liner", "")):
                raise HTTPException(500, "Unable to generate appropriate roast. Try again.")

    except Exception as e:
        raise HTTPException(500, f"Claude error: {str(e)}")

    if not all(k in result for k in ["roast", "fix", "score", "one_liner"]):
        raise HTTPException(500, "Invalid response from Claude")

    roast_id = None
    if body.is_public:
        reactions = {e: 0 for e in REACTIONS}
        row = supabase.table("roasts").insert({
            "category": body.category,
            "roast": result["roast"],
            "fix": result.get("fix", None),
            "score": result["score"],
            "one_liner": result["one_liner"],
            "subscores": result.get("subscores", {}),
            "savage_mode": body.savage_mode,
            "display_name": body.display_name or "Anonymous",
            "reactions": reactions,
            "crowd_score": 0.0,
        }).execute()
        roast_id = row.data[0]["id"]

    return {**result, "id": roast_id, "is_public": body.is_public}


@app.get("/api/feed")
async def feed(
    category: Optional[str] = None,
    sort: str = "reactions",
    limit: int = 20,
    offset: int = 0
):
    query = supabase.table("roasts").select("*")
    if category and category != "All":
        query = query.eq("category", category)

    if sort == "score":
        query = query.order("score", desc=True)
    elif sort == "recent":
        query = query.order("created_at", desc=True)
    else:
        # reactions sort handled client-side after fetch for now
        query = query.order("created_at", desc=True)

    query = query.range(offset, offset + limit - 1)
    result = query.execute()
    return {"roasts": result.data, "total": len(result.data)}


@app.post("/api/roasts/{roast_id}/react")
@limiter.limit("60/minute")
async def react(request: Request, roast_id: str, body: ReactRequest):
    if body.emoji not in REACTIONS:
        raise HTTPException(400, "Invalid reaction")

    row = supabase.table("roasts").select("reactions").eq("id", roast_id).single().execute()
    if not row.data:
        raise HTTPException(404, "Roast not found")

    reactions = row.data["reactions"]

    if body.previous_emoji and body.previous_emoji in reactions:
        reactions[body.previous_emoji] = max(0, reactions[body.previous_emoji] - 1)

    reactions[body.emoji] = reactions.get(body.emoji, 0) + 1

    total = sum(reactions.values())
    crowd_score = (
        sum(reactions.get(e, 0) * REACTION_WEIGHTS[e] for e in REACTIONS) / total
        if total > 0 else 0
    )

    supabase.table("roasts").update({
        "reactions": reactions,
        "crowd_score": round(crowd_score, 1)
    }).eq("id", roast_id).execute()

    return {"reactions": reactions, "crowd_score": round(crowd_score, 1)}


@app.get("/api/leaderboard")
async def leaderboard():
    top_savage = supabase.table("roasts").select("*").order("score", desc=True).limit(5).execute()
    top_reactions = supabase.table("roasts").select("*").order("crowd_score", desc=True).limit(5).execute()
    most_recent = supabase.table("roasts").select("*").order("created_at", desc=True).limit(5).execute()

    return {
        "top_savage": top_savage.data,
        "top_reactions": top_reactions.data,
        "most_recent": most_recent.data
    }
