import mealEntryService from './mealEntryService.js';

document.addEventListener('DOMContentLoaded', () => {
    initializePlanner();
    setupEventListeners();
    loadSavedPlan();
});

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

let currentPlan = {
    id: null,
    name: '',
    notes: '',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    meals: {},
    lastModified: new Date().toISOString()
};

function initializePlanner() {
    const weekGrid = document.getElementById('week-grid');
    weekGrid.innerHTML = DAYS.map(day => `
        <div class="day-card">
            <div class="day-header">${day}</div>
            <div class="meal-slots">
                ${MEAL_TYPES.map(type => `
                    <div class="meal-slot">
                        <div class="meal-type">${type}</div>
                        <textarea 
                            class="meal-input"
                            data-day="${day}"
                            data-type="${type}"
                            placeholder="Enter your ${type.toLowerCase()} plan..."
                            rows="2">${getMealValue(day, type)}</textarea>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    document.getElementById('creation-date').textContent = new Date().toLocaleDateString();
    document.getElementById('plan-name').value = currentPlan.name || '';
}

// Removed macro sliders setup as per requirements

function setupEventListeners() {
    document.getElementById('plan-name').addEventListener('input', debounce(updatePlanMeta, 500));
    document.getElementById('plan-notes').addEventListener('input', debounce(updatePlanMeta, 500));
    document.getElementById('week-start-date').addEventListener('change', debounce(updatePlanMeta, 500));

    // Save button handler
    document.getElementById('save-plan').addEventListener('click', savePlan);
    
    // Clear button handler
    document.getElementById('clear-plan').addEventListener('click', clearPlan);

    document.querySelectorAll('.meal-input').forEach(input => {
        input.addEventListener('input', debounce(handleMealUpdate, 500));
    });
}

async function savePlan() {
    try {
        currentPlan.lastModified = new Date().toISOString();
        const savedPlan = await mealEntryService.saveMealPlan(currentPlan);
        showNotification('Meal plan saved successfully!');
        
        // Update the current plan with the saved version
        currentPlan = savedPlan;
        
        // Refresh the profile page meal plans if we're editing from there
        if (window.opener && window.opener.refreshMealPlans) {
            window.opener.refreshMealPlans();
        }
    } catch (error) {
        console.error('Error saving meal plan:', error);
        showNotification('Failed to save meal plan', 'error');
    }
}

function clearPlan() {
    if (confirm('Are you sure you want to clear the current meal plan?')) {
        currentPlan.meals = {};
        initializePlanner();
        showNotification('Meal plan cleared');
    }
}

function handleMealUpdate(event) {
    const input = event.target;
    const day = input.dataset.day;
    const type = input.dataset.type;
    const value = input.value.trim();

    if (!currentPlan.meals[day]) {
        currentPlan.meals[day] = {};
    }
    currentPlan.meals[day][type] = value;
}

function getMealValue(day, type) {
    return currentPlan.meals[day]?.[type] || '';
}

async function loadSavedPlan() {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');
    
    if (planId) {
        try {
            const plan = await mealEntryService.loadMealPlan(planId);
            currentPlan = plan;
            initializePlanner();
            showNotification('Meal plan loaded successfully!');
        } catch (error) {
            console.error('Error loading meal plan:', error);
            showNotification('Failed to load meal plan', 'error');
        }
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function updatePlanMeta() {
    currentPlan.name = document.getElementById('plan-name').value;
    currentPlan.notes = document.getElementById('plan-notes').value;
    currentPlan.startDate = document.getElementById('week-start-date').value;
    currentPlan.lastModified = new Date().toISOString();
// Remove stray closing bracket

    document.getElementById('save-plan').addEventListener('click', savePlan);
    document.getElementById('clear-plan').addEventListener('click', clearPlan);
    document.getElementById('quick-add').addEventListener('click', showQuickAddModal);
}

function updatePlanMeta() 
{
    currentPlan.name = document.getElementById('plan-name').value;
    currentPlan.notes = document.getElementById('plan-notes').value;
    currentPlan.servings = document.getElementById('servings').value;
    
    const startDate = document.getElementById('week-start-date').value;
    if (startDate) {
        currentPlan.startDate = new Date(startDate).toISOString();
    }
    
    showAutosaveIndicator();
}

function updateCalories() {
    const calorieGoal = document.getElementById('calorie-goal').value;
    document.getElementById('daily-calories').textContent = calorieGoal;
    showAutosaveIndicator();
}

function handleMealUpdate(event) {
    const { day, type, recipe } = event.detail;
    
    if (!currentPlan.meals[day]) {
        currentPlan.meals[day] = {};
    }

    currentPlan.meals[day][type] = {
        recipe: recipe,
        title: recipe.title,
        calories: recipe.calories,
        prepTime: recipe.prepTime
    };

    updateNutritionSummary();
    savePlan();
}

function setupDragAndDrop() {
    const mealSlots = document.querySelectorAll('.meal-slot');
    
    mealSlots.forEach(slot => {
        slot.addEventListener('dragover', (e) => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });

        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });

        slot.addEventListener('drop', handleMealDrop);
    });
}

function handleMealDrop(event) {
    event.preventDefault();
    const slot = event.target.closest('.meal-slot');
    slot.classList.remove('drag-over');

    try {
        const recipe = JSON.parse(event.dataTransfer.getData('text/plain'));
        const input = slot.querySelector('.meal-input');
        
        if (input && recipe) {
            input.value = recipe.title;
            const updateEvent = new CustomEvent('mealupdate', {
                detail: {
                    day: input.dataset.day,
                    type: input.dataset.type,
                    recipe: recipe
                }
            });
            input.dispatchEvent(updateEvent);
            
            // Update nutrition summary immediately
            updateNutritionSummary();
            
            // Show success feedback
            showFeedback('Recipe added successfully!', 'success');
        }
    } catch (error) {
        console.error('Error handling drop:', error);
        showFeedback('Failed to add recipe', 'error');
    }
}

function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback ${type}`;
    feedback.textContent = message;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.classList.add('fade-out');
        setTimeout(() => feedback.remove(), 300);
    }, 3000);
}

function showQuickAddModal() {
    const modal = document.createElement('div');
    modal.className = 'quick-add-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3>Quick Add Meal</h3>
            <div class="modal-tabs">
                <button class="tab-btn active" data-tab="manual">Manual Entry</button>
                <button class="tab-btn" data-tab="suggestions">Recipe Suggestions</button>
            </div>
            
            <div class="tab-content active" data-tab="manual">
                <input type="text" id="quick-meal-name" placeholder="Meal name">
                <input type="number" id="quick-meal-calories" placeholder="Calories">
                <input type="number" id="quick-meal-prep-time" placeholder="Prep time (minutes)">
            </div>
            
            <div class="tab-content" data-tab="suggestions">
                <div class="suggestions-container">
                    <div class="suggestion-filters">
                        <input type="text" id="suggestion-search" placeholder="Search recipes...">
                        <select id="suggestion-cuisine">
                            <option value="">All Cuisines</option>
                            <option value="italian">Italian</option>
                            <option value="mexican">Mexican</option>
                            <option value="asian">Asian</option>
                        </select>
                    </div>
                    <div class="suggestions-list"></div>
                </div>
            </div>
            
            <div class="modal-actions">
                <button id="quick-add-save">Add</button>
                <button id="quick-add-cancel">Cancel</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    modal.querySelector('#quick-add-save').addEventListener('click', () => {
        const name = document.getElementById('quick-meal-name').value;
        const calories = document.getElementById('quick-meal-calories').value;
        const prepTime = document.getElementById('quick-meal-prep-time').value;

        if (name && calories) {
            const customMeal = {
                id: 'custom-' + Date.now(),
                title: name,
                calories: parseInt(calories),
                prepTime: parseInt(prepTime) || 0,
                isCustom: true
            };
            mealEntryService.addToRecentMeals(customMeal);
        }

        modal.remove();
    });

    modal.querySelector('#quick-add-cancel').addEventListener('click', () => {
        modal.remove();
    });
}

function getMealValue(day, type) 
{
    return currentPlan.meals[day]?.[type] || '';
}

async function savePlan() {
    try {
        const response = await mealPlanService.saveMealPlan(currentPlan);
        if (response.success) {
            currentPlan.id = response.planId;
            showFeedback('Meal plan saved successfully!', 'success');
            generateShoppingList();
        } else {
            showFeedback('Failed to save meal plan', 'error');
        }
    } catch (error) {
        console.error('Error saving meal plan:', error);
        showFeedback('Error saving meal plan', 'error');
    }
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

function initializeShoppingList() {
    const printButton = document.getElementById('print-shopping-list');
    if (printButton) {
        printButton.disabled = !currentPlan || Object.keys(currentPlan.meals).length === 0;
    }
}

function handlePrintShoppingList() {
    if (currentPlan && Object.keys(currentPlan.meals).length > 0) {
        printShoppingList(currentPlan);
    } else {
        showNotification('Please add meals to your plan first', 'warning');
    }
}

function clearPlan() {
    if (confirm('Are you sure you want to clear this meal plan?')) {
        currentPlan = {
            id: null,
            name: '',
            notes: '',
            servings: 4,
            startDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            meals: {}
        };
        initializePlanner();
        document.getElementById('shopping-list').innerHTML = '';
        showFeedback('Meal plan cleared', 'info');
    }
}

function loadSavedPlan() 
{
    const savedPlan = localStorage.getItem('currentMealPlan');
    if (savedPlan) 
	{
        currentPlan = JSON.parse(savedPlan);
        
        document.getElementById('plan-name').value = currentPlan.name || '';
        document.getElementById('plan-notes').value = currentPlan.notes || '';
        document.getElementById('servings').value = currentPlan.servings || 4;
        
        // Set the start date if available
        if (currentPlan.startDate) {
            const date = new Date(currentPlan.startDate);
            const formattedDate = date.toISOString().split('T')[0];
            document.getElementById('week-start-date').value = formattedDate;
        }
        
        // Update meal inputs
        document.querySelectorAll('.meal-input').forEach(input => 
		{
            const day = input.dataset.day;
            const type = input.dataset.type;
            const value = getMealValue(day, type);
            input.value = value;
            
            // Add filled class if needed
            if (value.trim()) {
                input.closest('.meal-slot').classList.add('filled');
            }
        });
    }
}

function showAutosaveIndicator() 
{
    localStorage.setItem('currentMealPlan', JSON.stringify(currentPlan));
    
    const indicator = document.getElementById('autosave-indicator');
    indicator.classList.add('show');
    
    setTimeout(() => 
	{
        indicator.classList.remove('show');
    }, 2000);
}

function showSuccess(message) {
    alert(message);
}

function showError(message) {
    alert(message);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) 
	{
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}