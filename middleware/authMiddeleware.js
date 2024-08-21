const jwt = require("jsonwebtoken");
require('dotenv').config();

const authMiddelware = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ error: "Unauthorized Token Provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token not provided" });
    }

    try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        // req.authUser = decode;
        req.authUser = { userId: decode.userId , roleType: decode.roleType};
        next();
    } catch (error) {
        console.error('Authentication Error', error);
        return res.status(401).json({ error: "Invalid token" });
    }
}

module.exports = authMiddelware;
