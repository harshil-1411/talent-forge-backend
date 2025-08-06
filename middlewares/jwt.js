import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const verifyToken = (req, res, next) => {
  // Try to get token from cookie first
  let token = req.cookies.accessToken;
  
  // If no cookie token, check Authorization header
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return next(createError(401, "You are not authenticated!"));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_KEY);
    req.userId = payload.id;
    req.isSeller = payload.isSeller;
    next();
  } catch (err) {
    return next(createError(403, "Token is not valid!"));
  }
}