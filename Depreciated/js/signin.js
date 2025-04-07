import { authenticateUser } from './authService.js';

document.addEventListener('DOMContentLoaded', () => 
{
    const signinForm = document.getElementById('signin-form');
    const googleSignin = document.querySelector('.google-signin');
    const errorMessage = document.getElementById('error-message');

    signinForm.addEventListener('submit', async (e) => 
	{
        e.preventDefault();
        
        const userInput = document.getElementById('user-input').value;
        const password = document.getElementById('password').value;

        try 
		{
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
            if (!userInput || !password) {
                showError('Please provide both username/email and password');
                return;
            }

            const result = await authenticateUser(userInput, password);
            
            if (result.success) {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUrl = urlParams.get('redirect') || 'index.html';
                window.location.href = redirectUrl;
            } else {
                showError(result.message);
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

function showError(message) 
{
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

function signOut() 
{
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('displayName');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminToken');
    
    window.location.href = 'signin.html';
}
window.signOut = signOut;