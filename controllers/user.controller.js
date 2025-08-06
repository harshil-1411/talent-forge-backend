import { User } from "../models/user.model.js";
import createError from "../utils/createError.js";  

export const deleteUser = async (req, res, next) => {
  constuser = await User.findById(req.params.id);

  if (req.userId !== user._id.toString()) {
    return next(createError(403, "You can delete only your account!"));
  }

  await User.findByIdAndDelete(req.params.id);
  res.status(200).json({ message: "User deleted successfully" });
};

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return next(createError(404, "User not found"));
    }
    res.status(200).json(user);
  } catch (err) {
    next(createError(500, "Internal server error"));
  }
}
