import { useState, useRef, useEffect } from 'react'
import { submitRoast } from '../lib/api'
import { CATEGORIES, Y } from '../lib/constants'
import { ScoreMeter, CategoryPill, AdBanner } from './UI'

const HISTORY_KEY = 'dmx_history'

function saveToHistory(result, category) {
  try {
    const prev = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]')
    const next = [{ ...result, category, saved_at: Date.now() }, ...prev].slice(0, 50)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next))
  } catch { /* silent */ }
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') }
  catch { return [] }
}

function SubScores({ subscores }) {
  if (!subscores) return null
  return (
    <div style={{ display: 'flex', gap: 20, marginTop: 16, marginBottom: 4, flexWrap: 'wrap' }}>
      {[['creativity', '🎨'], ['brutality', '💀'], ['accuracy', '🎯']].map(([key, icon]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 24, color: Y }}>
            {subscores[key]}/10
          </div>
          <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 10, color: '#444', letterSpacing: 2, textTransform: 'uppercase' }}>
            {icon} {key}
          </div>
        </div>
      ))}
    </div>
  )
}

function Toggle({ value, onChange, activeColor = Y }) {
  return (
    <div onClick={() => onChange(!value)} style={{
      width: 36, height: 20,
      background: value ? activeColor : '#1a1a1a',
      border: `2px solid ${value ? activeColor : '#333'}`,
      borderRadius: 10, position: 'relative',
      transition: 'all .2s', cursor: 'pointer', flexShrink: 0
    }}>
      <div style={{
        width: 12, height: 12, background: value ? '#000' : '#444',
        borderRadius: '50%', position: 'absolute',
        top: 2, left: value ? 18 : 2, transition: 'all .2s'
      }} />
    </div>
  )
}

export default function RoastTab({ roastCount, onRoastComplete, onShowUnlock }) {
  const [input, setInput]             = useState('')
  const [category, setCategory]       = useState(CATEGORIES[0])
  const [isPublic, setIsPublic]       = useState(false)
  const [savageMode, setSavageMode]   = useState(false)
  const [displayName, setDisplayName] = useState(() => localStorage.getItem('dmx_display_name') || '')
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory]         = useState(loadHistory)
  const [loading, setLoading]         = useState(false)
  const [result, setResult]           = useState(null)
  const [error, setError]             = useState(null)
  const resultRef = useRef(null)

  useEffect(() => {
    if (result) resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [result])

  const handleRoast = async () => {
    if (!roastCount.canRoast) { onShowUnlock(); return }
    if (savageMode && !roastCount.unlocked) { onShowUnlock(); return }
    if (input.trim().length < 20) { setError('Give us more to work with — at least 20 characters.'); return }
    setLoading(true); setError(null); setResult(null)
    try {
      const data = await submitRoast(
        input, category, isPublic, savageMode,
        roastCount.unlocked ? displayName : null
      )
      setResult(data)
      roastCount.increment()
      if (roastCount.unlocked) {
        saveToHistory(data, category)
        setHistory(loadHistory())
      }
      onRoastComplete(data)
    } catch (e) {
      setError(e?.response?.data?.detail || 'Something went wrong. Try again.')
    }
    setLoading(false)
  }

  return (
    <div className="slide-in">
      {!roastCount.unlocked && <AdBanner onUnlock={onShowUnlock} />}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {CATEGORIES.map(c => (
          <CategoryPill key={c} label={c} active={category === c} onClick={() => setCategory(c)} />
        ))}
      </div>

      {/* Savage mode — teased for free users */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
          fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 2, textTransform: 'uppercase',
          color: !roastCount.unlocked ? '#2a2a2a' : savageMode ? '#ff4444' : '#444'
        }}>
          <Toggle value={savageMode} onChange={roastCount.unlocked ? setSavageMode : () => onShowUnlock()} activeColor="#ff4444" />
          ☠ SAVAGE MODE
          {!roastCount.unlocked && <span style={{ color: '#2a2a2a', fontSize: 10 }}> — UNLOCK</span>}
        </label>
        {savageMode && roastCount.unlocked && (
          <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#ff4444', letterSpacing: 1 }}>NO FIX. NO MERCY.</span>
        )}
      </div>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder={`Paste your ${category.toLowerCase()} here. The worse it is, the better.`}
        maxLength={1200}
        style={{
          width: '100%', minHeight: 160,
          background: savageMode ? '#0d0000' : '#0d0d0d',
          border: `2px solid ${savageMode ? '#440000' : '#222'}`,
          borderRadius: 0, padding: 16,
          fontSize: 13, color: '#ccc', lineHeight: 1.7, outline: 'none', transition: 'all .2s'
        }}
        onFocus={e => e.target.style.borderColor = savageMode ? '#ff4444' : Y}
        onBlur={e  => e.target.style.borderColor = savageMode ? '#440000' : '#222'}
      />
      <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: input.length > 1100 ? '#ff6b00' : '#2a2a2a', letterSpacing: 1, textAlign: 'right', marginTop: 4 }}>
        {input.length}/1200
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontFamily: "'Oswald', sans-serif", fontSize: 12, color: '#555', letterSpacing: 2, textTransform: 'uppercase' }}>
            <Toggle value={isPublic} onChange={setIsPublic} />
            Post to feed
          </label>
          {roastCount.unlocked && isPublic && (
            <input
              value={displayName}
              onChange={e => { setDisplayName(e.target.value); localStorage.setItem('dmx_display_name', e.target.value) }}
              placeholder="Display name"
              maxLength={20}
              style={{
                background: '#111', border: '1px solid #2a2a2a', padding: '4px 10px',
                fontFamily: "'Oswald', sans-serif", fontSize: 12, color: '#ccc',
                letterSpacing: 1, outline: 'none', width: 140
              }}
            />
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {roastCount.unlocked && history.length > 0 && (
            <button onClick={() => setShowHistory(!showHistory)} style={{
              background: 'none', border: 'none', color: '#444', cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 2, padding: 0
            }}>
              {showHistory ? '▲ HIDE' : '▼ HISTORY'}
            </button>
          )}
          {!roastCount.unlocked && (
            <span style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, color: '#444' }}>
              {roastCount.remaining} free left
            </span>
          )}
          <button onClick={handleRoast} disabled={loading} className={loading ? 'pulsing' : ''} style={{
            background: loading ? '#222' : savageMode ? '#ff4444' : Y,
            border: 'none', color: loading ? '#555' : '#000',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: 3,
            padding: '10px 32px', transition: 'all .15s', cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'DESTROYING...' : savageMode ? '☠ DESTROY IT' : 'DESTROY IT →'}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: '#1a0000', border: '1px solid #440000', fontFamily: "'Oswald', sans-serif", fontSize: 13, color: '#ff4444', letterSpacing: 1 }}>
          {error}
        </div>
      )}

      {/* History panel */}
      {showHistory && roastCount.unlocked && (
        <div style={{ marginTop: 24, borderTop: '1px solid #1a1a1a', paddingTop: 20 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 13, letterSpacing: 4, color: '#333', marginBottom: 16 }}>YOUR ROAST HISTORY</div>
          {history.map((h, i) => (
            <div key={i} onClick={() => { setResult(h); setShowHistory(false) }}
              style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: 12, marginBottom: 8, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#333'}
              onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
            >
              <div>
                <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#444', letterSpacing: 2 }}>{h.category}</div>
                <div style={{ fontSize: 12, color: '#777', marginTop: 2, fontStyle: 'italic' }}>"{h.one_liner}"</div>
              </div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 20, color: Y, flexShrink: 0, marginLeft: 12 }}>{h.score}/10</div>
            </div>
          ))}
        </div>
      )}

      {/* Result */}
      {result && (
        <div ref={resultRef} className="slide-in" style={{ marginTop: 32 }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 12, letterSpacing: 4, color: '#333', marginBottom: 16 }}>▼ YOUR ROAST IS IN</div>
          <div style={{
            background: '#0d0d0d',
            border: `2px solid ${savageMode ? '#ff4444' : Y}`,
            borderLeft: `6px solid ${savageMode ? '#ff4444' : Y}`,
            padding: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, color: savageMode ? '#ff4444' : Y, fontStyle: 'italic', flex: 1 }}>
                "{result.one_liner}"
              </div>
              <ScoreMeter score={result.score} />
            </div>

            {roastCount.unlocked && result.subscores
              ? <SubScores subscores={result.subscores} />
              : <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#2a2a2a', marginTop: 8, letterSpacing: 1, cursor: 'pointer' }} onClick={onShowUnlock}>🔒 UNLOCK FOR SCORE BREAKDOWN</div>
            }

            <div style={{ fontSize: 13, color: '#ccc', lineHeight: 1.8, borderTop: '1px solid #1a1a1a', paddingTop: 20, marginTop: 16, marginBottom: result.fix ? 20 : 0 }}>
              {result.roast}
            </div>

            {result.fix && (
              <div style={{ background: '#111', border: '1px solid #2a2a2a', padding: 14, fontSize: 12, color: '#888', lineHeight: 1.6 }}>
                <span style={{ color: Y, fontFamily: "'Oswald', sans-serif", fontSize: 11, letterSpacing: 2 }}>THE FIX → </span>
                {result.fix}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={() => { setInput(''); setResult(null) }} style={{
              background: '#111', border: '2px solid #222', color: '#666', cursor: 'pointer',
              fontFamily: "'Oswald', sans-serif", fontSize: 12, letterSpacing: 2, padding: '10px 20px'
            }}>← ROAST ANOTHER</button>
            {isPublic && result.id && (
              <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 11, color: '#444', letterSpacing: 2 }}>✓ POSTED TO FEED</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
