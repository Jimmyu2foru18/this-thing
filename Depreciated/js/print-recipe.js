document.addEventListener('DOMContentLoaded', () => 
{
    const urlParams = new URLSearchParams(window.location.search);
    const recipeId = urlParams.get('id');

    if (recipeId)
	{
        loadRecipeForPrint(recipeId);
        setupEventListeners();
    } 
	else {
        showError('Recipe not found');
    }
});



function setupEventListeners() 
{
    document.getElementById('print-btn').addEventListener('click', () => 
	{
        window.print();
    });

    document.getElementById('back-btn').addEventListener('click', () => 
	{
        window.history.back();
    });
}



async function loadRecipeForPrint(recipeId) {
    try {
        const recipe = await fetchRecipeDetails(recipeId);
        updatePrintUI(recipe);
    } catch (error) {
        console.error('Error loading recipe:', error);
        showError('Failed to load recipe');
    }
}




function updatePrintUI(recipe) 
{
    document.title = `Print: ${recipe.title} - Recspicy`;
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('cook-time').textContent = `${recipe.cookTime} mins`;
    document.getElementById('servings').textContent = `${recipe.servings} servings`;
    document.getElementById('difficulty').textContent = recipe.difficulty;

    const recipeImage = document.getElementById('recipe-image');
    recipeImage.src = recipe.image;
    recipeImage.alt = recipe.title;
    document.getElementById('recipe-description').textContent = recipe.description;
    
	const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = recipe.ingredients.map(ingredient => 
        `<li>${ingredient}</li>`
    ).join('');

    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = recipe.instructions.map((instruction, index) => 
        `<li>${instruction}</li>`
    ).join('');

    const nutritionFacts = document.getElementById('nutrition-facts');
    nutritionFacts.innerHTML = Object.entries(recipe.nutrition).map(([key, value]) => `
        <div class="nutrition-item">
            <span class="nutrition-label">${key}</span>
            <span class="nutrition-value">${value}${key === 'calories' ? '' : 'g'}</span>
        </div>
    `).join('');
    document.getElementById('recipe-notes').textContent = recipe.notes || 'No additional notes.';
    document.getElementById('recipe-url').textContent = window.location.origin + '/recipe/' + recipe.id;
    document.getElementById('print-date').textContent = new Date().toLocaleDateString();
}




function showError(message) 
{
    document.querySelector('.print-container').innerHTML = `
        <div class="error-message">
            <h2>Error</h2>
            <p>${message}</p>
        </div>
    `;
}
