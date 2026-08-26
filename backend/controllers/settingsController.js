const prisma = require("../prisma/client");
const bcrypt = require("bcrypt");

// GET USER SETTINGS PROFILE
async function getSettings(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        idNumber: user.faydaNumber // Mapped for frontend compatibility
      }
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to fetch settings profile" });
  }
}

// UPDATE USER SETTINGS PROFILE & PASSWORD
async function updateSettings(req, res) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, error: "Authentication required" });
    }

    const { fullName, phone, idNumber, gender, maritalStatus, familyNumber, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const updateData = {};
    if (fullName !== undefined) updateData.fullName = fullName.trim();
    if (phone !== undefined) updateData.phone = phone.trim();
    if (idNumber !== undefined) updateData.faydaNumber = idNumber.trim();
    if (gender !== undefined) updateData.gender = gender;
    if (maritalStatus !== undefined) updateData.maritalStatus = maritalStatus;
    if (familyNumber !== undefined) updateData.familyNumber = Number(familyNumber) || null;

    // Handle Password Change if requested
    if (newPassword && newPassword.trim() !== "") {
      if (!currentPassword) {
        return res.status(400).json({ success: false, error: "Current password is required to set a new password" });
      }
      const passwordMatches = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!passwordMatches) {
        return res.status(401).json({ success: false, error: "Incorrect current password" });
      }
      updateData.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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
      }
    });

    return res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      user: {
        ...updatedUser,
        idNumber: updatedUser.faydaNumber
      }
    });
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);
    return res.status(500).json({ success: false, error: "Failed to update settings" });
  }
}

module.exports = {
  getSettings,
  updateSettings,
};