export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

export class AuthError extends Error {
    constructor(message = 'Unauthorized access') {
        super(message);
        this.name = 'AuthError';
    }
}

const apiFetch = async (endpoint, options = {}) => {
    const jwtToken = localStorage.getItem('jwtToken');

    console.log(`[API] Fetching ${endpoint} with token prefix: ${jwtToken ? jwtToken.substring(0, 10) + '...' : 'NONE'}`);

    const hasBody = options.body !== undefined && options.body !== null;
    const headers = {
        ...(hasBody && { 'Content-Type': 'application/json' }),
        ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        // If unauthorized, we might want to trigger a logout or refresh
        if (response.status === 401 || response.status === 403) {
            // Custom event or simple throw for handling in components
            throw new AuthError();
        }
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        throw error;
    }

    // Handle NO_CONTENT
    if (response.status === 204) return null;

    return response.json();
};

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint, body) => apiFetch(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),
};
