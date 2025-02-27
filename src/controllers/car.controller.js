const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllCars = async (req, res) => {
  try {
    console.log("Fetching all cars...");
    const cars = await prisma.car.findMany({
      select: {
        id: true,
        name: true,  // เพิ่ม name
        brand: true,
        model: true,
        license_plate: true,
        price_per_day: true,
        availability: true,
        picture: true,
        location: true,
      },
    });

    console.log("Cars fetched:", cars);
    res.json(cars);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch cars", details: error.message });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await prisma.car.findUnique({
      where: { id: id },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json(car);
  } catch (error) {
    console.error("Database Error:", error);
    res.status(500).json({ error: "Failed to fetch car", details: error.message });
  }
};

// Export ฟังก์ชัน
module.exports = { getAllCars, getCarById };
