const express = require('express');
const router = express.Router();
const { 
    createMealPlan,
    getMealPlans,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan
} = require('../controllers/mealPlanController');
const { protect } = require('../middleware/authMiddleware');

// All meal plan routes are protected
router.post('/', protect, createMealPlan);
router.get('/', protect, getMealPlans);
router.get('/:id', protect, getMealPlanById);
router.put('/:id', protect, updateMealPlan);
router.delete('/:id', protect, deleteMealPlan);

module.exports = router; 