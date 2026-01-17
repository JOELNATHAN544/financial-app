const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8082';

const apiFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    if (response.status === 204) return null;
    return response.json();
};

export const api = {
    get: (endpoint, token) => apiFetch(endpoint, {
        method: 'GET',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }),
    post: (endpoint, body, token) => apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }),
    delete: (endpoint, token) => apiFetch(endpoint, {
        method: 'DELETE',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    }),
};
