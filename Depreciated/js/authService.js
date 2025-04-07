const AUTH_API_URL = '/api/users';

async function registerUser(userData) {
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
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('displayName', data.user.displayName || data.user.username);
            localStorage.setItem('isAuthenticated', 'true');
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
            localStorage.setItem('userToken', data.token);
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('username', data.user.username);
            localStorage.setItem('displayName', data.user.displayName || data.user.username);
            localStorage.setItem('isAuthenticated', 'true');
            
            if (data.user.isAdmin) {
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('adminToken', data.token);
            }
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