const express = require("express");
const app = express.Router();
const controller = require("../controllers/booking.controller");

app.post("/", controller.createBooking);
app.get("/", controller.getBookings);
app.get("/:id", controller.getBookingById);
app.put("/:id", controller.updateBookingPut);
app.patch("/:id", controller.updateBookingPatch);
app.delete("/:id", controller.deleteBooking);

module.exports = app;
