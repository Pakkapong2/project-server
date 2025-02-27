const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const fs = require("fs"); // ใช้ลบไฟล์เก่า

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname +
        "-" +
        uniqueSuffix +
        "." +
        file.originalname.split(".").pop()
    );
  },
});

const upload = multer({ storage: storage });

exports.get = async (req, res) => {
  try {
    const cars = await prisma.car.findMany();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await prisma.car.findUnique({
      where: { id: parseInt(id) },
    });
    if (!car) return res.status(404).json({ error: "Car not found" });
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const {
      brand,
      model,
      license_plate,
      price_per_day,
      availability,
      location,
    } = req.body;
    const picture = req.file ? req.file.filename : null;

    try {
      const car = await prisma.car.create({
        data: {
          brand,
          model,
          license_plate,
          price_per_day: parseFloat(price_per_day),
          availability: availability === "true",
          location,
          picture,
        },
      });
      res.status(201).json(car);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// PUT (ต้องส่งข้อมูลครบทุกฟิลด์)
exports.put = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { id } = req.params;
    const {
      brand,
      model,
      license_plate,
      price_per_day,
      availability,
      location,
    } = req.body;
    const picture = req.file ? req.file.filename : null;

    try {
      const car = await prisma.car.update({
        where: { id: parseInt(id) },
        data: {
          brand,
          model,
          license_plate,
          price_per_day: parseFloat(price_per_day),
          availability: availability === "true",
          location,
          picture,
        },
      });
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// PATCH (อัปเดตบางฟิลด์เท่านั้น)
exports.patch = async (req, res) => {
  upload.single("picture")(req, res, async (err) => {
    if (err) return res.status(400).json({ error: err.message });

    const { id } = req.params;
    let updateData = {};

    // เช็คว่าฟิลด์ไหนถูกส่งมาเพื่ออัปเดต
    if (req.body.brand) updateData.brand = req.body.brand;
    if (req.body.model) updateData.model = req.body.model;
    if (req.body.license_plate)
      updateData.license_plate = req.body.license_plate;
    if (req.body.price_per_day)
      updateData.price_per_day = parseFloat(req.body.price_per_day);
    if (req.body.availability)
      updateData.availability = req.body.availability === "true";
    if (req.body.location) updateData.location = req.body.location;

    if (req.file) {
      // ลบรูปเก่าก่อน (หากมี)
      const oldCar = await prisma.car.findUnique({
        where: { id: parseInt(id) },
      });
      if (oldCar && oldCar.picture) fs.unlinkSync(`images/${oldCar.picture}`);

      updateData.picture = req.file.filename;
    }

    try {
      const car = await prisma.car.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
      res.json(car);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    // ลบรูปก่อน (ถ้ามี)
    const car = await prisma.car.findUnique({ where: { id: parseInt(id) } });
    if (car && car.picture) fs.unlinkSync(`images/${car.picture}`);

    await prisma.car.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
