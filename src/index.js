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

const User = require("../models/user.model"); // ✅ แก้ path

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

// ✅ Route Login
// ✅ Route GET /api/user/me
app.get("/api/user/me", async (req, res) => {
  try {
    // 🔹 สมมติว่าต้องใช้ token ในอนาคต
    // if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    res.json({
      id: "12345",
      name: "John Doe",
      email: "johndoe@example.com"
    });
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
