document.addEventListener('DOMContentLoaded', () => 
{
    loadUserProfile();
	
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => 
	{
        tab.addEventListener('click', () => 
		{
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const tabName = tab.dataset.tab;
            switchTab(tabName);
        });
    });

    const editButton = document.querySelector('.edit-button');
    if (editButton) 
	{
        editButton.addEventListener('click', () => 
		{
            window.location.href = 'edit-profile.html';
        });
    }
});

async function loadUserProfile() 
{
    try 
	{
        const response = await fetch('/api/users/me', 
		{
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const userData = await response.json();
        populateProfile(userData);
        
    } 
	catch (error) 
	{
        if (error.message === 'Unauthorized') 
		{
            window.location.href = '/signin.html';
        }
        showError('Failed to load profile data');
    }
}

function populateProfile(userData) 
{
    document.getElementById('profile-name').textContent = `${userData.first_name} ${userData.last_name}`;
    document.getElementById('profile-email').textContent = userData.email;
	
    document.getElementById('recipe-count').textContent = userData.recipes_posted;
    document.getElementById('follower-count').textContent = userData.followers_count;
}

function updateProfileUI(userData) 
{
    document.querySelector('.profile-name').textContent = userData.name;
    document.querySelector('.profile-bio').textContent = userData.bio || '';
    
    document.getElementById('public-count').textContent = userData.publicRecipesCount;
    document.getElementById('private-count').textContent = userData.privateRecipesCount;
    document.getElementById('mealplan-count').textContent = userData.mealPlansCount;
    document.getElementById('favorites-count').textContent = userData.favoritesCount;

    document.getElementById('cuisine-pref').textContent = userData.preferences.cuisines.join(', ');
    document.getElementById('dietary-pref').textContent = userData.preferences.diet;
    document.getElementById('skill-pref').textContent = userData.preferences.skillLevel;
    document.getElementById('time-pref').textContent = userData.preferences.cookingTime;
    

    if (userData.avatar) 
	{
        document.getElementById('profile-avatar').src = userData.avatar;
    }
}

async function switchTab(tabName) 
{
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    const selectedTab = document.getElementById(tabName);
    selectedTab.classList.add('active');
    
    try 
	{
        switch(tabName) 
		{
            case 'public':
                await loadPublicRecipes();
                break;
            case 'private':
                await loadPrivateRecipes();
                break;
            case 'meal-plans':
                await loadMealPlans();
                break;
            case 'favorites':
                await loadFavorites();
                break;
            case 'support':
                await loadSupportTickets();
                break;
        }
    } 
	catch (error) 
	{
        console.error('Error loading tab content:', error);
        showError('Failed to load content');
    }
}

async function loadPublicRecipes() 
{
    const recipes = await fetchPublicRecipes();
    displayRecipes('public-recipes-grid', recipes);
}

async function loadPrivateRecipes() 
{
    const recipes = await fetchPrivateRecipes();
    displayRecipes('private-recipes-grid', recipes);
}

async function loadMealPlans() 
{
    const mealPlans = await fetchMealPlans();
    if (mealPlans.length === 0) 
	{
        showEmptyMealPlans();
    } 
	else 
	{
        displayMealPlans(mealPlans);
    }
}

function showEmptyMealPlans() {
    const container = document.getElementById('meal-plans-grid');
    container.innerHTML = `
        <div class="empty-state">
            <p>You haven't created any meal plans yet.</p>
            <button class="create-btn" onclick="window.location.href='meal-planner.html'">
                Create Your First Meal Plan
            </button>
        </div>
    `;
}

function displayRecipes(containerId, recipes) 
{
    const container = document.getElementById(containerId);
    container.innerHTML = recipes.map(recipe => `
        <div class="recipe-card">
            <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
				
                <div class="recipe-meta">
                    <span>⏱️ ${recipe.cookTime} mins</span>
                    <span>⭐ ${recipe.rating}</span>
                </div>
				
                <div class="recipe-actions">
                    <button onclick="editRecipe('${recipe.id}')">Edit</button>
                    <button onclick="deleteRecipe('${recipe.id}')">Delete</button>
                </div>
				
            </div>
        </div>
    `).join('');
}

function displayMealPlans(mealPlans) {
    const container = document.getElementById('meal-plans-grid');
    container.innerHTML = mealPlans.map(plan => `
        <div class="meal-plan-card">
            <div class="meal-plan-header">
                <h3>${plan.name}</h3>
                <span>${plan.startDate} - ${plan.endDate}</span>
            </div>
			
            <div class="meal-plan-content">
                <p>${plan.description}</p>
            </div>
			
            <div class="meal-plan-actions">
                <button onclick="editMealPlan('${plan.id}')">Edit</button>
                <button onclick="deleteMealPlan('${plan.id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

async function loadSupportTickets() {
    const tickets = await fetchSupportTickets();
    displayTickets(tickets);
}

function displayTickets(tickets) {
    const container = document.getElementById('tickets-grid');
    if (tickets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No support tickets yet.</p>
				
                <button class="create-btn" onclick="window.location.href='contact.html?type=support'">
                    Create Support Ticket
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = tickets.map(ticket => `
        <div class="ticket-card ${ticket.status}">
            <div class="ticket-header">
                <span class="ticket-id">#${ticket.id}</span>
                <span class="ticket-status">${ticket.status}</span>
                <span class="ticket-priority ${ticket.priority}">${ticket.priority}</span>
            </div>
			
            <div class="ticket-content">
                <h3 class="ticket-title">${ticket.subject}</h3>
                <p class="ticket-preview">${ticket.lastMessage}</p>
            </div>
			
            <div class="ticket-footer">
                <span class="ticket-date">${formatDate(ticket.lastUpdated)}</span>
                <button onclick="viewTicket('${ticket.id}')" class="view-btn">View Conversation</button>
            </div>
        </div>
    `).join('');
}

function viewTicket(ticketId) {}

//edit recipiessss

function editRecipe(recipeId) 
{
    fetchRecipeDetails(recipeId).then(recipe => 
	{
        document.getElementById('recipe-id').value = recipe.id;
        document.getElementById('recipe-title').value = recipe.title;
        document.getElementById('recipe-description').value = recipe.description;
        document.getElementById('recipe-visibility').value = recipe.visibility;

        const ingredientsList = document.getElementById('ingredients-list');
        ingredientsList.innerHTML = recipe.ingredients.map((ingredient, index) => `
            <div class="ingredient-item">
                <input type="text" value="${ingredient}" name="ingredient-${index}">
                <button type="button" onclick="removeIngredient(this)">Remove</button>
            </div>
        `).join('');
        

        const instructionsList = document.getElementById('instructions-list');
        instructionsList.innerHTML = recipe.instructions.map((instruction, index) => `
            <div class="instruction-item">
                <textarea name="instruction-${index}">${instruction}</textarea>
                <button type="button" onclick="removeInstruction(this)">Remove</button>
            </div>
        `).join('');
        
        document.getElementById('edit-recipe-modal').classList.add('show');
    });
}

function addIngredient() 
{
    const ingredientsList = document.getElementById('ingredients-list');
    const newIngredient = document.createElement('div');
    newIngredient.className = 'ingredient-item';
    newIngredient.innerHTML = `
        <input type="text" name="ingredient-${ingredientsList.children.length}" placeholder="Enter ingredient">
        <button type="button" onclick="removeIngredient(this)">Remove</button>
    `;
    ingredientsList.appendChild(newIngredient);
}

function addInstruction() 
{
    const instructionsList = document.getElementById('instructions-list');
    const newInstruction = document.createElement('div');
    newInstruction.className = 'instruction-item';
    newInstruction.innerHTML = `
        <textarea name="instruction-${instructionsList.children.length}" placeholder="Enter instruction"></textarea>
        <button type="button" onclick="removeInstruction(this)">Remove</button>
    `;
    instructionsList.appendChild(newInstruction);
}

function removeIngredient(button) {
    button.parentElement.remove();
}

function removeInstruction(button) {
    button.parentElement.remove();
}

function closeEditModal() {
    document.getElementById('edit-recipe-modal').classList.remove('show');
}

document.getElementById('edit-recipe-form').addEventListener('submit', async (e) => 
{
    e.preventDefault();
    
    const recipeId = document.getElementById('recipe-id').value;
    const formData = {
        id: recipeId,
        title: document.getElementById('recipe-title').value,
        description: document.getElementById('recipe-description').value,
        visibility: document.getElementById('recipe-visibility').value,
        ingredients: Array.from(document.querySelectorAll('#ingredients-list input')).map(input => input.value),
        instructions: Array.from(document.querySelectorAll('#instructions-list textarea')).map(textarea => textarea.value)
    };

    try 
	{
        await updateRecipe(formData);
        closeEditModal();
        
		if (formData.visibility === 'public') 
		{
            loadPublicRecipes();
        } 
		else 
		{
            loadPrivateRecipes();
        }
        showSuccess('Recipe updated successfully');
    } 
	catch (error) 
	{
        console.error('Error updating recipe:', error);
        showError('Failed to update recipe');
    }
});

