const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const asyncHandler = require("express-async-handler");
const generateToken = require("../utils/jwt");
const generateRefreshToken = require("../utils/refreshToken");
const jwt = require("jsonwebtoken");
const { validatemongoDbId } = require("../utils/validateMongoId");
const sendEmail = require("../services/Nodemailer");
const crypto = require("crypto");

//register a user
const createUser = asyncHandler(async (req, res) => {
  const email = req.body.email;

  const findUser = await User.findOne({ email: email });

  if (!findUser) {
    const newUser = await User.create(req.body);
    res.json(newUser);
  } else {
    throw new Error("User Already Exists");
  }
});

//user Login
const userLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    let existingUser = await User.findOne({ email });

    if (!existingUser) {
      return res.status(403).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compareSync(
      password,
      existingUser.password
    );

    if (!isPasswordMatch) {
      return res.status(403).json({ message: "Invalid Credentials" });
    }

    const refreshToken = await generateRefreshToken(existingUser._id);
    await User.findByIdAndUpdate(
      existingUser._id,
      { refreshToken: refreshToken },
      { new: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      user: {
        _id: existingUser._id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
      },
      token: generateToken(existingUser._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "An error occurred during login." });
  }
});

//Admin Login

const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  try {
    let existingadmin = await User.findOne({ email });
    if (existingadmin.role !== "Admin") {
      throw new Error("Only Admin can Authorised");
    }

    if (!existingadmin) {
      return res.status(403).json({ message: "admin not found" });
    }

    const isPasswordMatch = await bcrypt.compareSync(
      password,
      existingadmin.password
    );

    if (!isPasswordMatch) {
      return res.status(403).json({ message: "Invalid Credentials" });
    }

    const refreshToken = await generateRefreshToken(existingadmin._id);
    await User.findByIdAndUpdate(
      existingadmin._id,
      { refreshToken: refreshToken },
      { new: true }
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 72 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login Successful",
      admin: {
        _id: existingadmin._id,
        firstName: existingadmin.firstName,
        lastName: existingadmin.lastName,
        email: existingadmin.email,
      },
      token: generateToken(existingadmin._id),
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "An error occurred during login." });
  }
});

const handleRefreshToken = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refersh token in cookie");
  const refreshToken = cookie.refreshToken;
  const admin = await admin.findOne({ refreshToken });
  if (!admin)
    throw new Error("No refreshToken is present in DB or not matched");
  jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err || admin.id !== decoded.id) {
      throw new Error("There is something went wrong");
    }
    const accessToken = generateToken(admin?.id);
    res.json({ accessToken });
  });
});

const userLogout = asyncHandler(async (req, res) => {
  const cookie = req.cookies;
  if (!cookie?.refreshToken) throw new Error("no refersh token in cookie");
  const refreshToken = cookie.refreshToken;
  const user = await User.findOne({ refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
    });
    return res.sendStatus(204);
  }
  await User.findOneAndUpdate(
    { refreshToken },
    {
      refreshToken: "",
    },
    { new: true }
  );
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
  });
  return res.sendStatus(204);
});

const updatePassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { password } = req.body;
  validatemongoDbId(_id);
  const user = await User.findById(_id);
  if (password) {
    user.password = password;
    const updatePassword = await user.save();
    res.json(updatePassword);
  } else {
    res.json({ user });
  }
});
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    throw new Error("User not found with this email");
  }
  try {
    const token = await existingUser.createPasswordResetToken();
    await existingUser.save();
    const resetUrl = `Hi, please follow this link to reset your password. This link is valid till 10 minutes to now <a href ="http://localhost:8080/api/v1/users/resetPassword/${token}">click here<a/>`;
    const data = {
      to: email,
      text: "Hey User",
      subject: "forgot password link",
      html: resetUrl,
    };
    sendEmail(data);
    res.json(token);
  } catch (error) {
    throw new Error(error);
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { token } = req.params;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    throw new Error("Token expired, Please try again later!");
  }
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  res.status(201).json({ user });
});

module.exports = {
  createUser,
  userLogin,
  adminLogin,
  handleRefreshToken,
  userLogout,
  updatePassword,
  forgotPassword,
  resetPassword,
};
