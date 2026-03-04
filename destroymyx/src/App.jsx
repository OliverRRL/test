import { useState } from 'react'
import RoastTab from './components/RoastTab'
import FeedTab from './components/FeedTab'
import LeaderboardTab from './components/LeaderboardTab'
import { UnlockModal } from './components/UI'
import { useRoastCount } from './hooks/useRoastCount'
import { Y } from './lib/constants'

const TABS = [
  { id: 'roast',       label: '🔥 ROAST MINE'    },
  { id: 'feed',        label: '💀 THE FEED'       },
  { id: 'leaderboard', label: '🏆 HALL OF PAIN'   },
]

export default function App() {
  const [tab, setTab]           = useState('roast')
  const [showUnlock, setShowUnlock] = useState(false)
  const [lastPublicRoast, setLastPublicRoast] = useState(null)
  const roastCount              = useRoastCount()

  const handleRoastComplete = (result) => {
    if (result.is_public && result.id) setLastPublicRoast(result)
  }

  const handleUnlock = () => {
    // TODO: wire up Lemon Squeezy payment here
    // On successful payment callback: roastCount.unlock()
    roastCount.unlock() // placeholder — replace with real payment flow
    setShowUnlock(false)
  }

  return (
    <div style={{ background: '#080808', minHeight: '100vh', width: '100%', color: '#fff', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        borderBottom: `3px solid ${Y}`,
        background: '#080808',
        position: 'sticky', top: 0, zIndex: 100,
        padding: '20px clamp(24px, 4vw, 80px) 0'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(32px, 7vw, 68px)',
                lineHeight: 0.9, letterSpacing: 2, color: '#fff'
              }}>
                DESTROY<span style={{ color: Y }}>MY</span>X
              </h1>
              <p style={{
                fontFamily: "'Oswald', sans-serif", fontSize: 11,
                color: '#858585', letterSpacing: 4, textTransform: 'uppercase', marginTop: 5
              }}>
                paste it. we destroy it. crowd judges.
              </p>
            </div>

            <div style={{ fontFamily: "'Oswald', sans-serif", fontSize: 12, textAlign: 'right', paddingBottom: 4 }}>
              {roastCount.unlocked
                ? <span style={{ color: Y }}>✓ UNLIMITED</span>
                : roastCount.remaining > 0
                  ? <span style={{ color: '#444' }}>{roastCount.remaining} free left</span>
                  : <span style={{ color: '#ff4444', cursor: 'pointer' }} onClick={() => setShowUnlock(true)}>⚠ LIMIT HIT</span>
              }
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', marginTop: 18 }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background:    tab === t.id ? Y : 'transparent',
                border:        'none',
                borderBottom:  tab === t.id ? `3px solid ${Y}` : '3px solid transparent',
                color:         tab === t.id ? '#000' : '#858585',
                fontFamily:    "'Oswald', sans-serif", fontWeight: 700,
                fontSize:      13, letterSpacing: 2,
                padding:       '10px 18px', cursor: 'pointer',
                marginBottom:  -3, textTransform: 'uppercase',
                transition:    'all .15s'
              }}>
                {t.label}
              </button>
            ))}
          </div>
      </div>

      {/* Body */}
      <div style={{ padding: '32px clamp(24px, 4vw, 80px)', flex: 1 }}>
        {tab === 'roast' && (
          <RoastTab
            roastCount={roastCount}
            onRoastComplete={handleRoastComplete}
            onShowUnlock={() => setShowUnlock(true)}
          />
        )}
        {tab === 'feed' && (
          <FeedTab newRoast={lastPublicRoast} />
        )}
        {tab === 'leaderboard' && (
          <LeaderboardTab onGoRoast={() => setTab('roast')} />
        )}
      </div>

      {showUnlock && (
        <UnlockModal
          onClose={() => setShowUnlock(false)}
          onUnlock={handleUnlock}
        />
      )}
    </div>
  )
}
