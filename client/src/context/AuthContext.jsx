import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const checkAuthStatus = useCallback(async () => {
        try {
            // const response = await fetch('/api/auth/status');
            // if (response.status === 200 && response.json().user)
            const response = await axios.get('/api/auth/status', { withCredentials: true });
            if (response.status === 200 && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            } else {
                setUser(null);
                setIsAuthenticated(false);
                localStorage.removeItem('user');
            }
        } catch (err) {
            console.error('Auth status check failed:');
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuthStatus();
    }, [checkAuthStatus]);

    // useEffect(() => {
    //     const storedUser = localStorage.getItem('user');
    //     if (storedUser) {
    //         setUser(JSON.parse(storedUser));
    //         setIsAuthenticated(true);
    //         localStorage.setItem('isAuthenticated', true);
    //     }
    // }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('/api/auth/login', { username, password });
            if (response.status === 200 && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                return { success: true, user: response.data.user };
            }
        } catch (error) {
            console.error('Login failed:', error.response ? error.response.data.message : error.message);
            setUser(null);
            setIsAuthenticated(false);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        }
         return { success: false, message: 'Login failed' };
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);
            if (response.status === 201 && response.data.user) {
                setUser(response.data.user);
                setIsAuthenticated(true);
                return { success: true, user: response.data.user };
            }
            
        } catch (error) {
            console.error('Registration failed:', error.response ? error.response.data.message : error.message);
            setUser(null);
            setIsAuthenticated(false);
            return { success: false, message: error.response?.data?.message || 'Registration failed' };
        }
        return { success: false, message: 'Registration failed due to an unexpected issue' };
   };

    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout API call failed:', error.response ? error.response.data.message : error.message);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem('user');
            localStorage.setItem('isAuthenticated', false);
        }
    };

    const updateProfile = async (updatedData) => {
        console.log('updateProfile');
        try {
            const response = await axios.post('/api/auth/update', updatedData, {
                withCredentials: true
            });

            if (response.status === 200 && response.data.user) {
                setUser(response.data.user);
                return {
                    success: true,
                    user: response.data.user,
                    message: response.data.message
                };
            }
        } catch (error) {
            console.error('Profile update failed:', 
                error.response ? error.response.data.message : error.message
            );
            return {
                success: false,
                message: error.response?.data?.message || 'Profile update failed'
            };
        }
        return {
            success: false,
            message: 'Profile update failed due to an unexpected issue'
        };
    };

    const updatePassword = async (currentPassword, newPassword) => {
        try {
            const response = await axios.post('/api/auth/update/password', 
                { currentPassword, newPassword },
                { withCredentials: true }
            );

            if (response.status === 200) {
                return {
                    success: true,
                    message: response.data.message
                };
            }
        } catch (error) {
            console.error('Password update failed:', 
                error.response ? error.response.data.message : error.message
            );
            return {
                success: false,
                message: error.response?.data?.message || 'Password update failed'
            };
        }
        return {
            success: false,
            message: 'Password update failed due to an unexpected issue'
        };
    };

    const value = {
        user,
        isAuthenticated,
        login,
        logout,
        register,
        updateProfile,
        updatePassword,
        checkAuthStatus
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined)
        throw new Error('useAuth must be used within AuthProvider');
    return context;
}