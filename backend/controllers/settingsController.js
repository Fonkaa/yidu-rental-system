const prisma = require('../prisma/client');

async function getCommissionRate(req, res) {
  try {
    let setting = await prisma.commissionSetting.findFirst();

    if (!setting) {
      setting = await prisma.commissionSetting.create({
        data: { ratePercent: 10 },
      });
    }

    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong fetching the commission rate' });
  }
}

async function updateCommissionRate(req, res) {
  try {
    const { ratePercent } = req.body;

    if (ratePercent === undefined || ratePercent < 0 || ratePercent > 100) {
      return res.status(400).json({ error: 'ratePercent must be a number between 0 and 100' });
    }

    let setting = await prisma.commissionSetting.findFirst();

    if (!setting) {
      setting = await prisma.commissionSetting.create({
        data: {
          ratePercent: parseFloat(ratePercent),
          updatedByAdminId: req.user.userId,
        },
      });
    } else {
      setting = await prisma.commissionSetting.update({
        where: { id: setting.id },
        data: {
          ratePercent: parseFloat(ratePercent),
          updatedByAdminId: req.user.userId,
        },
      });
    }

    res.json(setting);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong updating the commission rate' });
  }
}

module.exports = { getCommissionRate, updateCommissionRate };