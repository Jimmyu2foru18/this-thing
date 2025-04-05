# Database Schema Documentation

## Collections Overview

### Users Collection
- `_id`: ObjectId (auto-generated)
- `username`: String (required, unique)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `avatar`: String (path to image file)
- `dietaryPreferences`: Array of Strings
- `createdAt`: Date (default: current date)
- `updatedAt`: Date (default: current date)

### Recipes Collection
- `_id`: ObjectId (auto-generated)
- `title`: String (required)
- `description`: String
- `ingredients`: Array of Objects
  - `name`: String
  - `amount`: String
  - `unit`: String
- `instructions`: Array of Strings
- `cookingTime`: Number (minutes)
- `difficulty`: String (enum: ['Easy', 'Medium', 'Hard'])
- `servings`: Number
- `dietaryTags`: Array of Strings
- `image`: String (path to image file)
- `author`: ObjectId (reference to Users)
- `createdAt`: Date (default: current date)
- `updatedAt`: Date (default: current date)

### Meal Plans Collection
- `_id`: ObjectId (auto-generated)
- `name`: String (required)
- `description`: String
- `recipes`: Array of Objects
  - `recipeId`: ObjectId (reference to Recipes)
  - `day`: String (enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
  - `mealType`: String (enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'])
- `owner`: ObjectId (reference to Users)
- `createdAt`: Date (default: current date)
- `updatedAt`: Date (default: current date)

### Support Tickets Collection
- `_id`: ObjectId (auto-generated)
- `subject`: String (required)
- `message`: String (required)
- `status`: String (enum: ['Open', 'In Progress', 'Resolved'], default: 'Open')
- `user`: ObjectId (reference to Users)
- `createdAt`: Date (default: current date)
- `updatedAt`: Date (default: current date)

## Indexes
- Users: `username`, `email` (unique)
- Recipes: `title`, `author`
- Meal Plans: `owner`
- Support Tickets: `user`, `status`

## Relationships
- Users to Recipes: One-to-Many (User can create many recipes)
- Users to Meal Plans: One-to-Many (User can create many meal plans)
- Users to Support Tickets: One-to-Many (User can create many support tickets)
- Recipes to Meal Plans: Many-to-Many (Recipes can be in many meal plans, meal plans can contain many recipes)