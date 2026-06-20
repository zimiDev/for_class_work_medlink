const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const diagnosisController = require('../controllers/diagnosisController');

// GET /api/diagnoses — List all diagnoses (Admin, Clinician only)
router.get('/', authMiddleware, authorize('Admin', 'Clinician'), diagnosisController.getAll);

// GET /api/diagnoses/:id — Get single diagnosis (Admin, Clinician only)
router.get('/:id', authMiddleware, authorize('Admin', 'Clinician'), diagnosisController.getById);

// POST /api/diagnoses — Create diagnosis (Admin, Clinician only)
router.post('/', authMiddleware, authorize('Admin', 'Clinician'), diagnosisController.create);

// PUT /api/diagnoses/:id — Update diagnosis (Admin, Clinician only)
router.put('/:id', authMiddleware, authorize('Admin', 'Clinician'), diagnosisController.update);

// DELETE /api/diagnoses/:id — Delete diagnosis (Admin only)
router.delete('/:id', authMiddleware, authorize('Admin'), diagnosisController.remove);

module.exports = router;
