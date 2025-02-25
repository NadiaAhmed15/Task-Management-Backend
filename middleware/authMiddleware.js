const jwt = require("jsonwebtoken");
const UserModel = require("../Models/DataModel"); // Ensure correct path
const SECRET_KEY = process.env.JWT_SECRET || "your_secret_key"; // Use env variable

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized - No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token
    const decoded = jwt.verify(token, SECRET_KEY);

    const user = await UserModel.findById(decoded.id); // Fetch user from DB
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach user data to request
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

module.exports = authMiddleware;
