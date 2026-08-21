const {
  createLeaseFromRequest,
  getLeasesForUser,
  updateLeaseStatus,
} = require('../services/leaseService');

async function createLease(req, res) {
  try {
    const lease = await createLeaseFromRequest({
      ...req.body,
      landlordId: req.user.userId,
    });

    return res.status(201).json(lease);
  } catch (error) {
    console.error(error);
    if (error.message === 'RENTAL_REQUEST_NOT_FOUND') {
      return res.status(404).json({ error: 'Rental request not found' });
    }
    if (error.message === 'Only approved rental requests can create a lease') {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Something went wrong while creating lease' });
  }
}

async function listLeases(req, res) {
  try {
    const leases = await getLeasesForUser(req.user.userId, req.user.role);
    return res.json(leases);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Something went wrong while fetching leases' });
  }
}

async function updateLease(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'status is required' });
    }

    const lease = await updateLeaseStatus(id, req.user.userId, req.user.role, status);
    return res.json(lease);
  } catch (error) {
    console.error(error);
    if (error.message === 'LEASE_NOT_FOUND') {
      return res.status(404).json({ error: 'Lease not found' });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ error: 'You are not allowed to update this lease' });
    }
    return res.status(500).json({ error: 'Something went wrong while updating lease' });
  }
}

module.exports = {
  createLease,
  listLeases,
  updateLease,
};
