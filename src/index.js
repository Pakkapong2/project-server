const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 3000;
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

app.listen(port, () => {
  console.log("App started at port: " + port);
});
