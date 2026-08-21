const prisma = require("../prisma/client");

// ==========================================
// GET MY PROFILE
// ==========================================

async function getMyProfile(req, res) {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        faydaNumber: true,
        gender: true,
        maritalStatus: true,
        familyNumber: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);

    return res.status(500).json({
      error: "Failed to load profile",
      details: error.message,
    });
  }
}

// ==========================================
// UPDATE MY PROFILE
// ==========================================

async function updateMyProfile(req, res) {
  try {
    const userId = req.user.userId;

    const {
      fullName,
      phone,
      faydaNumber,
      gender,
      maritalStatus,
      familyNumber,
    } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({
        error: "Full name is required",
      });
    }

    if (
      familyNumber !== null &&
      familyNumber !== undefined &&
      familyNumber !== ""
    ) {
      const parsedFamilyNumber = Number(familyNumber);

      if (
        !Number.isInteger(parsedFamilyNumber) ||
        parsedFamilyNumber < 0
      ) {
        return res.status(400).json({
          error: "Family number must be a valid number",
        });
      }
    }

    const user = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        fullName: fullName.trim(),
        phone: phone?.trim() || null,
        faydaNumber: faydaNumber?.trim() || null,
        gender: gender?.trim() || null,
        maritalStatus: maritalStatus?.trim() || null,
        familyNumber:
          familyNumber === "" ||
          familyNumber === null ||
          familyNumber === undefined
            ? null
            : Number(familyNumber),
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        faydaNumber: true,
        gender: true,
        maritalStatus: true,
        familyNumber: true,
        createdAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);

    return res.status(500).json({
      error: "Failed to update profile",
      details: error.message,
    });
  }
}

module.exports = {
  getMyProfile,
  updateMyProfile,
};