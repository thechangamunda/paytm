const { JWT_SECRET } = require("./config.js")
const jwt = require("jsonwebtoken")

const authMiddleware = (req, res, next)=>{
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(403).json({})
    }
    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;

        console.log(decoded)
        next();
    }catch(err){
        res.status(403).json({})
    }
};

module.exports = authMiddleware;