const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const patientController = require('../controllers/patientController');

// GET /api/patients — List all patients (all authenticated roles)
router.get('/', authMiddleware, patientController.getAll);

// GET /api/patients/:id — Get single patient (all authenticated roles)
router.get('/:id', authMiddleware, patientController.getById);

// POST /api/patients — Create patient (Admin, Receptionist only)
router.post('/', authMiddleware, authorize('Admin', 'Receptionist'), patientController.create);

// PUT /api/patients/:id — Update patient (Admin, Clinician, Receptionist)
router.put('/:id', authMiddleware, authorize('Admin', 'Clinician', 'Receptionist'), patientController.update);

// DELETE /api/patients/:id — Delete patient (Admin only)
router.delete('/:id', authMiddleware, authorize('Admin'), patientController.remove);

module.exports = router;
