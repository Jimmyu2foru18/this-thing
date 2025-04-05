document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('authToken')) {
        window.location.href = 'signin.html';
        return;
    }

    loadUserProfile();
    initializeTabs();
    loadInitialTab();
});

function initializeTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            activateTab(tab, tabName);
        });
    });

    // Initialize tab content loaders
    document.getElementById('favorites-tab').addEventListener('click', () => loadFavorites());
    document.getElementById('mealplans-tab').addEventListener('click', () => loadMealPlans());
    document.getElementById('collections-tab').addEventListener('click', () => loadCollections());
}

function activateTab(selectedTab, tabName) {
    // Update tab styles
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    selectedTab.classList.add('active');

    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    const tabContent = document.getElementById(tabName);
    if (tabContent) {
        tabContent.classList.add('active');
        loadTabContent(tabName);
    }
}

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

async function loadTabContent(tabName) {
    try {
        const loadingMessage = document.querySelector(`#${tabName} .loading-message`);
        if (loadingMessage) {
            loadingMessage.style.display = 'block';
        }

        switch(tabName) {
            case 'my-recipes':
                await loadUserRecipes();
                break;
            case 'favorites':
                await loadFavoriteRecipes();
                break;
            case 'meal-plans':
                await loadMealPlans();
                break;
            case 'collections':
                await loadCollections();
                break;
        }

        if (loadingMessage) {
            loadingMessage.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading tab content:', error);
        showError('Failed to load content');
    }
}

function loadInitialTab() {
    const defaultTab = document.querySelector('.tab.active') || document.querySelector('.tab');
    if (defaultTab) {
        const tabName = defaultTab.dataset.tab;
        activateTab(defaultTab, tabName);
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
            <img src="${recipe.image || '../LOGO/recipe-placeholder.svg'}" alt="${recipe.title}" class="recipe-image">
            <div class="recipe-content">
                <h3 class="recipe-title">${recipe.title}</h3>
				
recheck the API                <div class="recipe-meta">
                    <span><i class="meta-icon">⏱️</i> ${recipe.cookTime} mins</span>
                    <span><i class="meta-icon">👨‍🍳</i> ${recipe.difficulty || 'Easy'}</span>
                    <span><i class="meta-icon">⭐</i> ${recipe.rating}</span>
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

