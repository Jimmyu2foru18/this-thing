import { authenticateUser } from './authService.js';

document.addEventListener('DOMContentLoaded', () => {
    const signinForm = document.getElementById('signin-form');
    const googleSignin = document.querySelector('.google-signin');
    const errorMessage = document.getElementById('error-message');
    const submitButton = signinForm.querySelector('button[type="submit"]');

    // Check if user is already authenticated
    const checkAuth = async () => {
        const authStatus = await checkAuthStatus();
        if (authStatus.success) {
            const redirectUrl = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
            window.location.href = redirectUrl;
        }
    };
    checkAuth();

    signinForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userInput = document.getElementById('user-input').value.trim();
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('remember-me')?.checked;

        if (!userInput || !password) {
            showError('Please provide both username/email and password');
            return;
        }

        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';

        try {
            // Special case for admin login
            if ((userInput.toLowerCase() === 'admin@recspicy.com' || userInput.toLowerCase() === 'admin') 
                && password === 'admin123') {
                localStorage.setItem('adminToken', 'admin-token');
                localStorage.setItem('isAdmin', 'true');
                localStorage.setItem('username', 'admin');
                localStorage.setItem('displayName', 'Administrator');
                localStorage.setItem('userId', 'admin');
                localStorage.setItem('isAuthenticated', 'true');
                
                window.location.href = 'pages/admin.html';
                return;
            }

            const result = await authenticateUser(userInput, password);
            
            if (result.success) {
                if (rememberMe) {
                    // Set a longer expiration for the session
                    localStorage.setItem('sessionExpiry', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());
                }
                
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect') || 'index.html';
                window.location.href = redirectUrl;
            } else {
                showError(result.message || 'Invalid credentials');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Sign In';
            }

        } catch (error) {
            console.error('Authentication error:', error);
            showError('An error occurred during sign in. Please try again.');
        }
    });

    // Google sign-in button
    googleSignin.addEventListener('click', () => {
        showError('Google sign-in is not available yet. Please use email and password.');
    });
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('unauthorized') === 'true') {
        showError('Please sign in to access this page');
    }
});

function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function signOut() {
    localStorage.clear(); // Clear all authentication-related data
    sessionStorage.clear(); // Clear any session data
    
    // Redirect to signin page
    const baseUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    window.location.href = baseUrl + 'signin.html';
    
    // Prevent any cached data from persisting
    if (window.history && window.history.pushState) {
        window.history.pushState('', document.title, window.location.pathname);
    }
}
window.signOut = signOut;