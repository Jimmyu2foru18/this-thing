const AUTH_API_URL = 'http://localhost:5000/api/users';

// Token management functions
const getToken = () => localStorage.getItem('userToken');
const setToken = (token) => localStorage.setItem('userToken', token);
const removeToken = () => localStorage.removeItem('userToken');

// User data management functions
const setUserData = (user) => {
    localStorage.setItem('userId', user._id);
    localStorage.setItem('username', user.username);
    localStorage.setItem('displayName', user.displayName || user.username);
    localStorage.setItem('isAuthenticated', 'true');
    if (user.isAdmin) {
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminToken', getToken());
    }
};

const clearUserData = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
};

// Export auth service functions
window.registerUser = registerUser;
window.authenticateUser = authenticateUser;
window.logoutUser = logoutUser;
window.checkAuthStatus = checkAuthStatus;
window.updateUserProfile = updateUserProfile;
window.resetPassword = resetPassword;

async function registerUser(userData) {
    const validationErrors = validateUserData(userData);
    if (validationErrors.length > 0) {
        return {
            success: false,
            message: validationErrors.join(', ')
        };
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Registration failed'
            };
        }
        if (data.token) {
            setToken(data.token);
            setUserData(data.user);
        }

        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Registration error:', error);
        return {
            success: false,
            message: 'Unable to connect to authentication service'
        };
    }
}
function validateUserData(userData) {
    const errors = [];
    
    if (!userData.username || userData.username.length < 3) {
        errors.push('Username must be at least 3 characters long');
    }
    
    if (!userData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        errors.push('Please provide a valid email address');
    }
    
    if (!userData.password || userData.password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }
    
    return errors;
}

async function authenticateUser(userInput, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                userInput, 
                password 
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Authentication failed'
            };
        }
        if (data.token) {
            setToken(data.token);
            setUserData(data.user);
        }

        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return {
            success: false,
            message: 'Unable to connect to authentication service'
        };
    }
}
async function getUserProfile() {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(`${AUTH_API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch profile'
            };
        }

        return {
            success: true,
            profile: data
        };
    } catch (error) {
        console.error('Profile fetch error:', error);
        return {
            success: false,
            message: 'Unable to connect to profile service'
        };
    }
}
async function updateUserProfile(profileData, avatar = null) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        let requestOptions = {};
        
        if (avatar) {
            const formData = new FormData();
            Object.entries(profileData).forEach(([key, value]) => {
                formData.append(key, value);
            });
            formData.append('avatar', avatar);
            
            requestOptions = {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            };
        } else {
            requestOptions = {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileData)
            };
        }
        
        const response = await fetch(`${AUTH_API_URL}/profile`, requestOptions);

        const data = await response.json();

        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to update profile'
            };
        }
        if (profileData.username) {
            localStorage.setItem('username', profileData.username);
        }
        if (profileData.displayName) {
            localStorage.setItem('displayName', profileData.displayName);
        }

        return {
            success: true,
            profile: data.user
        };
    } catch (error) {
        console.error('Profile update error:', error);
        return {
            success: false,
            message: 'Unable to connect to profile service'
        };
    }
}

async function checkAuthStatus() {
    const token = getToken();
    if (!token) {
        return {
            success: false,
            message: 'No authentication token found'
        };
    }

    try {
        const response = await fetch(`${AUTH_API_URL}/verify`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            removeToken();
            clearUserData();
            return {
                success: false,
                message: data.message || 'Authentication failed'
            };
        }

        return {
            success: true,
            user: data.user
        };
    } catch (error) {
        console.error('Auth status check error:', error);
        return {
            success: false,
            message: 'Unable to verify authentication status'
        };
    }
}

function logoutUser() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    
    window.location.href = 'signin.html';
}

function isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true';
}
function isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
}
export {
    registerUser,
    authenticateUser,
    getUserProfile,
    updateUserProfile,
    logoutUser,
    isAuthenticated,
    isAdmin
};