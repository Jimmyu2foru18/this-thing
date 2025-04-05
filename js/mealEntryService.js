// Service to handle meal entry functionality
class MealEntryService {
    constructor() {
        this.recentMeals = [];
        this.loadRecentMeals();
        this.currentPlan = null;
    }

    async saveMealPlan(planData) {
        try {
            const response = await fetch('/api/meal-plans', {
                method: planData.id ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(planData)
            });
            
            if (!response.ok) throw new Error('Failed to save meal plan');
            
            const savedPlan = await response.json();
            this.currentPlan = savedPlan;
            return savedPlan;
        } catch (error) {
            console.error('Error saving meal plan:', error);
            throw error;
        }
    }

    async loadMealPlan(planId) {
        try {
            const response = await fetch(`/api/meal-plans/${planId}`);
            if (!response.ok) throw new Error('Failed to load meal plan');
            
            const plan = await response.json();
            this.currentPlan = plan;
            return plan;
        } catch (error) {
            console.error('Error loading meal plan:', error);
            throw error;
        }
    }

    async deleteMealPlan(planId) {
        try {
            const response = await fetch(`/api/meal-plans/${planId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete meal plan');
            this.currentPlan = null;
            return true;
        } catch (error) {
            console.error('Error deleting meal plan:', error);
            throw error;
        }
    }

    showSuggestions(input) {
        let suggestionsContainer = document.getElementById('meal-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'meal-suggestions';
            document.body.appendChild(suggestionsContainer);
        }

        const rect = input.getBoundingClientRect();
        suggestionsContainer.style.position = 'absolute';
        suggestionsContainer.style.top = `${rect.bottom}px`;
        suggestionsContainer.style.left = `${rect.left}px`;
        suggestionsContainer.style.width = `${rect.width}px`;

        suggestionsContainer.innerHTML = this.suggestions
            .map(recipe => `
                <div class="suggestion-item" data-recipe-id="${recipe.id}">
                    <div class="suggestion-title">${recipe.title}</div>
                    <div class="suggestion-meta">
                        <span>${recipe.calories} cal</span>
                        <span>${recipe.prepTime} min</span>
                    </div>
                </div>
            `)
            .join('');

        suggestionsContainer.style.display = 'block';

        // Add click handlers
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => this.selectRecipe(item, input));
        });
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('meal-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    async selectRecipe(suggestionElement, input) {
        const recipeId = suggestionElement.dataset.recipeId;
        const recipe = this.suggestions.find(r => r.id === recipeId);
        
        if (recipe) {
            input.value = recipe.title;
            this.addToRecentMeals(recipe);
            
            // Trigger meal update
            const updateEvent = new CustomEvent('mealupdate', {
                detail: {
                    day: input.dataset.day,
                    type: input.dataset.type,
                    recipe: recipe
                }
            });
            input.dispatchEvent(updateEvent);
        }
        
        this.hideSuggestions();
    }

    addToRecentMeals(recipe) {
        this.recentMeals = [
            recipe,
            ...this.recentMeals.filter(r => r.id !== recipe.id)
        ].slice(0, 5);
        
        localStorage.setItem('recentMeals', JSON.stringify(this.recentMeals));
        this.updateRecentMealsUI();
    }

    loadRecentMeals() {
        try {
            const saved = localStorage.getItem('recentMeals');
            this.recentMeals = saved ? JSON.parse(saved) : [];
            this.updateRecentMealsUI();
        } catch (error) {
            console.error('Error loading recent meals:', error);
            this.recentMeals = [];
        }
    }

    updateRecentMealsUI() {
        const container = document.getElementById('recent-meals');
        if (!container) return;

        container.innerHTML = this.recentMeals
            .map(recipe => `
                <div class="recent-meal" data-recipe-id="${recipe.id}">
                    <div class="recent-meal-title">${recipe.title}</div>
                    <div class="recent-meal-meta">
                        <span>${recipe.calories} cal</span>
                        <span>${recipe.prepTime} min</span>
                    </div>
                </div>
            `)
            .join('');

        // Add drag and drop functionality
        container.querySelectorAll('.recent-meal').forEach(meal => {
            meal.draggable = true;
            meal.addEventListener('dragstart', this.handleDragStart.bind(this));
        });
    }

    handleDragStart(event) {
        const recipeId = event.target.dataset.recipeId;
        const recipe = this.recentMeals.find(r => r.id === recipeId);
        if (recipe) {
            event.dataTransfer.setData('text/plain', JSON.stringify(recipe));
        }
    }
}

// Initialize the service
const mealEntryService = new MealEntryService();
export default mealEntryService;