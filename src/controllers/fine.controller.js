const { PrismaClient } = require("@prisma/client");
const { ObjectId } = require("mongodb"); // ใช้ ObjectId สำหรับ MongoDB
const prisma = new PrismaClient();


const createFine = async (req, res) => {
  try {
    const { bookingId, overdueDays, isDamaged, fineAmount } = req.body;

    if (!ObjectId.isValid(bookingId)) {
      return res.status(400).json({ error: "Invalid booking ID" });
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    
    const existingFine = await prisma.fine.findUnique({ where: { bookingId } });
    if (existingFine) {
      return res.status(400).json({ error: "Fine already exists for this booking" });
    }

    const fine = await prisma.fine.create({
      data: {
        bookingId,
        overdueDays: overdueDays ? parseInt(overdueDays) : 0,
        isDamaged: Boolean(isDamaged),
        fineAmount: fineAmount ? parseInt(fineAmount) : 0,
      },
    });

    res.status(201).json(fine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getFines = async (req, res) => {
  try {
    const fines = await prisma.fine.findMany({ include: { booking: true } });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const getFineById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid fine ID" });
    }

    const fine = await prisma.fine.findUnique({
      where: { id },
      include: { booking: true },
    });

    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    res.json(fine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid fine ID" });
    }

    const { overdueDays, isDamaged, fineAmount } = req.body;

    const updatedFine = await prisma.fine.update({
      where: { id },
      data: {
        overdueDays: overdueDays ? parseInt(overdueDays) : undefined,
        isDamaged: isDamaged !== undefined ? Boolean(isDamaged) : undefined,
        fineAmount: fineAmount ? parseInt(fineAmount) : undefined,
      },
    });

    res.json(updatedFine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid fine ID" });
    }

    const fine = await prisma.fine.findUnique({ where: { id } });
    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    await prisma.fine.delete({ where: { id } });

    res.json({ message: "Fine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = {
  createFine,
  getFines,
  getFineById,
  updateFine,
  deleteFine,
};
