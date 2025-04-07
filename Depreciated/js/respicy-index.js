document.addEventListener('DOMContentLoaded', () => 
{
    loadTrendingRecipes();
    loadFeaturedRecipes();
    loadRecommendedRecipes();
    initializeFilters();
});

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', () => 
		{
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            filterRecipes(filter);
        });
    });
}

async function loadTrendingRecipes() 
{
    try {
        const recipes = await fetchTrendingRecipes();
        displayRecipes('trending-recipes', recipes);
    } catch (error) {
        console.error('Error loading trending recipes:', error);
        showError('trending-recipes');
    }
}

async function loadFeaturedRecipes() 
{
    try {
        const recipes = await fetchFeaturedRecipes();
        displayRecipes('featured-recipes', recipes);
    } catch (error) {
        console.error('Error loading featured recipes:', error);
        showError('featured-recipes');
    }
}

async function loadRecommendedRecipes() 
{
    try {
        const recipes = await fetchRecommendedRecipes();
        displayRecipes('recommended-recipes', recipes);
    } catch (error) {
        console.error('Error loading recommended recipes:', error);
        showError('recommended-recipes');
    }
}

function displayRecipes(containerId, recipes) 
{
    const container = document.getElementById(containerId);
    
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card" data-categories="${recipe.categories.join(' ')}">
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
                <div class="recipe-meta">
                    <div class="recipe-stats">
                        <span class="stat-item">
                            <i class="stat-icon">⏱️</i>
                            ${recipe.cookTime} mins
                        </span>
                        <span class="stat-item">
                            <i class="stat-icon">⭐</i>
                            ${recipe.rating}
                        </span>
                    </div>
                    <span>${recipe.difficulty}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterRecipes(filter) 
{
    const allRecipes = document.querySelectorAll('.recipe-card');
    
    allRecipes.forEach(recipe => 
	{
        const categories = recipe.dataset.categories.split(' ');
        if (filter === 'all' || categories.includes(filter)) 
		{
            recipe.style.display = 'block';
        } 
		else 
		{
            recipe.style.display = 'none';
        }
    });
}

function showError(containerId) 
{
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="error-message">
            Failed to load recipes. Please try again later.
        </div>
    `;
}
