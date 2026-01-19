export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'

export class AuthError extends Error {
  constructor(message = 'Unauthorized access') {
    super(message)
    this.name = 'AuthError'
  }
}

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

const apiFetch = async (endpoint, options = {}) => {
  const jwtToken = localStorage.getItem('jwtToken')

  console.log(
    `[API] Fetching ${endpoint} with token prefix: ${jwtToken ? jwtToken.substring(0, 10) + '...' : 'NONE'}`
  )

  const hasBody = options.body !== undefined && options.body !== null
  const headers = {
    ...(hasBody && { 'Content-Type': 'application/json' }),
    ...(jwtToken && { Authorization: `Bearer ${jwtToken}` }),
    ...options.headers,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    // Helper function to handle retry response
    const handleRetryResponse = async (res) => {
      if (res.status === 204) return null
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) throw new AuthError()
        const errorData = await res.json().catch(() => ({}))
        const error = new Error(
          errorData.message || `Request failed with status ${res.status}`
        )
        error.status = res.status
        throw error
      }
      return res.json()
    }

    // If unauthorized, attempt to refresh token
    if (response.status === 401 || response.status === 403) {
      const refreshToken = localStorage.getItem('refreshToken')

      if (!refreshToken) {
        // No refresh token available, throw auth error
        throw new AuthError()
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            // Retry original request with new token
            const newHeaders = {
              ...headers,
              Authorization: `Bearer ${token}`,
            }
            return fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              headers: newHeaders,
            }).then(handleRetryResponse)
          })
          .catch(() => {
            throw new AuthError()
          })
      }

      isRefreshing = true

      try {
        // Attempt to refresh the token
        const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (!refreshResponse.ok) {
          // Refresh failed, clear tokens and throw
          localStorage.removeItem('jwtToken')
          localStorage.removeItem('refreshToken')
          processQueue(new AuthError(), null)
          throw new AuthError()
        }

        const { jwt, refreshToken: newRefreshToken } = await refreshResponse.json()
        localStorage.setItem('jwtToken', jwt)
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken)
        }

        processQueue(null, jwt)
        isRefreshing = false

        // Retry original request with new token
        const newHeaders = {
          ...headers,
          Authorization: `Bearer ${jwt}`,
        }
        const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
          ...options,
          headers: newHeaders,
        })
        return handleRetryResponse(retryResponse)
      } catch (error) {
        isRefreshing = false
        processQueue(error, null)
        throw new AuthError()
      }
    }

    const errorData = await response.json().catch(() => ({}))
    const error = new Error(
      errorData.message || `Request failed with status ${response.status}`
    )
    error.status = response.status
    throw error
  }

  // Handle NO_CONTENT
  if (response.status === 204) return null

  return response.json()
}

export const api = {
  get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
  post: (endpoint, body) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint, body) =>
    apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
}
