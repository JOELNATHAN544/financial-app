const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';

const apiFetch = async (endpoint, options = {}) => {
    const jwtToken = localStorage.getItem('jwtToken');

    const headers = {
        'Content-Type': 'application/json',
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
            throw new Error('Unauthorized');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
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
