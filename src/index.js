const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const carRoute = require("./routes/car.route");
const authRoute = require("./routes/auth.route");
const bookingRoute = require("./routes/booking.route");
const fineRoute = require("./routes/fine.route");
const User = require("../models/user.model"); // ✅ แก้ path ให้ถูกต้อง

const port = process.env.PORT || 4000;
const mongoURI = process.env.MONGO_URI; // ✅ ใช้จาก `.env` แทน hardcode
const jwtSecret = process.env.JWT_SECRET || "your-secret-key"; // ✅ ใช้ .env เพื่อความปลอดภัย

// ✅ ตั้งค่า CORS ให้รองรับ frontend
app.use(cors({
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"],
  methods: "GET,POST,PUT,DELETE",
  credentials: true
}));

app.use("/images", express.static("images"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Sawandee");
});

// ✅ ใช้ Router แยก API
app.use("/cars", carRoute);
app.use("/auth", authRoute);
app.use("/booking", bookingRoute);
app.use("/fine", fineRoute);

// ✅ Login API พร้อม JWT
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const token = jwt.sign({ userId: user._id, email: user.email }, jwtSecret, { expiresIn: "1h" });

    res.json({ message: "เข้าสู่ระบบสำเร็จ", token });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
});

// ✅ เชื่อมต่อ MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
});
