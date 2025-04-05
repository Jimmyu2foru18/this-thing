import { getAllRecipes } from './recipeService.js';

document.addEventListener('DOMContentLoaded', () => {
    const categoryButtons = document.querySelectorAll('.category-btn');
    const recipesGrid = document.getElementById('recipes-grid');
    const totalRatings = document.getElementById('total-ratings');
    const totalReviews = document.getElementById('total-reviews');

    let currentCategory = 'all-time';
    loadTopRecipes(currentCategory);

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            const category = button.dataset.category;
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentCategory = category;
            loadTopRecipes(category);
        });
    });

    async function loadTopRecipes(category) 
    {
        try {
            recipesGrid.innerHTML = '<div class="loading-spinner">Loading...</div>';
            
            const recipes = await fetchTopRecipes(category);
            
            if (recipes.length === 0) {
                recipesGrid.innerHTML = '<p class="no-results">No recipes found for this category.</p>';
                return;
            }
            
            displayRecipes(recipes);
            updateStats(recipes);
        } catch (error) {
            console.error('Error loading top recipes:', error);
            showError('Failed to load recipes. Please try again later.');
        }
    }

    function displayRecipes(recipes) 
    {
        recipesGrid.innerHTML = '';
        
        const topRecipes = recipes.slice(0, 10);
        
        topRecipes.forEach((recipe, index) => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'recipe-card';
            
            recipeCard.innerHTML = `
                <div class="recipe-rank">${index + 1}</div>
                <img src="${recipe.image || '../LOGO/recipe-placeholder.svg'}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span class="meta-item"><i class="meta-icon">⭐</i> ${recipe.rating.toFixed(1)}</span>
                        <span class="meta-item"><i class="meta-icon">👨‍🍳</i> ${recipe.difficulty || 'Easy'}</span>
                        <span class="meta-item"><i class="meta-icon">⏱️</i> ${recipe.cookTime + recipe.prepTime} min</span>
                    </div>
                </div>
            `;

            recipeCard.addEventListener('click', () => {
                window.location.href = `recipe.html?id=${recipe.id || recipe._id}`;
            });
            
            recipesGrid.appendChild(recipeCard);
        });
    }


    function updateStats(recipes) 
    {
        let ratings = 0;
        let reviews = 0;
        
        recipes.forEach(recipe => {
            ratings += recipe.starCount || 0;
            reviews += recipe.reviewCount || 0;
        });
        totalRatings.textContent = ratings.toLocaleString();
        totalReviews.textContent = reviews.toLocaleString();
    }

    function showError(message) 
    {
        recipesGrid.innerHTML = `<p class="error-message">${message}</p>`;
    }

    async function fetchTopRecipes(category) {
        let filters = {};
        let recipes = [];
        
        try {
            switch (category) {
                case 'all-time':
                    filters.sort = 'rating';
                    filters.timeFrame = 'all';
                    break;
                case 'this-week':
                    filters.sort = 'rating';
                    filters.timeFrame = 'week';
                    // Ensure we only get recipes from the past week
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    filters.createdAfter = oneWeekAgo.toISOString();
                    break;
                case 'trending':
                    filters.sort = 'views';
                    filters.timeFrame = 'week';
                    // Get trending recipes from past week
                    const trendingWeekAgo = new Date();
                    trendingWeekAgo.setDate(trendingWeekAgo.getDate() - 7);
                    filters.createdAfter = trendingWeekAgo.toISOString();
                    break;
                case 'highest-rated':
                    filters.sort = 'rating';
                    filters.minRating = 4.5;
                    break;
                default:
                    filters.sort = 'rating';
                    filters.timeFrame = 'all';
            }
            
            filters.limit = 20; // Fetch more recipes to ensure we have enough after filtering

            const result = await getAllRecipes(filters);
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch recipes');
            }

            recipes = result.recipes;

            // Apply category-specific sorting and filtering
            switch (category) {
                case 'this-week':
                    const oneWeekAgo = new Date();
                    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                    recipes = recipes.filter(recipe => new Date(recipe.createdAt) >= oneWeekAgo);
                    recipes.sort((a, b) => b.rating - a.rating);
                    break;
                case 'trending':
                    recipes.sort((a, b) => (b.views || 0) - (a.views || 0));
                    break;
                case 'highest-rated':
                    recipes = recipes.filter(recipe => recipe.rating >= 4.5);
                    recipes.sort((a, b) => b.rating - a.rating);
                    break;
                default:
                    recipes.sort((a, b) => b.rating - a.rating);
            }

            // If we don't have enough recipes after filtering, add random recipes
            if (recipes.length < 10) {
                const remainingCount = 10 - recipes.length;
                const randomResult = await getAllRecipes({ limit: remainingCount, sort: 'random' });
                if (randomResult.success) {
                    // Mark random recipes with a fallback flag for UI indication
                    const markedRandomRecipes = randomResult.recipes.map(recipe => ({
                        ...recipe,
                        isFallback: true
                    }));
                    recipes = [...recipes, ...markedRandomRecipes];
                }
            }

            // Return only the top 10 recipes
            return recipes.slice(0, 10);

        } catch (error) {
            console.error('Error fetching recipes:', error);
            // Fallback to random recipes if there's an error
            const fallbackResult = await getAllRecipes({ limit: 10, sort: 'random' });
            return fallbackResult.success ? fallbackResult.recipes : [];
        }
    }
});