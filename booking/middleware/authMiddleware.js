module.exports = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      console.log("❌ Token missing in request");
      return res.status(401).json({ message: "Token required" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      console.log("❌ Invalid token:", err.message);
      res.status(403).json({ message: "Invalid token" });
    }
  };
  