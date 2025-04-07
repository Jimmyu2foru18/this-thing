const API_BASE_URL = '/api/mealplans';

async function createMealPlan(planData) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to create meal plan'
            };
        }
        
        return {
            success: true,
            mealPlan: data
        };
    } catch (error) {
        console.error('Meal plan creation error:', error);
        return {
            success: false,
            message: 'Unable to connect to meal plan service'
        };
    }
}

async function getUserMealPlans() {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(API_BASE_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch meal plans'
            };
        }
        
        return {
            success: true,
            mealPlans: data
        };
    } catch (error) {
        console.error('Meal plans fetch error:', error);
        return {
            success: false,
            message: 'Unable to connect to meal plan service'
        };
    }
}

async function getMealPlanById(planId) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/${planId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to fetch meal plan'
            };
        }
        
        return {
            success: true,
            mealPlan: data
        };
    } catch (error) {
        console.error('Meal plan fetch error:', error);
        return {
            success: false,
            message: 'Unable to connect to meal plan service'
        };
    }
}

async function updateMealPlan(planId, planData) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/${planId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(planData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to update meal plan'
            };
        }
        
        return {
            success: true,
            mealPlan: data
        };
    } catch (error) {
        console.error('Meal plan update error:', error);
        return {
            success: false,
            message: 'Unable to connect to meal plan service'
        };
    }
}

async function deleteMealPlan(planId) {
    try {
        const token = localStorage.getItem('userToken');
        
        if (!token) {
            return {
                success: false,
                message: 'Not authenticated'
            };
        }
        
        const response = await fetch(`${API_BASE_URL}/${planId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return {
                success: false,
                message: data.message || 'Failed to delete meal plan'
            };
        }
        
        return {
            success: true,
            message: data.message || 'Meal plan deleted successfully'
        };
    } catch (error) {
        console.error('Meal plan deletion error:', error);
        return {
            success: false,
            message: 'Unable to connect to meal plan service'
        };
    }
}

export {
    createMealPlan,
    getUserMealPlans,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan
}; 