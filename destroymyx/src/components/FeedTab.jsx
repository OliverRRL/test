import { useState, useEffect, useCallback } from 'react'
import { getFeed, sendReaction } from '../lib/api'
import { CATEGORIES, Y } from '../lib/constants'
import { ScoreMeter, ReactionBar, CategoryPill } from './UI'

function RoastCard({ roast, onReact, userReactions }) {
  const [expanded, setExpanded] = useState(false)
  const accent = roast.score >= 8 ? Y : roast.score >= 5 ? '#ff6b00' : '#444'

  return (
    <div style={{
      background: '#0d0d0d', border: '2px solid #1a1a1a',
      borderLeft: `4px solid ${accent}`, padding: 20
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={{
            fontFamily: "'Oswald', sans-serif", fontSize: 11,
            color: '#444', letterSpacing: 3, textTransform: 'uppercase', display: 'block', marginBottom: 6
          }}>{roast.category}</span>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 17, color: '#fff', fontStyle: 'italic', lineHeight: 1.2 }}>
            "{roast.one_liner}"
          </div>
        </div>
        <ScoreMeter score={roast.score} size="small" />
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid #1a1a1a', paddingTop: 16, marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#bbb', lineHeight: 1.8, marginBottom: 14 }}>{roast.roast}</p>
          <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: 12, fontSize: 12, color: '#777', lineHeight: 1.6 }}>
            <span style={{ color: Y, fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 2 }}>THE FIX → </span>
            {roast.fix}
          </div>
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} style={{
        background: 'none', border: 'none', color: '#858585', cursor: 'pointer',
        fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 2,
        textTransform: 'uppercase', padding: 0, marginBottom: 12
      }}>
        {expanded ? '▲ COLLAPSE' : '▼ READ FULL ROAST'}
      </button>

      <ReactionBar
        reactions={roast.reactions}
        roastId={roast.id}
        onReact={onReact}
        userReactions={userReactions}
      />

      {roast.crowd_score > 0 && (
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#858585', marginTop: 8, letterSpacing: 1 }}>
          CLAUDE: {roast.score}/10 &nbsp;·&nbsp; CROWD: {roast.crowd_score}/10
          {Math.abs(roast.score - roast.crowd_score) >= 2 && (
            <span style={{ color: '#ff6b00', marginLeft: 8 }}>⚡ DISPUTED</span>
          )}
        </div>
      )}
    </div>
  )
}

export default function FeedTab({ newRoast }) {
  const [roasts, setRoasts]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState(null)
  const [category, setCategory]       = useState('All')
  const [sort, setSort]               = useState('recent')
  const [userReactions, setUserReactions] = useState({})

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getFeed(category === 'All' ? undefined : category, sort)
      setRoasts(data?.roasts ?? [])
    } catch (e) {
      setError('Failed to load feed.')
      setRoasts([])
    }
    setLoading(false)
  }, [category, sort])

  useEffect(() => { load() }, [load])

  // Prepend if a new public roast just came in
  useEffect(() => {
    if (newRoast?.id) {
      setRoasts(prev => {
        if (prev.find(r => r.id === newRoast.id)) return prev
        return [newRoast, ...prev]
      })
    }
  }, [newRoast])

  const handleReact = async (roastId, emoji) => {
    const prev = userReactions[roastId]
    if (prev === emoji) return
    setUserReactions(r => ({ ...r, [roastId]: emoji }))
    try {
      const updated = await sendReaction(roastId, emoji, prev)
      setRoasts(rs => rs.map(r => r.id === roastId ? { ...r, ...updated } : r))
    } catch { /* silent */ }
  }

  return (
    <div className="slide-in">
      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', ...CATEGORIES].map(c => (
            <CategoryPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['recent', 'RECENT'], ['score', 'SAVAGE']].map(([val, label]) => (
            <button key={val} onClick={() => setSort(val)} style={{
              background: sort === val ? '#1a1a1a' : 'transparent',
              border: `1px solid ${sort === val ? Y : '#222'}`,
              color: sort === val ? Y : '#333',
              fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 1,
              padding: '5px 12px', cursor: 'pointer'
            }}>{label}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: '#333', letterSpacing: 3, textAlign: 'center', padding: 48 }}>
          LOADING CARNAGE...
        </div>
      )}

      {error && (
        <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 13, color: '#ff4444', letterSpacing: 2, textAlign: 'center', padding: 48 }}>
          {error}
        </div>
      )}

      {!loading && !error && roasts.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, fontFamily: "'Oswald', sans-serif", fontSize: 13, color: '#2a2a2a', letterSpacing: 3, lineHeight: 2 }}>
          NO PUBLIC ROASTS YET.<br />BE THE FIRST TO GET DESTROYED.
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
        gap: 14
      }}>
        {roasts.map(r => (
          <RoastCard key={r.id} roast={r} onReact={handleReact} userReactions={userReactions} />
        ))}
      </div>
    </div>
  )
}
