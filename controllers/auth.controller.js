import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const register = async (req, res, next) => {
  try {
    // Registration logic here
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username }).select(
      "+password"
    );

    if (!user) {
      return next(createError(404, "User not found"));
    }

    const isPasswordCorrect = await user.isPasswordCorrect(req.body.password);

    if (!isPasswordCorrect) {
      return next(createError(400, "Wrong password or username"));
    }

    //Create a JSON Web Token
    const token = jwt.sign(
      {
        id: user._id,
        isSeller: user.isSeller,
      },
      process.env.JWT_KEY,
      { expiresIn: "1d" }
    );

    const { password, ...userInfo } = user._doc;

    res
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: true, // Always use secure in production
        sameSite: "none", // Required for cross-site cookies
        domain: ".onrender.com", // Your backend domain
        path: "/",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
      })
      .status(200)
      .json({
        message: "Login successful",
        user: {
          ...userInfo,
          isSeller: user.isSeller  // Explicitly include isSeller flag
        },
      });
  } catch (err) {
    next(err);

    }
};

export const logout = async (req, res) => {
  res
    .clearCookie("accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".onrender.com",
      path: "/"
    })
    .status(200)
    .json({ message: "User logged out successfully" });
};
