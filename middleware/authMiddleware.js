const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and has a Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized - No token provided" });
  }

  const token = authHeader.split(" ")[1]; // Extract the token

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Store user data in `req.user`
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized - Invalid token" });
  }
};

module.exports = authMiddleware;
