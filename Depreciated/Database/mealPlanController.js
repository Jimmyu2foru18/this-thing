const MealPlan = require('../models/MealPlan');
const User = require('../models/User');

// @desc    Create a new meal plan
// @route   POST /api/mealplans
// @access  Private
const createMealPlan = async (req, res) => {
    try {
        const { name, meals, notes, servings, startDate } = req.body;
        
        // Create plan object
        const mealPlan = new MealPlan({
            name,
            user: req.user._id,
            meals: Array.isArray(meals) ? meals : JSON.parse(meals),
            notes,
            servings: servings || 1,
            startDate: startDate || new Date()
        });
        
        const createdMealPlan = await mealPlan.save();
        
        // Update user stats
        const user = await User.findById(req.user._id);
        user.stats.mealPlans += 1;
        await user.save();
        
        res.status(201).json(createdMealPlan);
    } catch (error) {
        console.error('Error in createMealPlan:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all user's meal plans
// @route   GET /api/mealplans
// @access  Private
const getMealPlans = async (req, res) => {
    try {
        const mealPlans = await MealPlan.find({ user: req.user._id })
            .sort({ updatedAt: -1 });
        
        res.json(mealPlans);
    } catch (error) {
        console.error('Error in getMealPlans:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get meal plan by ID
// @route   GET /api/mealplans/:id
// @access  Private (owner only)
const getMealPlanById = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id)
            .populate({
                path: 'meals.recipe',
                select: 'title image cookTime prepTime'
            });
        
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        
        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view this meal plan' });
        }
        
        res.json(mealPlan);
    } catch (error) {
        console.error('Error in getMealPlanById:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update meal plan
// @route   PUT /api/mealplans/:id
// @access  Private (owner only)
const updateMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);
        
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        
        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this meal plan' });
        }
        
        const { name, meals, notes, servings, startDate } = req.body;
        
        // Update meal plan fields
        mealPlan.name = name || mealPlan.name;
        mealPlan.notes = notes !== undefined ? notes : mealPlan.notes;
        mealPlan.servings = servings || mealPlan.servings;
        
        if (startDate) {
            mealPlan.startDate = startDate;
        }
        
        if (meals) {
            mealPlan.meals = Array.isArray(meals) ? meals : JSON.parse(meals);
        }
        
        const updatedMealPlan = await mealPlan.save();
        
        res.json(updatedMealPlan);
    } catch (error) {
        console.error('Error in updateMealPlan:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete meal plan
// @route   DELETE /api/mealplans/:id
// @access  Private (owner only)
const deleteMealPlan = async (req, res) => {
    try {
        const mealPlan = await MealPlan.findById(req.params.id);
        
        if (!mealPlan) {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        
        // Check if user is the owner
        if (mealPlan.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this meal plan' });
        }
        
        await mealPlan.remove();
        
        // Update user stats
        const user = await User.findById(req.user._id);
        user.stats.mealPlans -= 1;
        await user.save();
        
        res.json({ message: 'Meal plan removed' });
    } catch (error) {
        console.error('Error in deleteMealPlan:', error);
        
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Meal plan not found' });
        }
        
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createMealPlan,
    getMealPlans,
    getMealPlanById,
    updateMealPlan,
    deleteMealPlan
}; 