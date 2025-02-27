const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// ✅ เพิ่มค่าปรับใหม่
const createFine = async (req, res) => {
  try {
    const { bookingId, overdueDays, isDamaged, fineAmount } = req.body;

    // ตรวจสอบว่ามี Booking จริงหรือไม่
    const booking = await prisma.booking.findUnique({ where: { id: parseInt(bookingId) } });
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // ตรวจสอบว่าค่าปรับของ Booking นี้มีอยู่แล้วหรือไม่
    const existingFine = await prisma.fine.findUnique({ where: { bookingId: parseInt(bookingId) } });
    if (existingFine) {
      return res.status(400).json({ error: "Fine already exists for this booking" });
    }

    // สร้างค่าปรับใหม่
    const fine = await prisma.fine.create({
      data: {
        bookingId: parseInt(bookingId),
        overdueDays: parseInt(overdueDays) || 0,
        isDamaged: Boolean(isDamaged),
        fineAmount: parseInt(fineAmount) || 0,
      },
    });

    res.status(201).json(fine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ดึงข้อมูลค่าปรับทั้งหมด
const getFines = async (req, res) => {
  try {
    const fines = await prisma.fine.findMany({
      include: { booking: true },
    });
    res.json(fines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ ดึงค่าปรับตาม ID
const getFineById = async (req, res) => {
  try {
    const { id } = req.params;
    const fine = await prisma.fine.findUnique({
      where: { id: parseInt(id) },
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

// ✅ อัปเดตค่าปรับ
const updateFine = async (req, res) => {
  try {
    const { id } = req.params;
    const { overdueDays, isDamaged, fineAmount } = req.body;

    const updatedFine = await prisma.fine.update({
      where: { id: parseInt(id) },
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

// ✅ ลบค่าปรับ
const deleteFine = async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่ามีค่าปรับอยู่จริงหรือไม่
    const fine = await prisma.fine.findUnique({ where: { id: parseInt(id) } });
    if (!fine) {
      return res.status(404).json({ error: "Fine not found" });
    }

    await prisma.fine.delete({ where: { id: parseInt(id) } });

    res.json({ message: "Fine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Export ฟังก์ชันทั้งหมด
module.exports = {
  createFine,
  getFines,
  getFineById,
  updateFine,
  deleteFine,
};
