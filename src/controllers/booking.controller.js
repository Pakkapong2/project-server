const { PrismaClient } = require("@prisma/client");
const { ObjectId } = require("mongodb");
const prisma = new PrismaClient();

const createBooking = async (req, res) => {
  try {
    const { userId, carId, bookingDate, returnDate } = req.body;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(carId)) {
      return res.status(400).json({ error: "Invalid userId or carId" });
    }

    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || !car.availability) {
      return res.status(400).json({ error: "Car is not available for booking" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        carId,
        bookingDate: new Date(bookingDate),
        returnDate: new Date(returnDate),
      },
      include: { user: true, car: true },
    });

    await prisma.car.update({
      where: { id: carId },
      data: { availability: false },
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBookings = async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: { user: true, car: true, fine: true }, // ✅ ดึงข้อมูล User, Car และ Fine มาด้วย
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: ObjectId(id) },
      include: { user: true, car: true, fine: true },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBookingPut = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, carId, bookingDate, returnDate, fine } = req.body;

    if (!ObjectId.isValid(id) || !ObjectId.isValid(userId) || !ObjectId.isValid(carId)) {
      return res.status(400).json({ error: "Invalid ID format" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: ObjectId(id) },
      data: {
        userId,
        carId,
        bookingDate: new Date(bookingDate),
        returnDate: new Date(returnDate),
        fine: fine || undefined, // ✅ แก้ให้ใช้ undefined แทน null
      },
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBookingPatch = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {};

    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid booking ID" });

    if (req.body.userId) updateData.userId = req.body.userId;
    if (req.body.carId) updateData.carId = req.body.carId;
    if (req.body.bookingDate) updateData.bookingDate = new Date(req.body.bookingDate);
    if (req.body.returnDate) updateData.returnDate = new Date(req.body.returnDate);
    if (req.body.fine) updateData.fine = req.body.fine || undefined;

    const updatedBooking = await prisma.booking.update({
      where: { id: ObjectId(id) },
      data: updateData,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) return res.status(400).json({ error: "Invalid booking ID" });

    const booking = await prisma.booking.findUnique({ where: { id: ObjectId(id) } });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    await prisma.fine.deleteMany({ where: { bookingId: ObjectId(id) } });

    await prisma.car.update({
      where: { id: booking.carId },
      data: { availability: true },
    });

    await prisma.booking.delete({ where: { id: ObjectId(id) } });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBookingPut,
  updateBookingPatch,
  deleteBooking,
};
