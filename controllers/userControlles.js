const User = require("../models/userSchema");
const asyncHandler = require("express-async-handler");
const { validatemongoDbId } = require("../utils/validateMongoId");

const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const getAllUser = await User.find({});
    res
      .status(200)
      .json({ success: true, getAllUser, counts: getAllUser.length });
  } catch (error) {
    res.status(403).json({ message: "Oops! something went wrong" });
  }
});

const getSingleUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  validatemongoDbId(id);
  try {
    const getUser = await User.findById(id);
    res.status(200).json({ success: true, getUser });
  } catch (error) {
    res.status(403).json({ message: "No user found" });
  }
});

const updateUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validatemongoDbId(id);
  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        firstName: req?.body?.firstName,
        lastName: req?.body?.lastName,
        email: req?.body?.email,
        mobile: req?.body?.mobile,
      },
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
});

const deleteUser = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  validatemongoDbId(id);

  try {
    await User.findByIdAndDelete(id);
    res.status(200).json("User has been deleted.");
  } catch (err) {
    next(err);
  }
});

module.exports = {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};
