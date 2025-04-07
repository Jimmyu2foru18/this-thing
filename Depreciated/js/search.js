import { getAllRecipes } from './recipeService.js';

$(document).ready(function() 
{
    $('#search-form').submit(function(e) 
	{
        e.preventDefault();
        
        $.ajax(
		{
            url: 'api/recipes.php',
            type: 'GET',
            data: {
                q: $('#search-input').val(),
                cuisine: $('#cuisine-filter').val()
            },
            success: function(data) 
			{
                displayResults(data);
            },
            error: function(xhr) 
			{
                showError(xhr.responseJSON?.error || 'Search failed');
            }
        });
    });
});

function displayResults(recipes) 
{
    const $grid = $('#results-grid').empty();
    recipes.forEach(recipe => 
	{
        $grid.append(`
            <div class="recipe-card">
                <h3>${$.escapeHtml(recipe.title)}</h3>
                <p>${$.escapeHtml(recipe.description)}</p>
            </div>
        `);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const resultsGrid = document.getElementById('results-grid');
    const resultsCount = document.getElementById('results-count');
    const sortSelect = document.getElementById('sort-select');
    const filters = {
        cuisineFilter: document.getElementById('cuisine-filter'),
        mealFilter: document.getElementById('meal-filter'),
        dietFilter: document.getElementById('diet-filter'),
        timeFilter: document.getElementById('time-filter'),
        allergenInputs: document.querySelectorAll('input[name="allergens"]')
    };
	
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q')) {
        searchInput.value = urlParams.get('q');
        performSearch();
    } else {
        loadRecentRecipes();
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        performSearch();
    });
    
    sortSelect.addEventListener('change', () => {
        sortResults();
    });
    filters.cuisineFilter.addEventListener('change', performSearch);
    filters.mealFilter.addEventListener('change', performSearch);
    filters.dietFilter.addEventListener('change', performSearch);
    filters.timeFilter.addEventListener('change', performSearch);
    
    filters.allergenInputs.forEach(input => {
        input.addEventListener('change', performSearch);
    });
    
    async function loadRecentRecipes() {
        try {
            const result = await getAllRecipes({ sort: 'latest', limit: 12 });
            
            if (result.success) {
                displayResults(result.recipes);
                resultsCount.textContent = `Showing ${result.recipes.length} recent recipes`;
            } else {
                showError('Failed to load recipes');
            }
        } catch (error) {
            console.error('Error loading recipes:', error);
            showError('Could not connect to recipe service');
        }
    }

    async function performSearch() {
        showLoading();
        const query = searchInput.value.trim();
        
        if (!query && !hasActiveFilters()) {
            loadRecentRecipes();
            return;
        }
        
        try {
            const filterParams = {
                query: query,
                cuisineType: filters.cuisineFilter.value,
                category: filters.mealFilter.value,
                dietary: filters.dietFilter.value,
                cookTime: filters.timeFilter.value,
                allergens: getSelectedAllergens()
            };
			
            Object.keys(filterParams).forEach(key => {
                if (!filterParams[key] || 
                    (Array.isArray(filterParams[key]) && filterParams[key].length === 0)) {
                    delete filterParams[key];
                }
            });
            const result = await getAllRecipes(filterParams);
            
            if (result.success) {
                displayResults(result.recipes);
            } else {
                showError(result.message || 'Failed to search recipes');
            }
        } catch (error) {
            console.error('Search error:', error);
            showError('Failed to perform search. Please try again.');
        }
    }
    
    function hasActiveFilters() {
        return (
            filters.cuisineFilter.value !== '' ||
            filters.mealFilter.value !== '' ||
            filters.dietFilter.value !== '' ||
            filters.timeFilter.value !== '' ||
            getSelectedAllergens().length > 0
        );
    }
    
    function displayResults(recipes) {
        hideLoading();
        resultsCount.textContent = `${recipes.length} results found`;
        
        if (recipes.length === 0) {
            resultsGrid.innerHTML = `
                <div class="no-results">
                    <h3>No recipes found</h3>
                    <p>Try adjusting your search terms or filters</p>
                </div>
            `;
            return;
        }
        
        resultsGrid.innerHTML = recipes.map(recipe => `
            <a href="recipe.html?id=${recipe.id}" class="recipe-card">
                <img src="${recipe.image || '../LOGO/recipe-placeholder.jpg'}" alt="${recipe.title}" class="recipe-image">
                <div class="recipe-content">
                    <h3 class="recipe-title">${recipe.title}</h3>
                    <div class="recipe-meta">
                        <span>${recipe.cookTime ? recipe.cookTime + ' min' : 'Quick'}</span>
                        <span>${recipe.difficulty || 'Easy'}</span>
                        ${recipe.rating ? `<span>★ ${recipe.rating}</span>` : ''}
                    </div>
                </div>
            </a>
        `).join('');
    }
    

    function sortResults() {
        const cards = Array.from(resultsGrid.querySelectorAll('.recipe-card'));
        const sortBy = sortSelect.value;
        
        if (cards.length === 0) return;
        resultsGrid.innerHTML = '';
        cards.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return getRating(b) - getRating(a);
                case 'time':
                    return getCookTime(a) - getCookTime(b);
                default:
                    return 0;
            }
        });
        cards.forEach(card => resultsGrid.appendChild(card));
    }
    
    function getRating(element) {
        const ratingEl = element.querySelector('.recipe-meta span:nth-child(3)');
        return ratingEl ? parseFloat(ratingEl.textContent.replace('★ ', '')) || 0 : 0;
    }
    function getCookTime(element) {
        const timeEl = element.querySelector('.recipe-meta span:first-child');
        return timeEl ? parseInt(timeEl.textContent) || 99 : 99;
    }
    function getSelectedAllergens() {
        return Array.from(filters.allergenInputs)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
    }
	
    function showError(message) {
        hideLoading();
        resultsGrid.innerHTML = `
            <div class="no-results">
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
}); 