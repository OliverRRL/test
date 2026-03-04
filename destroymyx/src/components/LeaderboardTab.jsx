import { useState, useEffect } from 'react'
import { getLeaderboard } from '../lib/api'
import { Y } from '../lib/constants'

const MEDALS = ['🥇', '🥈', '🥉']

function Row({ roast, rank }) {
  const total = Object.values(roast.reactions || {}).reduce((a, b) => a + b, 0)
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '14px 0', borderBottom: '1px solid #141414'
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 26,
        width: 40, textAlign: 'center',
        color: rank <= 3 ? Y : '#666666'
      }}>
        {rank <= 3 ? MEDALS[rank - 1] : rank}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#444', letterSpacing: 2, textTransform: 'uppercase' }}>
          {roast.category}
        </div>
        <div style={{ fontSize: 13, color: '#ccc', marginTop: 3, fontStyle: 'italic' }}>
          "{roast.one_liner}"
        </div>
      </div>
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: Y }}>
          {roast.score}/10
        </div>
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#333' }}>
          {total} reactions
        </div>
      </div>
    </div>
  )
}

function Section({ title, roasts = [] }) {
  const safe = roasts ?? []
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 13,
        letterSpacing: 4, color: '#858585', marginBottom: 4,
        borderBottom: `1px solid ${Y}`, paddingBottom: 8
      }}>
        {title}
      </div>
      {safe.length === 0 && (
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, color: '#858585', letterSpacing: 2, padding: '24px 0' }}>
          NO DATA YET
        </div>
      )}
      {safe.map((r, i) => <Row key={r.id} roast={r} rank={i + 1} />)}
    </div>
  )
}

export default function LeaderboardTab({ onGoRoast }) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then(setData).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="slide-in">
      {loading && (
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: '#333', letterSpacing: 3, textAlign: 'center', padding: 48 }}>
          TALLYING THE DAMAGE...
        </div>
      )}

      {data && (
        <>
          <Section title="MOST SAVAGE — CLAUDE'S PICKS" roasts={data.top_savage ?? []} />
          <Section title="CROWD FAVOURITES" roasts={data.top_reactions ?? []} />
          <Section title="FRESHLY DESTROYED" roasts={data.most_recent ?? []} />
        </>
      )}

      <div style={{ textAlign: 'center', marginTop: 16 }}>
        <button onClick={onGoRoast} style={{
          background: Y, border: 'none', color: '#000',
          fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, letterSpacing: 3,
          padding: '14px 40px', cursor: 'pointer'
        }}>
          GET ON THE BOARD →
        </button>
      </div>
    </div>
  )
}
