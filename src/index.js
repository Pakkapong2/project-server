const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");

const carRoute = require("./routes/car.route");
const authRoute = require("./routes/auth.route");
const bookingRoute = require("./routes/booking.route");
const fineRoute = require("./routes/fine.route");
const authMiddleware = require("../middlewares/authMiddleware");


const mongoURI = "mongodb+srv://pakkapong:22072549gg@pakkapong.baya3.mongodb.net/cars";
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("✅ MongoDB Connected!"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));



app.use(cors());


app.use(
  cors({
    origin: "https://project-start.onrender.com", 
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use("/images", express.static("images"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Sawandee");
});

app.use("/api/cars", carRoute);
app.use("/api/auth/", authRoute);
app.use("/api/booking", bookingRoute);
app.use("/api/fine", fineRoute);

app.get("/api/user/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("🔥 User Me Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(port, () => {
  console.log("🚀 Server started at port: " + port);
});
