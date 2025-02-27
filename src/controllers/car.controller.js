import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getAllCars = async (req, res) => {
  try {
    const cars = await prisma.car.findMany();
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch cars" });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // ไม่ต้องใช้ ObjectId.isValid(id) เพราะ Prisma จัดการให้เอง
    const car = await prisma.car.findUnique({
      where: { id: id },
    });

    if (!car) {
      return res.status(404).json({ error: "Car not found" });
    }
    
    res.json(car);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch car" });
  }
};
