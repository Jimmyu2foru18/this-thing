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
    servings: 4,
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    meals: {}
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
                        <input type="text" 
                               class="meal-input"
                               data-day="${day}"
                               data-type="${type}"
                               placeholder="Enter ${type.toLowerCase()}..."
                               value="${getMealValue(day, type)}">
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
	
    document.getElementById('creation-date').textContent = new Date().toLocaleDateString();
    
    // Initialize servings
    document.getElementById('servings').value = currentPlan.servings;
    
    // Setup macro sliders
    setupMacroSliders();
}

function setupMacroSliders() {
    const proteinSlider = document.getElementById('protein-slider');
    const carbsSlider = document.getElementById('carbs-slider');
    const fatsSlider = document.getElementById('fats-slider');
    
    const proteinValue = document.getElementById('protein-value');
    const carbsValue = document.getElementById('carbs-value');
    const fatsValue = document.getElementById('fats-value');
    
    // Update values when sliders change
    proteinSlider.addEventListener('input', () => {
        proteinValue.textContent = proteinSlider.value;
        updateMacros();
    });
    
    carbsSlider.addEventListener('input', () => {
        carbsValue.textContent = carbsSlider.value;
        updateMacros();
    });
    
    fatsSlider.addEventListener('input', () => {
        fatsValue.textContent = fatsSlider.value;
        updateMacros();
    });
    
    function updateMacros() {
        const protein = parseInt(proteinSlider.value);
        const carbs = parseInt(carbsSlider.value);
        const fats = parseInt(fatsSlider.value);
        
        // Ensure total is 100%
        const total = protein + carbs + fats;
        
        if (total !== 100) {
            const dailyCalories = document.getElementById('calorie-goal').value;
            document.getElementById('daily-calories').textContent = dailyCalories;
        }
    }
}

function setupEventListeners() 
{
    document.getElementById('plan-name').addEventListener('input', debounce(updatePlanMeta, 500));
    document.getElementById('plan-notes').addEventListener('input', debounce(updatePlanMeta, 500));
    document.getElementById('servings').addEventListener('change', debounce(updatePlanMeta, 500));
    document.getElementById('week-start-date').addEventListener('change', debounce(updatePlanMeta, 500));
    document.getElementById('calorie-goal').addEventListener('input', debounce(updateCalories, 500));

    document.querySelectorAll('.meal-input').forEach(input => 
	{
        input.addEventListener('input', debounce(updateMeal, 500));
    });

    document.getElementById('save-plan').addEventListener('click', savePlan);
    document.getElementById('clear-plan').addEventListener('click', clearPlan);
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

function updateMeal(event) 
{
    const input = event.target;
    const day = input.dataset.day;
    const type = input.dataset.type;
    
    if (!currentPlan.meals[day]) {
        currentPlan.meals[day] = {};
    }
    currentPlan.meals[day][type] = input.value;
    
    // Update filled state
    const mealSlot = input.closest('.meal-slot');
    if (input.value.trim()) {
        mealSlot.classList.add('filled');
    } else {
        mealSlot.classList.remove('filled');
    }
    
    showAutosaveIndicator();
}

function getMealValue(day, type) 
{
    return currentPlan.meals[day]?.[type] || '';
}

async function savePlan() 
{
    try {
        if (!currentPlan.name) 
		{
            alert('Please enter a plan name');
            return;
        }

        // Format the meal plan data to match the backend structure
        const formattedMeals = {};
        DAYS.forEach(day => {
            if (currentPlan.meals[day]) {
                formattedMeals[day] = {};
                MEAL_TYPES.forEach(type => {
                    if (currentPlan.meals[day][type]) {
                        formattedMeals[day][type] = {
                            title: currentPlan.meals[day][type]
                        };
                    }
                });
            }
        });
        
        const planToSave = {
            ...currentPlan,
            meals: formattedMeals,
            servings: parseInt(currentPlan.servings),
        };
        
        // Call the API service (if implemented)
        // const savedPlan = await saveMealPlanToProfile(planToSave);
        // currentPlan.id = savedPlan.id;
        
        // For now, save to localStorage
        localStorage.setItem('savedMealPlan', JSON.stringify(planToSave));
        
        showSuccess('Meal plan saved successfully!');
    } 
	catch (error) 
	{
        console.error('Error saving meal plan:', error);
        showError('Failed to save meal plan');
    }
}

function clearPlan() 
{
    if (confirm('Are you sure you want to clear all meals?')) 
	{
        currentPlan.meals = {};
		
        document.querySelectorAll('.meal-input').forEach(input => 
		{
            input.value = '';
            input.closest('.meal-slot').classList.remove('filled');
        });
        
        showAutosaveIndicator();
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