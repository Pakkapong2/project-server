const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const carRoute = require("./routes/car.route");
const authRoute = require("./routes/auth.route");
const bookingRoute = require("./routes/booking.route");
const fineRoute = require("./routes/fine.route");
const authMiddleware = require("../middlewares/authMiddleware");

const User = require("../models/user.model"); // ✅ แก้ path ให้ถูกต้อง

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

app.use("/api/cars", carRoute);
app.use("/api/auth", authRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/fine", fineRoute);

// ✅ แก้ให้มี `/api/user/me` แค่ 1 อันเท่านั้น
app.get("/api/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password"); // ดึงข้อมูล User แต่ไม่ส่ง password กลับ
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("🔥 User Me Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// ✅ เชื่อมต่อ MongoDB
const mongoURI = "mongodb+srv://pakkapong:22072549gg@pakkapong.baya3.mongodb.net/cars"; 

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.listen(port, () => {
  console.log("🚀 Server started at port: " + port);
});
