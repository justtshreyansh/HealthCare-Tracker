const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middlewares/auth');

async function signup(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ status: false, message: "All inputs fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ status: false, message: "Password length must be at least 6 characters" });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: false, message: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({ name, email, password: hashPassword, role });
    return res.status(201).json({ status: true, message: "User created", user: newUser });

  } catch (e) {
    return res.status(500).json({ status: false, message: "Server error. Please try after sometime!", error: e.message });
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ status: false, message: "All input fields are required" });
    }

    const existing = await User.findOne({ email });
    if (!existing) {
      return res.status(400).json({ status: false, message: "User not found" });
    }

    const pass = await bcrypt.compare(password, existing.password);
    if (pass) {
      const token = jwt.sign(
        { userId: existing._id, email: existing.email, role: existing.role },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return res.status(200).json({ status: true, message: "User logged in", user: existing, token });
    } else {
      return res.status(400).json({ status: false, message: "Password does not match" });
    }
  } catch (e) {
    console.error(e.message);
    return res.status(500).json({ status: false, message: "Server error. Please try after sometime!", error: e.message });
  }
}

async function getUser(req, res, next) {
  const id = req.user?.userId;  // use userId here

  if (!id) {
    console.log("yaha dikkat hai");
    return res.status(403).json({ status: false, message: "Unauthorized access" });
  }

  const user = await User.findOne({ _id: id });
  if (!user) {
    return res.status(404).json({ status: false, message: "User not found" });
  }

  return res.status(200).json({ status: true, message: "User Found", user: user });
}

module.exports = { signup, login,getUser };
