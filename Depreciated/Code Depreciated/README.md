# Recspicy - Recipe and Meal Planning Application

## Project Overview


## Features

- **Recipe Discovery**: Browse recipes from both Tasty API and user-created content
- **Advanced Search**: Filter recipes by meal type, dietary restrictions, cooking time
- **Personal Recipe Creation**: Create and share your own recipes with the community
- **Meal Planning**: Create weekly meal plans with nutritional tracking
- **User Profiles**: Customize your profile with dietary preferences and health goals
- **Favorites System**: Save recipes to your personal collection
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js, Express
- **Database**: MongoDB
- **External API**: Tasty API for recipe data
- **Authentication**: JWT-based authentication
- **File Storage**: Local storage for recipe images and user avatars

## Project Structure

- **pages/**: HTML files for individual pages
- **css/**: Styling files for the application
- **js/**: Client-side JavaScript functionality
- **server/**: Backend code for the application
  - **models/**: Data structures
  - **controllers/**: API endpoints logic
  - **routes/**: API routing
  - **middleware/**: Authentication and error handling
  - **config/**: Configuration files for database connection

## Setup Instructions

1. Clone the repository
```bash
git clone https://github.com/
cd 
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the root directory:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/recspicy
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
TASTY_API_KEY=your_tasty_api_key
TASTY_API_URL=https://tasty.p.rapidapi.com
UPLOAD_PATH=./uploads
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to:
```
http://localhost:5000
```

## API Endpoints

### Users
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login a user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/favorites` - Get user favorites

### Recipes
- `GET /api/recipes` - Get all recipes with filtering
- `POST /api/recipes` - Create a new recipe
- `GET /api/recipes/:id` - Get a specific recipe
- `PUT /api/recipes/:id` - Update a recipe
- `DELETE /api/recipes/:id` - Delete a recipe
- `POST /api/recipes/:id/star` - Star a recipe
- `POST /api/recipes/:id/favorite` - Favorite a recipe

### Meal Plans
- `GET /api/mealplans` - Get user's meal plans
- `POST /api/mealplans` - Create a new meal plan
- `GET /api/mealplans/:id` - Get a specific meal plan
- `PUT /api/mealplans/:id` - Update a meal plan
- `DELETE /api/mealplans/:id` - Delete a meal plan

### Support
- `POST /api/support` - Create a support ticket
- `GET /api/support` - Get user's support tickets
- `GET /api/support/:id` - Get a specific support ticket
- `POST /api/support/:id/message` - Add a message to a ticket

## Deployment

### AWS Deployment
1. Set up AWS resources:
   - EC2 instance
   - MongoDB Atlas
   - S3 bucket

2. Deploy the application:
   - Using AWS CodeDeploy
   - Configure SSL with AWS Certificate Manager


- [Tasty API](https://rapidapi.com/apidojo/api/tasty/) for providing recipe data



