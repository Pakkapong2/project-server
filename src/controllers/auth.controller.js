const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
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

const login = async (req, res) => {
  try {
    console.log("📩 Login Attempt:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "กรุณากรอก Email และ Password" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ message: "Email หรือ Password ไม่ถูกต้อง" });
    }

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

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

      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existingUser) {
        return res
          .status(400)
          .json({ error: "Email or Username already exists" });
      }

      const userTypeExists = await prisma.userType.findUnique({
        where: { id: userTypeId },
      });
      if (!userTypeExists) {
        return res.status(400).json({ error: "Invalid userTypeId" });
      }

      const user = await prisma.user.create({
        data: {
          username,
          password: await bcrypt.hash(password, 10),
          name,
          lastname,
          email,
          address,
          tel,
          picture: req.file ? req.file.filename : null,
          userType: { connect: { id: userTypeId } },
        },
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

const getRegister = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ include: { userType: true } });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getByIdRegister = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: { userType: true },
    });
    user ? res.json(user) : res.status(404).json({ error: "User not found" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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
      let updateData = { username, name, lastname, email, address, tel };

      if (password) updateData.password = await bcrypt.hash(password, 10);
      if (req.file) updateData.picture = req.file.filename;

      if (userTypeId) {
        const userTypeExists = await prisma.userType.findUnique({
          where: { id: userTypeId },
        });
        if (!userTypeExists) {
          return res.status(400).json({ error: "Invalid userTypeId" });
        }
        updateData.userType = { connect: { id: userTypeId } };
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
      });

      res.json(updatedUser);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

const deleteRegister = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
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
