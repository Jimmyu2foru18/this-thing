document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    setupEventListeners();
});

function setupEventListeners() {
    const avatarInput = document.getElementById('avatar');
    avatarInput.addEventListener('change', handleAvatarChange);

    const form = document.getElementById('edit-profile-form');
    form.addEventListener('submit', handleSubmit);
}

async function loadUserProfile() {
    try {
        const userData = await fetchUserProfile();
        populateForm(userData);
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
    }
}

function populateForm(userData) {
    document.getElementById('display-name').value = userData.name || '';
    document.getElementById('bio').value = userData.bio || '';

    if (userData.avatar) {
        const preview = document.getElementById('avatar-preview');
        preview.innerHTML = `<img src="${userData.avatar}" alt="Profile picture">`;
    }

    if (userData.preferences) {
        const cuisines = userData.preferences.cuisines || [];
        cuisines.forEach(cuisine => {
            const checkbox = document.querySelector(`input[value="${cuisine}"]`);
            if (checkbox) checkbox.checked = true;
        });
        document.getElementById('dietary').value = userData.preferences.diet || 'none';
        document.getElementById('skill-level').value = userData.preferences.skillLevel || 'beginner';
        document.getElementById('cooking-time').value = userData.preferences.cookingTime || 'any';
    }
}

function handleAvatarChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('avatar-preview');
            preview.innerHTML = `<img src="${e.target.result}" alt="Profile picture preview">`;
        };
        reader.readAsDataURL(file);
    }
}

async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const userData = {
        name: formData.get('displayName'),
        bio: formData.get('bio'),
        preferences: {
            cuisines: Array.from(formData.getAll('cuisines')),
            diet: formData.get('dietary'),
            skillLevel: formData.get('skillLevel'),
            cookingTime: formData.get('cookingTime')
        }
    };

    try {
        await saveUserProfile(userData);
        showSuccess('Profile updated successfully!');
        setTimeout(() => {
            window.location.href = 'profile.html';
        }, 1500);
    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile changes');
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showSuccess(message) {
    showNotification(message, 'success');
}

function showError(message) {
    showNotification(message, 'error');
}



//how to write api

async function fetchUserProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    return savedProfile ? JSON.parse(savedProfile) : {
        name: '',
        bio: '',
        preferences: {
            cuisines: [],
            diet: 'none',
            skillLevel: 'beginner',
            cookingTime: 'any'
        }
    };
}

async function saveUserProfile(userData) {
    localStorage.setItem('userProfile', JSON.stringify(userData));
    return { success: true };
} 