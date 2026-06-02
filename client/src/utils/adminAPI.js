import axios from 'axios'

const baseUrl = process.env.NODE_ENV === 'production'
  ? 'https://sandycalhounart.herokuapp.com'
  : 'http://localhost:3001'

const TOKEN_KEY = 'admin_token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
export const isAuthed = () => Boolean(getToken())

const client = axios.create({ baseURL: baseUrl })

client.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (res) => res,
  (error) => {
    // Auto-logout on auth failures so the UI falls back to the login gate.
    if (error.response && error.response.status === 401) {
      clearToken()
    }
    return Promise.reject(error)
  }
)

const adminAPI = {
  login: (password) => axios.post(baseUrl + '/api/admin/login', { password }),

  // Artwork
  listArt: () => client.get('/api/admin/art'),
  createArt: (body) => client.post('/api/admin/art', body),
  updateArt: (id, body) => client.put(`/api/admin/art/${id}`, body),
  deleteArt: (id) => client.delete(`/api/admin/art/${id}`),
  restoreArt: (id) => client.put(`/api/admin/art/${id}/restore`),

  // Image upload (presigned). `folder` controls the S3 prefix (artwork|shows).
  getUploadUrl: (title, contentType, folder) =>
    client.post('/api/admin/upload-url', { title, contentType, folder }),
  uploadToS3: (uploadUrl, file) =>
    axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } }),

  // Shows / resume
  listShows: () => client.get('/api/admin/shows'),
  createShow: (body) => client.post('/api/admin/shows', body),
  updateShow: (id, body) => client.put(`/api/admin/shows/${id}`, body),
  deleteShow: (id) => client.delete(`/api/admin/shows/${id}`),
}

export default adminAPI
