import { createRecipe } from './recipeService.js';

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('userToken')) {
        window.location.href = 'signin.html?redirect=create-recipe.html';
        return;
    }

    setupFormHandlers();
    setupImageUpload();
});

function setupFormHandlers() {
    const form = document.getElementById('create-recipe-form');
    const addIngredientBtn = document.getElementById('add-ingredient');
    const addStepBtn = document.getElementById('add-step');
    addIngredientBtn.addEventListener('click', () => {
        const ingredientsList = document.getElementById('ingredients-list');
        const newItem = document.createElement('li');
        newItem.className = 'ingredient-item';
        newItem.innerHTML = `
            <div class="ingredient-row">
                <input type="text" class="form-input ingredient-amount" placeholder="Amount" name="amount[]">
                <input type="text" class="form-input ingredient-unit" placeholder="Unit" name="unit[]">
                <input type="text" class="form-input ingredient-name" placeholder="Ingredient name" name="name[]" required>
            </div>
            <button type="button" class="remove-btn">Remove</button>
        `;
        ingredientsList.appendChild(newItem);
        const removeBtn = newItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            ingredientsList.removeChild(newItem);
        });
    });
    addStepBtn.addEventListener('click', () => {
        const stepsList = document.getElementById('steps-list');
        const newItem = document.createElement('li');
        newItem.className = 'step-item';
        newItem.innerHTML = `
            <textarea class="form-textarea step-input" rows="2" placeholder="Enter instruction step" name="steps[]" required></textarea>
            <button type="button" class="remove-btn">Remove</button>
        `;
        stepsList.appendChild(newItem);
        const removeBtn = newItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            stepsList.removeChild(newItem);
        });
    });
    const removeButtons = document.querySelectorAll('.remove-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.closest('li');
            const list = item.parentElement;
            list.removeChild(item);
        });
    });
    form.addEventListener('submit', handleRecipeSubmission);
}

function setupImageUpload() {
    const imageInput = document.getElementById('recipe-image');
    const imagePreview = document.getElementById('recipe-image-preview');
    
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagePreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
}

async function handleRecipeSubmission(event) {
    event.preventDefault();
    
    try {
        const submitButton = document.querySelector('.save-btn');
        const originalText = submitButton.textContent;
        submitButton.textContent = 'Creating...';
        submitButton.disabled = true;
        const recipeData = collectFormData();
		
        if (!validateRecipeData(recipeData)) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
            return;
        }

        const token = localStorage.getItem('userToken');
        const response = await createRecipe(recipeData, token);
        
        if (response.success) {
            alert('Recipe created successfully!');
            window.location.href = `recipe.html?id=${response.recipe.id}`;
        } 
		else {
            alert(response.message || 'Failed to create recipe. Please try again.');
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error('Error creating recipe:', error);
        alert('An error occurred while creating the recipe. Please try again.');
        const submitButton = document.querySelector('.save-btn');
        submitButton.textContent = 'Create Recipe';
        submitButton.disabled = false;
    }
}

function collectFormData() {
    const title = document.getElementById('recipe-title').value.trim();
    const description = document.getElementById('recipe-description').value.trim();
    const prepTime = parseInt(document.getElementById('prep-time').value) || 0;
    const cookTime = parseInt(document.getElementById('cooking-time').value) || 0;
    const servings = parseInt(document.getElementById('servings').value) || 4;
    const difficulty = document.getElementById('difficulty').value;
    const cuisineType = document.getElementById('cuisine-type').value;
	
    const mealTypeCheckboxes = document.querySelectorAll('input[name="meal-type"]:checked');
    const mealTypes = Array.from(mealTypeCheckboxes).map(checkbox => checkbox.value);
	
    const dietaryCheckboxes = document.querySelectorAll('input[name="dietary-category"]:checked');
    const dietaryCategories = Array.from(dietaryCheckboxes).map(checkbox => checkbox.value);
    
    const ingredientItems = document.querySelectorAll('.ingredient-item');
    const ingredients = Array.from(ingredientItems).map(item => {
        const amount = item.querySelector('.ingredient-amount').value.trim();
        const unit = item.querySelector('.ingredient-unit').value.trim();
        const name = item.querySelector('.ingredient-name').value.trim();
        
        return {
            name,
            amount: amount ? parseFloat(amount) || amount : null,
            unit: unit || null
        };
    }).filter(ingredient => ingredient.name);
    const stepInputs = document.querySelectorAll('.step-input');
    const steps = Array.from(stepInputs)
        .map(input => input.value.trim())
        .filter(step => step);

    const calories = parseInt(document.getElementById('calories').value) || null;
    const protein = parseInt(document.getElementById('protein').value) || null;
    const carbs = parseInt(document.getElementById('carbs').value) || null;
    const fats = parseInt(document.getElementById('fats').value) || null;
    const fiber = parseInt(document.getElementById('fiber').value) || null;
    const sugar = parseInt(document.getElementById('sugar').value) || null;
    
    const notes = document.getElementById('recipe-notes').value.trim();
    
    const imageInput = document.getElementById('recipe-image');
    const image = imageInput.files.length > 0 ? '../LOGO/recipe-placeholder.jpg' : '../LOGO/recipe-placeholder.jpg';
    
    return {
        title,
        description,
        ingredients,
        steps,
        prepTime,
        cookTime,
        servings,
        nutrition: {
            calories,
            protein,
            carbs,
            fats,
            fiber,
            sugar
        },
        mealTypes,
        categories: cuisineType ? [cuisineType] : [],
        dietaryCategories,
        difficulty,
        image,
        notes
    };
}

function validateRecipeData(recipeData) {
    if (!recipeData.title) {
        alert('Please enter a recipe title');
        return false;
    }
    
    if (!recipeData.description) {
        alert('Please enter a recipe description');
        return false;
    }
    
    if (recipeData.ingredients.length === 0) {
        alert('Please add at least one ingredient');
        return false;
    }
    
    if (recipeData.steps.length === 0) {
        alert('Please add at least one instruction step');
        return false;
    }
    
    if (recipeData.mealTypes.length === 0) {
        alert('Please select at least one meal type');
        return false;
    }
    
    return true;
} 