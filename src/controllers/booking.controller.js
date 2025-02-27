const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


const createBooking = async (req, res) => {
  try {
    const { userId, carId, bookingDate, returnDate } = req.body;

    // ตรวจสอบว่ารถยนต์พร้อมให้เช่าหรือไม่
    const car = await prisma.car.findUnique({ where: { id: carId } });
    if (!car || !car.availability) {
      return res
        .status(400)
        .json({ error: "Car is not available for booking" });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: parseInt(userId),
        carId: parseInt(carId),
        bookingDate: new Date(bookingDate),
        returnDate: new Date(returnDate),
      },
      include: { user: true, car: true }, 
    });

    // อัปเดตสถานะรถเป็นไม่ว่าง
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
      include: { user: true, car: true, fine: true },
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, car: true, fine: true },
    });

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { returnDate, isDamaged } = req.body;

    // ค้นหาข้อมูลการจอง
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { car: true },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ตรวจสอบว่าวันคืนรถเกินกำหนดหรือไม่
    const actualReturnDate = new Date(returnDate);
    const expectedReturnDate = new Date(booking.returnDate);
    let overdueDays = 0;
    if (actualReturnDate > expectedReturnDate) {
      overdueDays = Math.ceil(
        (actualReturnDate - expectedReturnDate) / (1000 * 60 * 60 * 24)
      );
    }

    // **ดึงค่าปรับจาก `config` table**
    const finePerDayConfig = await prisma.config.findUnique({ where: { key: "finePerDay" } });
    const damageFineConfig = await prisma.config.findUnique({ where: { key: "damageFine" } });

    // **กำหนดค่าปรับ**
    const finePerDay = finePerDayConfig ? parseInt(finePerDayConfig.value) : 100;
    const damageFine = isDamaged ? (damageFineConfig ? parseInt(damageFineConfig.value) : 500) : 0;
    const totalFine = overdueDays * finePerDay + damageFine;

    // **อัปเดตข้อมูลค่าปรับ ถ้ามีค่าปรับเกิดขึ้น**
    if (totalFine > 0) {
      await prisma.fine.create({
        data: {
          bookingId: parseInt(id),
          overdueDays,
          isDamaged: Boolean(isDamaged),
          fineAmount: totalFine,
        },
      });
    }

    // **อัปเดตข้อมูลการจอง**
    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { returnDate: actualReturnDate },
    });

    // **อัปเดตสถานะรถให้พร้อมใช้งาน**
    await prisma.car.update({
      where: { id: booking.car.id },
      data: { availability: true },
    });

    res.json({ updatedBooking, totalFine });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;

    // ค้นหาการจองก่อนลบ
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // ลบค่าปรับถ้ามี
    await prisma.fine.deleteMany({ where: { bookingId: parseInt(id) } });

    // อัปเดตสถานะรถให้พร้อมใช้งาน
    await prisma.car.update({
      where: { id: booking.carId },
      data: { availability: true },
    });

    // ลบการจอง
    await prisma.booking.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Booking deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateBookingPut = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, carId, bookingDate, returnDate, fine } = req.body;

    // ตรวจสอบว่ามีค่าครบหรือไม่
    if (!userId || !carId || !bookingDate || !returnDate) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: {
        userId: parseInt(userId),
        carId: parseInt(carId),
        bookingDate: new Date(bookingDate),
        returnDate: new Date(returnDate),
        fine: fine || null, // ถ้ามีค่าปรับให้เก็บ
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

    // ตรวจสอบว่ามีค่าที่ต้องการอัปเดตหรือไม่
    if (req.body.userId) updateData.userId = parseInt(req.body.userId);
    if (req.body.carId) updateData.carId = parseInt(req.body.carId);
    if (req.body.bookingDate)
      updateData.bookingDate = new Date(req.body.bookingDate);
    if (req.body.returnDate)
      updateData.returnDate = new Date(req.body.returnDate);
    if (req.body.fine) updateData.fine = req.body.fine;

    const updatedBooking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  updateBookingPut,
  updateBookingPatch,
};
