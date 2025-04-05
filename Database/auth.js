const jwt = require('jsonwebtoken');

const generateToken = (userId, isAdmin = false) => {
    return jwt.sign(
        { 
            id: userId,
            isAdmin 
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '30d'
        }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
};

module.exports = { generateToken, verifyToken }; 