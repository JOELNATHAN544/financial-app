import React, { useState, useEffect } from 'react';
import { api } from '../api';

const ProfileSettings = ({ user, onUpdate, onDelete, onCancel }) => {
    const [username, setUsername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        try {
            const updates = {};
            if (username !== user.username) updates.username = username;
            if (email !== user.email) updates.email = email;
            if (password) updates.password = password;

            if (Object.keys(updates).length === 0) {
                setMessage('No changes to update.');
                return;
            }

            await api.put('/api/users/me', updates);
            setMessage('Profile updated successfully!');
            onUpdate();
        } catch (err) {
            setError(err.message || 'Failed to update profile.');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                await api.delete('/api/users/me');
                onDelete();
            } catch (err) {
                setError('Failed to delete account.');
            }
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Settings</h2>
            {message && <div className="mb-4 text-green-600 text-sm font-medium">{message}</div>}
            {error && <div className="mb-4 text-red-600 text-sm font-medium">{error}</div>}

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                        type="email"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password (leave blank to keep current)</label>
                    <input
                        type="password"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition"
                    >
                        Update Profile
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                </div>
            </form>

            <div className="mt-10 pt-6 border-t border-gray-100 text-center">
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                    Permanently Delete Account
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
