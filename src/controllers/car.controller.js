const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllCars = async (req, res) => {
  try {
    console.log("Fetching all cars...");
    const cars = await prisma.car.findMany({
      select: {
        id: true,
        name: true,
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

const create = async (req, res) => {
  try {
    const car = await prisma.car.create({
      data: req.body,
    });
    res.status(201).json(car);
  } catch (error) {
    console.error("Error creating car:", error);
    res.status(500).json({ error: "Failed to create car", details: error.message });
  }
};

const put = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await prisma.car.update({
      where: { id: id },
      data: req.body,
    });
    res.json(car);
  } catch (error) {
    console.error("Error updating car:", error);
    res.status(500).json({ error: "Failed to update car", details: error.message });
  }
};

const patch = async (req, res) => {
  try {
    const { id } = req.params;
    const car = await prisma.car.update({
      where: { id: id },
      data: req.body,
    });
    res.json(car);
  } catch (error) {
    console.error("Error patching car:", error);
    res.status(500).json({ error: "Failed to patch car", details: error.message });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.car.delete({
      where: { id: id },
    });
    res.json({ message: "Car deleted successfully" });
  } catch (error) {
    console.error("Error deleting car:", error);
    res.status(500).json({ error: "Failed to delete car", details: error.message });
  }
};

module.exports = { getAllCars, getCarById, create, put, patch, delete: deleteCar };
