document.addEventListener('DOMContentLoaded', () => 
{
    const generateBtn = document.getElementById('generate-btn');
    const saveBtn = document.getElementById('save-btn');
    const shareBtn = document.getElementById('share-btn');
    const printBtn = document.getElementById('print-btn');


    generateRandomRecipe();
    setupEventListeners();

    generateBtn.addEventListener('click', generateRandomRecipe);
    saveBtn.addEventListener('click', saveRecipe);
	
    shareBtn.addEventListener('click', shareRecipe);
    printBtn.addEventListener('click', () => navigateToPrintPage(currentRecipe.id));
});



async function generateRandomRecipe() 
{
    const container = document.querySelector('.recipe-container');
    container.classList.add('loading');

    try 
	{
        const recipe = await fetchRandomRecipe();
        currentRecipe = recipe;
		
        updateRecipeUI(recipe);
        checkUserInteractions(recipe.id);

        window.scrollTo({ top: 0, behavior: 'smooth' });
    } 
	catch (error) 
	{
        console.error('Error generating recipe:', error);
        showError('Failed to generate recipe');
    } 
	finally 
	{
        container.classList.remove('loading');
    }
}



function updateRecipeUI(recipe) 
{
    document.getElementById('recipe-image').src = recipe.image;
    document.getElementById('recipe-image').alt = recipe.title;
    document.getElementById('recipe-title').textContent = recipe.title;
    document.getElementById('cook-time').textContent = `${recipe.cookTime} mins`;
    document.getElementById('servings').textContent = `${recipe.servings} servings`;
    document.getElementById('difficulty').textContent = recipe.difficulty;
    document.getElementById('recipe-description').textContent = recipe.description;
    document.getElementById('star-count').textContent = recipe.stars;


    const ingredientsList = document.getElementById('ingredients-list');
    ingredientsList.innerHTML = recipe.ingredients.map(ingredient => 
        `<li>${ingredient}</li>`
    ).join('');


    const instructionsList = document.getElementById('instructions-list');
    instructionsList.innerHTML = recipe.instructions.map(instruction => 
        `<li>${instruction}</li>`
    ).join('');


    document.getElementById('recipe-notes').textContent = recipe.notes || 'No additional notes.';


    const nutritionFacts = document.getElementById('nutrition-facts');
    nutritionFacts.innerHTML = Object.entries(recipe.nutrition).map(([key, value]) => `
        <div class="nutrition-item">
            <span class="nutrition-label">${key}</span>
            <span class="nutrition-value">${value}${key === 'calories' ? '' : 'g'}</span>
        </div>
    `).join('');


    const tagsContainer = document.getElementById('recipe-tags');
    tagsContainer.innerHTML = recipe.tags.map(tag => 
        `<span class="recipe-tag">${tag}</span>`
    ).join('');


    document.title = `${recipe.title} - Random Recipe - Recspicy`;
}

function saveRecipe() 
{
    const userToken = localStorage.getItem('userToken');
    if (!userToken) 
	{
        alert('Please sign in to save recipes');
        return;
    }
    alert('Recipe saved to your favorites!');
}

function shareRecipe() 
{
    if (navigator.share) 
	{
        navigator.share(
		{
            title: document.getElementById('recipe-title').textContent,
            text: 'Check out this recipe I found on Recspicy!',
            url: window.location.href
        }).catch(console.error);
    } 
	else 
	{
        const recipeUrl = window.location.href;
        navigator.clipboard.writeText(recipeUrl)
            .then(() => alert('Recipe link copied to clipboard!'))
            .catch(console.error);
    }
}



function navigateToPrintPage(recipeId) 
{
    window.location.href = `print-recipe.html?id=${recipeId}`;
}



function showError(message) 
{
    const recipeSection = document.getElementById('recipe-section');
    recipeSection.innerHTML = `
        <div class="error-message">
            ${message}
        </div>
    `;
}




// Mock API
async function fetchRandomRecipe() 
{
    return 
	{
        id: Math.floor(Math.random() * 1000),
        title: 'Random Spicy Thai Basil Chicken',
        image: 'https://source.unsplash.com/800x600/?thaifood',
        cookTime: 30,
        servings: 4,
        difficulty: 'Intermediate',
        stars: 128,
        description: 'A fragrant and spicy Thai street food classic...',
        ingredients: 
		[
            '400g chicken breast, diced',
            '4 cloves garlic, minced',
            '3 Thai chilies, sliced',
            '2 cups Thai basil leaves',
            '2 tbsp soy sauce'
        ],
        instructions: 
		[
            'Heat oil in a wok over high heat.',
            'Add garlic and chilies, stir-fry for 30 seconds.',
            'Add chicken and cook until golden brown.',
            'Add sauces and stir to combine.',
            'Toss in Thai basil leaves and cook until wilted.'
        ],
        nutrition: 
		{
            calories: 380,
            protein: 35,
            carbs: 12,
            fat: 18
        },
        tags: ['Thai', 'Spicy', 'Chicken', 'Quick']
    };
}



let currentRecipe = null;



function setupEventListeners() 
{
    document.getElementById('generate-btn').addEventListener('click', generateRandomRecipe);
    
    const starBtn = document.getElementById('star-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const printBtn = document.getElementById('print-btn');

    starBtn.addEventListener('click', () => toggleStar(currentRecipe.id));
    favoriteBtn.addEventListener('click', () => toggleFavorite(currentRecipe.id));
    printBtn.addEventListener('click', () => navigateToPrintPage(currentRecipe.id));
} 