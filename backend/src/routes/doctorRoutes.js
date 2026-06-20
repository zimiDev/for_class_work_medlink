const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const doctorController = require('../controllers/doctorController');
const doctors = require('../data/doctors');

// GET /api/doctors — List all doctors (all authenticated roles)
router.get('/', authMiddleware, doctorController.getAll);

// GET /api/doctors/by-shift/:shift — List doctors by shift (all authenticated roles)
router.get('/by-shift/:shift', authMiddleware, (req, res) => {
  const { shift } = req.params;
  const filtered = doctors.filter(d => d.shift === shift);
  return res.json({ data: filtered, total: filtered.length });
});

// GET /api/doctors/:id — Get single doctor (all authenticated roles)
router.get('/:id', authMiddleware, doctorController.getById);

// POST /api/doctors — Create a doctor (Admin only)
router.post('/', authMiddleware, authorize('Admin'), doctorController.create);

// PUT /api/doctors/:id — Update a doctor (Admin only)
router.put('/:id', authMiddleware, authorize('Admin'), doctorController.update);

// DELETE /api/doctors/:id — Delete a doctor (Admin only)
router.delete('/:id', authMiddleware, authorize('Admin'), doctorController.remove);

module.exports = router;
