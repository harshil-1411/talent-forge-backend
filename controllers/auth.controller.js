import {User} from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createError from "../utils/createError.js";

export const register = async (req, res, next) => {
  try {
    // Note: Password hashing should be handled by a pre-save hook in your user.model.js
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).send("User has been created.");
  } catch (err) { // FIX: Changed 'error' to 'err' to match the variable used below
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user) return next(createError(404, "User not found!"));

    const isCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isCorrect) return next(createError(400, "Wrong password or username!"));

    const token = jwt.sign(
      { id: user._id, isSeller: user.isSeller },
      process.env.JWT_KEY
    );
    console.log("Generated token:", token); // Debug log

    const { password, ...userInfo } = user._doc;

    res.status(200).json({
      message: "Login successful",
      user: {
        ...userInfo,
        token: token  // Include token in the user object
      }
    });

  } catch (err) {
    next(err);
  }
};


export const logout = (req, res) => {
  // To clear the cookie, the options must match the ones used to set it.
  res
    .clearCookie("accessToken", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .send("User has been logged out.");
};