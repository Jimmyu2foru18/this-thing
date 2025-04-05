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

    // Add visibility toggle
    const visibilitySelect = document.createElement('select');
    visibilitySelect.id = 'recipe-visibility';
    visibilitySelect.className = 'form-input';
    visibilitySelect.innerHTML = `
        <option value="private" selected>Private</option>
        <option value="public">Public</option>
    `;
    const visibilityLabel = document.createElement('label');
    visibilityLabel.htmlFor = 'recipe-visibility';
    visibilityLabel.textContent = 'Recipe Visibility';
    const visibilityContainer = document.createElement('div');
    visibilityContainer.className = 'form-group';
    visibilityContainer.appendChild(visibilityLabel);
    visibilityContainer.appendChild(visibilitySelect);
    form.insertBefore(visibilityContainer, form.querySelector('.save-btn').parentElement);

    // Add preview button
    const previewBtn = document.createElement('button');
    previewBtn.type = 'button';
    previewBtn.className = 'preview-btn';
    previewBtn.textContent = 'Preview Recipe';
    previewBtn.onclick = showRecipePreview;
    form.querySelector('.save-btn').parentElement.insertBefore(previewBtn, form.querySelector('.save-btn'));

    // Create preview modal
    const previewModal = document.createElement('div');
    previewModal.id = 'preview-modal';
    previewModal.className = 'modal';
    previewModal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Recipe Preview</h2>
            <div class="preview-content">
                <img id="preview-image" class="recipe-image" src="" alt="Recipe Image">
                <h3 id="preview-title"></h3>
                <p id="preview-description"></p>
                <div class="recipe-meta">
                    <span id="preview-time"></span>
                    <span id="preview-servings"></span>
                    <span id="preview-difficulty"></span>
                </div>
                <div class="recipe-section">
                    <h4>Ingredients</h4>
                    <ul id="preview-ingredients"></ul>
                </div>
                <div class="recipe-section">
                    <h4>Instructions</h4>
                    <ol id="preview-steps"></ol>
                </div>
                <div class="recipe-section">
                    <h4>Nutrition Facts</h4>
                    <div id="preview-nutrition"></div>
                </div>
                <div class="recipe-section">
                    <h4>Notes</h4>
                    <p id="preview-notes"></p>
                </div>
                <div class="recipe-section">
                    <h4>Tags</h4>
                    <div id="preview-tags"></div>
                </div>
            </div>
            <div class="modal-actions">
                <button type="button" class="edit-btn">Edit Recipe</button>
                <button type="button" class="submit-btn">Submit Recipe</button>
            </div>
        </div>
    `;
    document.body.appendChild(previewModal);

    // Setup modal close button
    const closeBtn = previewModal.querySelector('.close');
    closeBtn.onclick = () => previewModal.style.display = 'none';
    previewModal.querySelector('.edit-btn').onclick = () => previewModal.style.display = 'none';
    previewModal.querySelector('.submit-btn').onclick = () => {
        previewModal.style.display = 'none';
        form.requestSubmit();
    };

    // Enhanced ingredient handling
    addIngredientBtn.addEventListener('click', addNewIngredient);
    
    // Enhanced step handling
    addStepBtn.addEventListener('click', addNewStep);

    // Setup initial remove buttons
    setupRemoveButtons();
    
    // Setup form submission
    form.addEventListener('submit', handleRecipeSubmission);
}
 
 function addNewIngredient() {
     const ingredientsList = document.getElementById('ingredients-list');
     const newItem = document.createElement('li');
     newItem.className = 'ingredient-item';
     
     // Create a unique ID for the new ingredient
     const ingredientId = `ingredient-${Date.now()}`;
     
     newItem.innerHTML = `
         <div class="ingredient-row" id="${ingredientId}">
             <input type="text" class="form-input ingredient-amount" placeholder="Amount" name="amount[]" required>
             <input type="text" class="form-input ingredient-unit" placeholder="Unit" name="unit[]" required>
             <input type="text" class="form-input ingredient-name" placeholder="Ingredient name" name="name[]" required>
         </div>
         <button type="button" class="remove-btn">Remove</button>
     `;
     
     ingredientsList.appendChild(newItem);
     
     // Setup validation and auto-formatting
     setupIngredientValidation(newItem);
     
     // Setup remove button
     const removeBtn = newItem.querySelector('.remove-btn');
     removeBtn.addEventListener('click', () => {
         ingredientsList.removeChild(newItem);
         validateForm();
     });
     
     // Focus on the first input of the new ingredient
     newItem.querySelector('.ingredient-amount').focus();
     validateForm();
 }
 
 function addNewStep() {
     const stepsList = document.getElementById('steps-list');
     const newItem = document.createElement('li');
     newItem.className = 'step-item';
     
     // Create a unique ID for the new step
     const stepId = `step-${Date.now()}`;
     
     newItem.innerHTML = `
         <div class="step-container" id="${stepId}">
             <span class="step-number">${stepsList.children.length + 1}.</span>
             <textarea class="form-textarea step-input" rows="2" placeholder="Enter instruction step" name="steps[]" required></textarea>
         </div>
         <button type="button" class="remove-btn">Remove</button>
     `;
     
     stepsList.appendChild(newItem);
     
     // Setup validation
     setupStepValidation(newItem);
     
     // Setup remove button
     const removeBtn = newItem.querySelector('.remove-btn');
     removeBtn.addEventListener('click', () => {
         stepsList.removeChild(newItem);
         updateStepNumbers();
         validateForm();
     });
     
     // Focus on the new textarea
     newItem.querySelector('.step-input').focus();
     validateForm();
 }
 
 function setupIngredientValidation(ingredientItem) {
     const amountInput = ingredientItem.querySelector('.ingredient-amount');
     const unitInput = ingredientItem.querySelector('.ingredient-unit');
     const nameInput = ingredientItem.querySelector('.ingredient-name');
     
     // Real-time validation
     [amountInput, unitInput, nameInput].forEach(input => {
         input.addEventListener('input', () => {
             validateIngredientField(input);
             validateForm();
         });
         
         input.addEventListener('blur', () => {
             validateIngredientField(input);
         });
     });
 }
 
 function setupStepValidation(stepItem) {
     const stepInput = stepItem.querySelector('.step-input');
     
     stepInput.addEventListener('input', () => {
         validateStepField(stepInput);
         validateForm();
     });
     
     stepInput.addEventListener('blur', () => {
         validateStepField(stepInput);
     });
 }
 
 function validateIngredientField(input) {
     const isValid = input.value.trim().length > 0;
     input.classList.toggle('error-field', !isValid);
     return isValid;
 }
 
 function validateStepField(input) {
     const isValid = input.value.trim().length > 0;
     input.classList.toggle('error-field', !isValid);
     return isValid;
 }
 
 function updateStepNumbers() {
     const stepsList = document.getElementById('steps-list');
     Array.from(stepsList.children).forEach((step, index) => {
         const stepNumber = step.querySelector('.step-number');
         if (stepNumber) {
             stepNumber.textContent = `${index + 1}.`;
         }
     });
 }
 
 function validateForm() {
     const submitButton = document.querySelector('.save-btn');
     const ingredients = document.querySelectorAll('.ingredient-item');
     const steps = document.querySelectorAll('.step-item');
     
     let isValid = true;
     
     // Validate ingredients
     ingredients.forEach(ingredient => {
         const inputs = ingredient.querySelectorAll('input');
         inputs.forEach(input => {
             if (!validateIngredientField(input)) {
                 isValid = false;
             }
         });
     });
     
     // Validate steps
     steps.forEach(step => {
         const textarea = step.querySelector('.step-input');
         if (!validateStepField(textarea)) {
             isValid = false;
         }
     });
     
     // Require at least one ingredient and one step
     if (ingredients.length === 0 || steps.length === 0) {
         isValid = false;
     }
     
     submitButton.disabled = !isValid;
     return isValid;
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

async function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId) || 
                 document.querySelector(`[name="${fieldId}"]`) ||
                 document.querySelector(`.${fieldId}`);
    if (field) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.25rem';
        
        // Insert after the field or its parent
        field.parentNode.insertBefore(errorElement, field.nextSibling);
        field.focus();
        
        // Add error class to highlight field
        field.classList.add('error-field');
        
        // Remove error class when user starts typing
        field.addEventListener('input', () => {
            field.classList.remove('error-field');
            const errorMsg = field.nextElementSibling;
            if (errorMsg && errorMsg.className === 'error-message') {
                errorMsg.remove();
            }
        }, { once: true });
    }
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
    const visibility = document.getElementById('recipe-visibility').value || 'private';
	
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
    const image = imageInput.files.length > 0 ? '../LOGO/recipe-placeholder.svg' : '../LOGO/recipe-placeholder.svg';
    
    // Get user information from localStorage
    const userToken = localStorage.getItem('userToken');
    const userProfile = JSON.parse(localStorage.getItem('userProfile')) || {};

    return {
        title,
        description,
        ingredients,
        steps,
        prepTime,
        cookTime,
        servings,
        visibility,
        user: {
            id: userProfile.id,
            username: userProfile.username,
            displayName: userProfile.displayName
        },
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
    // Clear previous error messages
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    
    let isValid = true;
    
    // Title validation
    if (!recipeData.title) {
        showFieldError('recipe-title', 'Please enter a recipe title');
        isValid = false;
    } else if (recipeData.title.length > 100) {
        showFieldError('recipe-title', 'Title must be less than 100 characters');
        isValid = false;
    }
    
    // Description validation
    if (!recipeData.description) {
        showFieldError('recipe-description', 'Please enter a recipe description');
        isValid = false;
    } else if (recipeData.description.length > 500) {
        showFieldError('recipe-description', 'Description must be less than 500 characters');
        isValid = false;
    }
    
    // Time validation
    if (recipeData.prepTime < 0 || recipeData.cookTime < 0) {
        showFieldError('prep-time', 'Time values cannot be negative');
        isValid = false;
    }
    
    // Servings validation
    if (recipeData.servings <= 0) {
        showFieldError('servings', 'Servings must be greater than 0');
        isValid = false;
    }
    
    // Ingredients validation
    if (recipeData.ingredients.length === 0) {
        showFieldError('ingredients-list', 'Please add at least one ingredient');
        isValid = false;
    } else {
        recipeData.ingredients.forEach((ing, index) => {
            if (!ing.name) {
                showFieldError(`ingredient-name-${index}`, 'Ingredient name is required');
                isValid = false;
            }
        });
    }
    
    // Steps validation
    if (recipeData.steps.length === 0) {
        showFieldError('steps-list', 'Please add at least one instruction step');
        isValid = false;
    } else {
        recipeData.steps.forEach((step, index) => {
            if (!step) {
                showFieldError(`step-input-${index}`, 'Instruction step cannot be empty');
                isValid = false;
            }
        });
    }
    
    // Image validation
    const imageInput = document.getElementById('recipe-image');
    if (imageInput.files.length === 0) {
        showFieldError('recipe-image', 'Please upload an image for your recipe');
        isValid = false;
    } else {
        const file = imageInput.files[0];
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            showFieldError('recipe-image', 'Only JPG, PNG or WEBP images are allowed');
            isValid = false;
        }
        if (file.size > 5 * 1024 * 1024) { // 5MB
            showFieldError('recipe-image', 'Image size must be less than 5MB');
            isValid = false;
        }
    }
    
    return isValid;
    }
    
    if (recipeData.mealTypes.length === 0) {
        alert('Please select at least one meal type');
        return false;
    }
    
    return true;
function showRecipePreview() {
    const recipeData = collectFormData();
    
    // Update preview modal with current form data
    document.getElementById('preview-image').src = document.getElementById('recipe-image-preview').src;
    document.getElementById('preview-title').textContent = recipeData.title;
    document.getElementById('preview-description').textContent = recipeData.description;
    
    // Update meta information
    document.getElementById('preview-time').textContent = `Prep: ${recipeData.prepTime}min | Cook: ${recipeData.cookTime}min`;
    document.getElementById('preview-servings').textContent = `Serves: ${recipeData.servings}`;
    document.getElementById('preview-difficulty').textContent = `Difficulty: ${recipeData.difficulty}`;
    
    // Update ingredients list
    const ingredientsList = document.getElementById('preview-ingredients');
    ingredientsList.innerHTML = '';
    recipeData.ingredients.forEach(ing => {
        const li = document.createElement('li');
        li.textContent = `${ing.amount} ${ing.unit} ${ing.name}`;
        ingredientsList.appendChild(li);
    });
    
    // Update steps list
    const stepsList = document.getElementById('preview-steps');
    stepsList.innerHTML = '';
    recipeData.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsList.appendChild(li);
    });
    
    // Update nutrition information
    const nutritionDiv = document.getElementById('preview-nutrition');
    nutritionDiv.innerHTML = `
        <p>Calories: ${recipeData.nutrition.calories || 'N/A'}</p>
        <p>Protein: ${recipeData.nutrition.protein || 'N/A'}g</p>
        <p>Carbs: ${recipeData.nutrition.carbs || 'N/A'}g</p>
        <p>Fats: ${recipeData.nutrition.fats || 'N/A'}g</p>
        <p>Fiber: ${recipeData.nutrition.fiber || 'N/A'}g</p>
        <p>Sugar: ${recipeData.nutrition.sugar || 'N/A'}g</p>
    `;
    
    // Update notes
    document.getElementById('preview-notes').textContent = recipeData.notes || 'No notes provided';
    
    // Update tags
    const tagsDiv = document.getElementById('preview-tags');
    tagsDiv.innerHTML = '';
    const allTags = [
        ...recipeData.mealTypes,
        ...recipeData.categories,
        ...recipeData.dietaryCategories
    ];
    allTags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = tag;
        tagsDiv.appendChild(span);
    });
    
    // Show the modal
    document.getElementById('preview-modal').style.display = 'block';
}