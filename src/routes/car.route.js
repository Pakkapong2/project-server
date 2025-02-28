const express = require("express");
const app = express.Router();
const controller = require("../controllers/car.controller");


app.get("/", controller.getAllCars);
app.get("/:id", controller.getCarById);
app.post("/", controller.create);
app.put("/:id", controller.put);
app.patch("/:id", controller.patch);
app.delete("/:id", controller.delete);
module.exports = app;
