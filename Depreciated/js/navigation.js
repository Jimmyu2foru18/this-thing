document.addEventListener("DOMContentLoaded", function () {
    const navContainer = document.getElementById("nav-container");
    if (navContainer) {
        navContainer.innerHTML = `
            <nav class="nav-container">
                <div class="nav-title-bar">
                    <div class="nav-title-content">
                        <a href="respicy-index.html" class="nav-brand">The Recspicy Index</a>
                        <div class="nav-account">
                            <div class="nav-dropdown">
                                <button class="nav-link">Account</button>
                                <div class="nav-dropdown-content">
                                    <a href="profile.html" class="nav-dropdown-link">Profile</a>
                                    <a href="#" onclick="handleSignOut()" class="nav-dropdown-link">Sign Out</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="nav-main">
                    <div class="nav-content">
                        <div class="nav-links">
                            <a href="respicy-index.html" class="nav-link">Home</a>
                            
                            <div class="nav-dropdown">
                                <button class="nav-link">Browse</button>
                                <div class="nav-dropdown-content">
                                    <a href="by-meal.html" class="nav-dropdown-link">By Meal</a>
                                    <a href="dietary.html" class="nav-dropdown-link">Dietary Restrictions</a>
                                </div>
                            </div>

                            <a href="top10.html" class="nav-link">Top 10's</a>
                            <a href="random.html" class="nav-link">Random Recipe</a>
                            <a href="full-index.html" class="nav-link">Full Index</a>
                            <a href="meal-planner.html" class="nav-link">Meal Planner</a>
                            <a href="search.html" class="nav-link">Search</a>
                            
                            <form class="nav-search" action="search.html" method="GET">
                                <input type="search" 
                                       name="q" 
                                       class="nav-search-input"
                                       placeholder="Search recipes...">
                                <button type="submit" class="nav-search-button">
                                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </nav>
        `;
        setupNavigation();
    }
});

function setupNavigation() {
    const searchForm = document.querySelector('.nav-search');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const query = e.target.querySelector('input').value;
            if (query.trim()) {
                window.location.href = `search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

function handleSignOut() 
{
    localStorage.removeItem('userToken');
    localStorage.removeItem('rememberUser');
    window.location.href = 'landing.html';
}

function updateNavigation() 
{
    const userToken = localStorage.getItem('userToken');
    const adminToken = localStorage.getItem('adminToken');
    const userRole = localStorage.getItem('userRole');

    const navContainer = document.getElementById('nav-container');
    
    let navContent = `
        <div class="nav-title-bar">
            <div class="nav-title-content">
                <a href="respicy-index.html" class="nav-title">Recspicy</a>
                <div class="nav-links">
    `;

    if (userToken || adminToken) 
	{
        navContent += `
            <a href="search.html" class="nav-link">Search</a>
            ${userRole === 'admin' ? '<a href="admin.html" class="nav-link">Admin</a>' : ''}
            <div class="nav-account">
                <button class="nav-link" onclick="toggleDropdown()">Account</button>
                <div class="nav-dropdown" id="account-dropdown">
                    <a href="profile.html" class="nav-dropdown-link">Profile</a>
                    <a href="#" class="nav-dropdown-link" onclick="signOut()">Sign Out</a>
                </div>
            </div>
        `;
    } 
	else 
	{
        navContent += `
            <a href="search.html" class="nav-link">Search</a>
            <a href="signin.html" class="nav-link">Sign In</a>
            <a href="signup.html" class="nav-link">Sign Up</a>
        `;
    }

    navContent += `
                </div>
            </div>
        </div>
    `;

    navContainer.innerHTML = navContent;
} 