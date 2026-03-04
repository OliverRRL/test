import { SCORE_LABELS, REACTIONS, Y } from '../lib/constants'


// ── Score display ─────────────────────────────────────────────────────────────
export function ScoreMeter({ score, size = 'large' }) {
  const big = size === 'large'
  const glow = score >= 8 ? `0 0 28px ${Y}` : 'none'
  const col  = score >= 8 ? Y : score >= 5 ? '#fff' : '#888'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: big ? 14 : 6 }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: big ? 68 : 30,
        lineHeight: 1, color: col, textShadow: glow, transition: 'all .3s'
      }}>
        {score}
        <span style={{ fontSize: big ? 30 : 14, color: '#555' }}>/10</span>
      </div>
      {big && (
        <div style={{
          fontFamily: "'Oswald', sans-serif", fontSize: 12,
          color: Y, textTransform: 'uppercase', letterSpacing: 2,
          maxWidth: 76, lineHeight: 1.2
        }}>
          {SCORE_LABELS[score]}
        </div>
      )}
    </div>
  )
}

// ── Reaction bar ──────────────────────────────────────────────────────────────
export function ReactionBar({ reactions = {}, roastId, onReact, userReactions = {} }) {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0)
  const crowdScore = total > 0
    ? (REACTIONS.reduce((s, r) => s + (reactions[r.emoji] || 0) * r.weight, 0) / total).toFixed(1)
    : '—'

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        {REACTIONS.map(r => {
          const active = userReactions[roastId] === r.emoji
          return (
            <button key={r.emoji} onClick={() => onReact && onReact(roastId, r.emoji)}
              style={{
                background: active ? Y : '#1a1a1a',
                border: `2px solid ${active ? Y : '#2a2a2a'}`,
                borderRadius: 3, padding: '4px 10px',
                fontFamily: "'Oswald', sans-serif", fontSize: 13,
                color: active ? '#000' : '#aaa',
                display: 'flex', alignItems: 'center', gap: 5,
                transition: 'all .15s',
                transform: active ? 'scale(1.06)' : 'scale(1)'
              }}>
              <span style={{ fontSize: 16 }}>{r.emoji}</span>
              {reactions[r.emoji] || 0}
            </button>
          )
        })}
      </div>
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#444', display: 'flex', gap: 16 }}>
        <span>CROWD: <span style={{ color: Y }}>{crowdScore}/10</span></span>
        <span>{total} REACTIONS</span>
      </div>
    </div>
  )
}

// ── Category pill ─────────────────────────────────────────────────────────────
export function CategoryPill({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: active ? Y : '#111',
      border: `2px solid ${active ? Y : '#222'}`,
      color: active ? '#000' : '#666',
      fontFamily: "'Oswald', sans-serif", fontWeight: 600,
      fontSize: 12, letterSpacing: 1,
      padding: '6px 14px', textTransform: 'uppercase',
      transition: 'all .15s'
    }}>
      {label}
    </button>
  )
}

// ── Unlock modal ──────────────────────────────────────────────────────────────
export function UnlockModal({ onClose, onUnlock }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 999, padding: 24
    }}>
      <div style={{
        background: '#0d0d0d', border: `2px solid ${Y}`,
        padding: 32, maxWidth: 400, width: '100%'
      }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 36, color: Y, marginBottom: 8 }}>
          REMOVE THE CAGE
        </div>
        <p style={{ fontFamily: "'Oswald', sans-serif", fontSize: 14, color: '#888', lineHeight: 1.6, marginBottom: 24 }}>
          Pay once. Destroy forever.
        </p>
        <ul style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: '#ccc', listStyle: 'none', marginBottom: 24, lineHeight: 2 }}>
          <li>✓ Unlimited roasts</li>
          <li>✓ No ads</li>
          <li>✓ Savage mode — no mercy, no fix</li>
          <li>✓ Score breakdown — Creativity, Brutality, Accuracy</li>
          <li>✓ Roast history saved</li>
          <li>✓ Custom display name on public roasts</li>
        </ul>
        <button onClick={onUnlock} style={{
          background: Y, border: 'none', color: '#000', width: '100%',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, letterSpacing: 3,
          padding: '14px 0', marginBottom: 12
        }}>
          UNLOCK FOR $2.99 →
        </button>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', color: '#444', width: '100%',
          fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 2
        }}>
          MAYBE LATER
        </button>
      </div>
    </div>
  )
}

// ── Ad banner ─────────────────────────────────────────────────────────────────
export function AdBanner({ onUnlock }) {
  return (
    <div style={{
      background: '#0d0d0d', border: '1px dashed #222',
      padding: '10px 16px', marginBottom: 24,
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#333', letterSpacing: 2 }}>
        AD — REMOVE FOREVER FOR $2.99
      </span>
      <button onClick={onUnlock} style={{
        background: Y, border: 'none', color: '#858585',
        fontFamily: "'Oswald', sans-serif", fontWeight: 700,
        fontSize: 11, letterSpacing: 2, padding: '4px 12px'
      }}>
        UNLOCK
      </button>
    </div>
  )
}
