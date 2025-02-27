const express = require("express");
const app = express.Router();
const controller = require("../controllers/car.controller");

// define routes here
app.get("/", controller.get);
app.get("/:id", controller.getById);
app.post("/", controller.create);
app.put("/:id", controller.put);
app.patch("/:id", controller.patch);
app.delete("/:id", controller.delete);
module.exports = app;
