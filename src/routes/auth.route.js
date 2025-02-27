const express = require("express");
const app = express.Router();
const controller = require("../controllers/auth.controller");


app.post("/", controller.createRegister);
app.get("/", controller.getRegister);
app.get("/:id", controller.getByIdRegister);
app.put("/:id", controller.updateRegister);
app.delete("/:id", controller.deleteRegister);

app.post("/login", controller.login);
module.exports = app;
