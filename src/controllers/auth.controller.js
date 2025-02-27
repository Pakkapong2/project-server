const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key";

const generateToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};


const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username,
      userTypeId: user.userTypeId,
    });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        userTypeId: user.userTypeId,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: error.message });
  }
};


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

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Only .jpg, .jpeg, and .png files are allowed!"),
        false
      );
    }
    cb(null, true);
  },
});


const createRegister = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

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
    const picture = req.file ? req.file.filename : null;

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });
      if (existingUser)
        return res
          .status(400)
          .json({ error: "Email or Username already exists" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          name,
          lastname,
          email,
          address,
          tel,
          picture,
          userTypeId: parseInt(userTypeId),
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
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        lastname: true,
        tel: true,
        picture: true,
        userTypeId: true,
      },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getByIdRegister = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id) || id <= 0)
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRegister = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

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
    const picture = req.file ? req.file.filename : null;

    try {
      const { id } = req.params;
      let updateData = {
        username,
        name,
        lastname,
        email,
        address,
        tel,
        userTypeId: parseInt(userTypeId),
      };

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (picture) {
        updateData.picture = picture;
      }

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
      });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};


const deleteRegister = async (req, res) => {
  const { id } = req.params;
  if (isNaN(id) || id <= 0)
    return res.status(400).json({ error: "Invalid user ID" });

  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
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
