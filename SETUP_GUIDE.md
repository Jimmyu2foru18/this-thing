# Project Setup Guide

## Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)
- MongoDB (v5 or higher)

## Installation
1. Clone the repository
2. Run `npm install` to install dependencies

## Database Setup
1. Install MongoDB locally or use a cloud service like MongoDB Atlas
2. Create a `.env` file in the root directory with these variables:
```
DB_URI=mongodb://localhost:27017/recspicy
PORT=5000
JWT_SECRET=your_jwt_secret_here
NODE_ENV=development
```

## Environment Variables
Required variables:
- `DB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret for JWT token generation
- `NODE_ENV`: Environment (development/production)

## Running the Application
1. Development mode: `npm run dev`
2. Production mode: `npm start`

## File Uploads
- Create an `uploads` folder in the root directory
- Subfolders will be automatically created for recipe images and user avatars

## Testing
- Run tests with `npm test`

## Deployment
For production deployment:
1. Set `NODE_ENV=production`
2. Run `npm run build` for frontend assets
3. Use PM2 or similar process manager for Node.js applications