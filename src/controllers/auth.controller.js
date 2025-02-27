const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const prisma = new PrismaClient();
const secretKey = process.env.JWT_SECRET_KEY || "your_secret_key";

const generateToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "images/"),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "." + file.originalname.split(".").pop());
  },
});

const upload = multer({ storage: storage });

const login = async (req, res) => {
  console.log("📩 Received:", req.body); // ✅ ดูค่าที่ Frontend ส่งมา
  const { email, password } = req.body;

  if (!email || !password) {
    console.error("🚨 Missing email or password");
    return res.status(400).json({ message: "กรุณากรอก Email และ Password" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error("❌ User not found:", email);
      return res.status(401).json({ message: "Email หรือ Password ไม่ถูกต้อง" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    console.log("🔑 Password Match:", passwordMatch);

    if (!passwordMatch) return res.status(401).json({ message: "Email หรือ Password ไม่ถูกต้อง" });

    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token });
  } catch (error) {
    console.error("🔥 Login Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const createRegister = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { username, password, name, lastname, email, address, tel, userTypeId } = req.body;
    const picture = req.file ? req.file.filename : null;

    try {
      const existingUser = await prisma.user.findFirst({
        where: { OR: [{ email }, { username }] },
      });

      if (existingUser) return res.status(400).json({ error: "Email or Username already exists" });

      // ✅ เช็คว่ามี UserType จริงหรือไม่
      const existingUserType = await prisma.userType.findUnique({ where: { id: userTypeId } });
      if (!existingUserType) return res.status(400).json({ error: "Invalid userTypeId" });

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
          userType: { connect: { id: userTypeId } }, // ✅ Prisma ใช้ String
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
  const { id } = req.params;

  try {
    const user = await prisma.user.findUnique({ where: { id }, include: { userType: true } });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRegister = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { id } = req.params;
    const { username, password, name, lastname, email, address, tel, userTypeId } = req.body;
    const picture = req.file ? req.file.filename : null;

    try {
      let updateData = { username, name, lastname, email, address, tel };

      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      if (picture) {
        updateData.picture = picture;
      }

      if (userTypeId) {
        // ✅ เช็คก่อนว่ามี userType จริงหรือไม่
        const existingUserType = await prisma.userType.findUnique({ where: { id: userTypeId } });
        if (!existingUserType) return res.status(400).json({ error: "Invalid userTypeId" });

        updateData.userType = { connect: { id: userTypeId } };
      }

      const user = await prisma.user.update({ where: { id }, data: updateData });

      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

const deleteRegister = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.user.delete({ where: { id } });
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
