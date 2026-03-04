import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
})

export const submitRoast = (text, category, isPublic, savageMode = false, displayName = null) =>
  api.post('/api/roast', { text, category, is_public: isPublic, savage_mode: savageMode, display_name: displayName }).then(r => r.data)

export const getFeed = (category, sort, limit = 20, offset = 0) =>
  api.get('/api/feed', { params: { category, sort, limit, offset } }).then(r => r.data)

export const sendReaction = (roastId, emoji, previousEmoji) =>
  api.post(`/api/roasts/${roastId}/react`, { emoji, previous_emoji: previousEmoji }).then(r => r.data)

export const getLeaderboard = () =>
  api.get('/api/leaderboard').then(r => r.data)
