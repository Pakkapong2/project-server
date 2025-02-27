const User = require("../models/user.model"); // ✅ ใช้ Mongoose Model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key";

const generateToken = (payload) =>
  jwt.sign(payload, secretKey, { expiresIn: "1h" });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});
const upload = multer({ storage }).single("picture");

// ✅ Login
const login = async (req, res) => {
  try {
    console.log("📩 Login Attempt:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอก Email และ Password" });
    }

    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Email หรือ Password ไม่ถูกต้อง" });
    }

    const token = generateToken({ userId: user._id, email: user.email });
    res.json({ token, user });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Register
const createRegister = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const {
        username,
        password,
        name,
        lastname,
        email,
        address,
        tel,
        userTypeId,
      } = req.body;

      if (await User.findOne({ email })) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const user = new User({
        username,
        password: await bcrypt.hash(password, 10),
        name,
        lastname,
        email,
        address,
        tel,
        picture: req.file ? req.file.filename : null,
        userTypeId,
      });

      await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// ✅ Get All Users
const getRegister = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Get User by ID
const getByIdRegister = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user ? res.json(user) : res.status(404).json({ error: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update User
const updateRegister = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    try {
      const { id } = req.params;
      const {
        username,
        password,
        name,
        lastname,
        email,
        address,
        tel,
        userTypeId,
      } = req.body;
      let updateData = {
        username,
        name,
        lastname,
        email,
        address,
        tel,
        userTypeId,
      };

      if (password) updateData.password = await bcrypt.hash(password, 10);
      if (req.file) updateData.picture = req.file.filename;

      const updatedUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// ✅ Delete User
const deleteRegister = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  login,
  createRegister,
  getRegister,
  getByIdRegister,
  updateRegister,
  deleteRegister,
};
