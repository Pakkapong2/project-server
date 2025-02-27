const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany();
    res.json(cars);
  } catch (error) {
    console.error("Error fetching cars:", error);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // แปลง id เป็นตัวเลขถ้าต้องการ (ขึ้นอยู่กับ Prisma schema)
    const car = await prisma.car.findUnique({
      where: { id: isNaN(id) ? id : Number(id) },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    
    res.json(car);
  } catch (error) {
    console.error("Error fetching car by ID:", error);
    res.status(500).json({ error: "Failed to fetch car" });
  }
};
module.exports = { getAllCars, getCarById };