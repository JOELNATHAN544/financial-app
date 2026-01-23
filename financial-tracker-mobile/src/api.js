import AsyncStorage from '@react-native-async-storage/async-storage';

// Hardcoded fallback for physical device testing when .env loading is flaky
const DEV_BACKEND_IP = '192.168.1.104';
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || `http://${DEV_BACKEND_IP}:8082`;

let isRefreshing = false;
let failedQueue = [];
let onUnauthorized = null;

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const apiFetch = async (endpoint, options = {}) => {
    const jwtToken = await AsyncStorage.getItem('jwtToken');

    const headers = {
        'Content-Type': 'application/json',
        ...(jwtToken && { 'Authorization': `Bearer ${jwtToken}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            // Handle 401 Unauthorized - Attempt token refresh
            if (response.status === 401) {
                const refreshToken = await AsyncStorage.getItem('refreshToken');

                if (!refreshToken) {
                    await AsyncStorage.multiRemove(['jwtToken', 'refreshToken']);
                    if (onUnauthorized) onUnauthorized();
                    throw new Error('Unauthorized');
                }

                if (isRefreshing) {
                    return new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    }).then(token => {
                        return fetch(`${API_BASE_URL}${endpoint}`, {
                            ...options,
                            headers: { ...headers, 'Authorization': `Bearer ${token}` }
                        }).then(res => res.json());
                    });
                }

                isRefreshing = true;

                try {
                    const refreshResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refreshToken }),
                    });

                    if (!refreshResponse.ok) {
                        await AsyncStorage.multiRemove(['jwtToken', 'refreshToken']);
                        processQueue(new Error('Refresh failed'), null);
                        isRefreshing = false;
                        if (onUnauthorized) onUnauthorized();
                        throw new Error('Session expired');
                    }

                    const { jwt, refreshToken: newRefreshToken } = await refreshResponse.json();
                    await AsyncStorage.setItem('jwtToken', jwt);
                    if (newRefreshToken) {
                        await AsyncStorage.setItem('refreshToken', newRefreshToken);
                    }

                    processQueue(null, jwt);
                    isRefreshing = false;

                    // Retry original request
                    return fetch(`${API_BASE_URL}${endpoint}`, {
                        ...options,
                        headers: { ...headers, 'Authorization': `Bearer ${jwt}` }
                    }).then(res => res.json());

                } catch (err) {
                    isRefreshing = false;
                    processQueue(err, null);
                    throw err;
                }
            }

            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.message || `Request failed with status ${response.status}`;
            console.error(`API Error [${endpoint}]:`, errorMessage);
            throw new Error(errorMessage);
        }

        if (response.status === 204) return null;
        return response.json();
    } catch (error) {
        console.error(`Network Error [${endpoint}]:`, error.message);
        throw error;
    }
};

export const api = {
    get: (endpoint) => apiFetch(endpoint, { method: 'GET' }),
    post: (endpoint, body) => apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
    }),
    put: (endpoint, body) => apiFetch(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body)
    }),
    delete: (endpoint) => apiFetch(endpoint, { method: 'DELETE' }),

    // Auth specific
    saveTokens: async (jwt, refreshToken) => {
        await AsyncStorage.setItem('jwtToken', jwt);
        if (refreshToken) await AsyncStorage.setItem('refreshToken', refreshToken);
    },
    clearTokens: async () => {
        await AsyncStorage.multiRemove(['jwtToken', 'refreshToken']);
    },
    getTokens: async () => {
        return {
            jwtToken: await AsyncStorage.getItem('jwtToken'),
            refreshToken: await AsyncStorage.getItem('refreshToken')
        };
    },
    setOnUnauthorized: (callback) => {
        onUnauthorized = callback;
    }
};
