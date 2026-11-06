const jwt = require("jsonwebtoken");
const httpStatusCode = require("../constant/httpstatus.constant");
require("dotenv").config();



async function getToken(user) {
  const token = await jwt.sign({ user }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
  return token;
}

async function verifyToken(req, res, next) {
  const token = req.headers.authorization.split(" ")[1];
  if (!token) {
    return res
      .status(httpStatusCode.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized: Token not provided" });
  }

  try {
    // Split the authorization header by space and directly use the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    console.log(req.user);
    // console.log("token:", token);
    // console.log("secreate key:",process.env.JWT_SECRET)
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res
      .status(httpStatusCode.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
}

async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(httpStatusCode.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized: Token not provided" });
  }

  const token = authHeader.split(" ")[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    
    // Check if user is admin
    if (req.user.role !== "admin") {
      return res
        .status(httpStatusCode.FORBIDDEN)
        .json({ success: false, message: "Access denied: Admin privileges required" });
    }
    
    next();
  } catch (error) {
    console.error("Error verifying admin token:", error);
    return res
      .status(httpStatusCode.UNAUTHORIZED)
      .json({ success: false, message: "Unauthorized: Invalid token" });
  }
}

module.exports = {
  getToken,
  verifyToken,
  authenticateAdmin,
};