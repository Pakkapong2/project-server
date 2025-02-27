const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cors = require("cors");
const carRoute = require("./routes/car.route");
const authRoute = require("./routes/auth.route")
const bookingRoute = require("./routes/booking.route")
const fineRoute = require("./routes/fine.route")


app.use('/images', express.static('images'));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Sawandee");
});

app.use("/cars", carRoute);
app.use("/auth", authRoute);
app.use("/booking", bookingRoute);
app.use("/fine", fineRoute);

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ message: "ข้อมูลผิดพลาด" });
  }

  res.json({ message: "เข้าสู่ระบบสำเร็จ", token: "your-jwt-token" });
});


app.listen(port, () => {
  console.log("App started at port: " + port);
});
