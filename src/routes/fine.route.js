const express = require("express");
const app = express.Router();
const controller = require("../controllers/fine.controller");

// 🔹 ตั้งค่า API Route สำหรับค่าปรับ
app.post("/", controller.createFine);
app.get("/", controller.getFines);
app.get("/:id", controller.getFineById);
app.put("/:id", controller.updateFine);
app.delete("/:id", controller.deleteFine);

module.exports = app;
