import { registerUser, checkAuthStatus } from './authService.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is already authenticated
    const authStatus = await checkAuthStatus();
    if (authStatus.success) {
        window.location.href = 'profile.html';
        return;
    }
    const signupForm = document.getElementById('signup-form');
    const googleSignup = document.querySelector('.social-btn');
    const inputs = signupForm.querySelectorAll('.form-input');
    const submitButton = signupForm.querySelector('button[type="submit"]');
    const passwordToggles = document.querySelectorAll('.password-toggle');

    const patterns = {
        username: /^[a-zA-Z0-9_]{3,20}$/,
        email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        password: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/,
        displayName: /^.{2,50}$/
    };

    inputs.forEach(input => {
        input.addEventListener('input', () => {
            validateInput(input);
            checkFormValidity();
        });
    });

    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const passwordField = toggle.previousElementSibling;
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            const icon = toggle.querySelector('i');
            if (type === 'text') {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const displayName = document.getElementById('display-name').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsCheckbox = document.getElementById('terms');
        let isValid = true;
        
        document.querySelectorAll('.form-input[required]').forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        
        if (!isValid) {
            showError('Please correct the errors in the form.');
            return;
        }
        
        if (password !== confirmPassword) {
            showInputError('confirm-password', 'Passwords do not match');
            isValid = false;
            return;
        }
        
        if (!termsCheckbox.checked) {
            showInputError('terms', 'You must agree to the Terms & Privacy Policy');
            isValid = false;
            return;
        }
        
        if (!isValid) return;

        submitButton.disabled = true;
        submitButton.innerHTML = 'Creating Account...';
        
        try {
            const userData = {
                username,
                email,
                password,
                displayName: displayName || username,
                preferences: {
                    cuisineTypes: [],
                    dietary: [],
                    skillLevel: 'Beginner',
                    cookingTime: 30
                }
            }

            const response = await registerUser(userData);
            
            if (response.success) {
                // Show success message with loading animation
                const successMessage = document.createElement('div');
                successMessage.className = 'success-message';
                successMessage.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    <span>Account created successfully!</span>
                    <div class="loading-dots">
                        <span>Redirecting</span>
                        <span class="dots">...</span>
                    </div>
                `;
                
                const errorContainer = document.getElementById('error-container');
                if (errorContainer) {
                    errorContainer.style.display = 'none';
                    errorContainer.parentNode.insertBefore(successMessage, errorContainer);
                }
                
                // Initialize user preferences
                let retries = 3;
                while (retries > 0) {
                    try {
                        const prefResponse = await fetch(`${AUTH_API_URL}/preferences`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${response.token}`
                            },
                            body: JSON.stringify(userData.preferences)
                        });
                        
                        if (!prefResponse.ok) {
                            throw new Error(`HTTP error! status: ${prefResponse.status}`);
                        }
                        break;
                    } catch (error) {
                        console.error(`Error setting initial preferences (${4-retries}/3):`, error);
                        retries--;
                        if (retries === 0) {
                            showError('Warning: Your account was created but preferences could not be saved. You can set them later in your profile.');
                        } else {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                }
                
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            } else {
                showError(response.message || 'Registration failed. Please try again.');
                submitButton.disabled = false;
                submitButton.innerHTML = 'Create Account';
            }
        } catch (error) {
            console.error('Registration error:', error);
            showError('An error occurred during registration. Please try again.');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Create Account';
        }
    });

    if (googleSignup) {
        googleSignup.addEventListener('click', () => {
            // This would normally trigger OAuth flow with Google
            showError('Google sign up is not implemented in this version.');
        });
    }


    function validateInput(input) {
        const field = input.id;
        const value = input.value.trim();
        clearInputError(field);
        if (!input.hasAttribute('required') && value === '') {
            return true;
        }
        if (input.hasAttribute('required') && value === '') {
            showInputError(field, 'This field is required');
            return false;
        }
        switch (field) {
            case 'username':
                if (!patterns.username.test(value)) {
                    showInputError(field, 'Username must be 3-20 characters and can only contain letters, numbers, and underscores');
                    return false;
                }
                break;
                
            case 'email':
                if (!patterns.email.test(value)) {
                    showInputError(field, 'Please enter a valid email address');
                    return false;
                }
                break;
                
            case 'password':
                if (!patterns.password.test(value)) {
                    showInputError(field, 'Password must be at least 8 characters long');
                    return false;
                }
                break;
                
            case 'display-name':
                if (!patterns.displayName.test(value)) {
                    showInputError(field, 'Display name must be 2-50 characters');
                    return false;
                }
                break;
                
            case 'confirm-password':
                const password = document.getElementById('password').value;
                if (value !== password) {
                    showInputError(field, 'Passwords do not match');
                    return false;
                }
                break;
        }
        
        return true;
    }
    
    function checkFormValidity() {
        let isValid = true;
        
        document.querySelectorAll('.form-input[required]').forEach(input => {
            if (input.value.trim() === '' || input.classList.contains('error')) {
                isValid = false;
            }
        });
        if (!document.getElementById('terms').checked) {
            isValid = false;
        }
        if (submitButton) {
            submitButton.disabled = !isValid;
        }
        
        return isValid;
    }
    
    function showInputError(field, message) {
        const errorElement = document.querySelector(`.input-error[data-for="${field}"]`);
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.classList.add('visible');
        }
        
        if (inputElement) {
            inputElement.classList.add('error');
        }
    }
    
    function clearInputError(field) {
        const errorElement = document.querySelector(`.input-error[data-for="${field}"]`);
        const inputElement = document.getElementById(field);
        
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.classList.remove('visible');
        }
        
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }
    
    function showError(message) {
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        
        if (errorContainer && errorMessage) {
            errorMessage.textContent = message;
            errorContainer.style.display = 'block';
            errorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
});