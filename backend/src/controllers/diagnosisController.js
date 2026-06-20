const { v4: uuidv4 } = require('uuid');
const diagnoses = require('../data/diagnoses');
const patients = require('../data/patients');
const doctors = require('../data/doctors');
const { getPaginationParams, buildPaginationResponse } = require('../utils/helpers');

const VALID_SEVERITIES = ['mild', 'moderate', 'severe'];

/**
 * Get all diagnoses with search, severity filter, and pagination
 * GET /api/diagnoses
 */
const getAll = async (req, res) => {
  try {
    const { search, severity } = req.query;
    const { page, limit } = getPaginationParams(req.query);

    let filtered = [...diagnoses];

    // Clinician Role Scoping: Only show diagnoses for patients assigned to this doctor
    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (doctor) {
        const doctorPatients = patients.filter(p => p.doctor_id === doctor.id);
        const doctorPatientIds = doctorPatients.map(p => p.id);
        filtered = filtered.filter(d => doctorPatientIds.includes(d.patient_id));
      } else {
        filtered = [];
      }
    }

    // Search by icd_code or description (case-insensitive)
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.icd_code.toLowerCase().includes(term) ||
        d.description.toLowerCase().includes(term)
      );
    }

    // Filter by severity
    if (severity) {
      filtered = filtered.filter(d => d.severity === severity);
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = filtered.length;

    // Paginate
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    // Add patient_name to each diagnosis
    const withPatientName = paginated.map(diagnosis => {
      const patient = patients.find(p => p.id === diagnosis.patient_id);
      return {
        ...diagnosis,
        patient_name: patient ? `${patient.first_name} ${patient.last_name}` : null,
      };
    });

    return res.json(buildPaginationResponse(withPatientName, total, page, limit));
  } catch (error) {
    console.error('Error fetching diagnoses:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single diagnosis by ID
 * GET /api/diagnoses/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosis = diagnoses.find(d => d.id === id);

    if (!diagnosis) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    // Clinician Role Scoping: Ensure diagnosis belongs to this doctor's patient
    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (doctor) {
        const patient = patients.find(p => p.id === diagnosis.patient_id);
        if (!patient || patient.doctor_id !== doctor.id) {
          return res.status(403).json({ error: 'Access denied: Patient is not assigned to you.' });
        }
      } else {
        return res.status(403).json({ error: 'Access denied: Patient is not assigned to you.' });
      }
    }

    return res.json({ data: diagnosis });
  } catch (error) {
    console.error('Error fetching diagnosis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new diagnosis
 * POST /api/diagnoses
 */
const create = async (req, res) => {
  try {
    const { patient_id, icd_code, description, severity } = req.body;

    // Validate required fields
    if (!patient_id || !icd_code || !description || !severity) {
      return res.status(400).json({ error: 'Missing required fields: patient_id, icd_code, description, severity' });
    }

    // Validate severity value
    if (!VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity. Must be one of: mild, moderate, severe' });
    }

    // Verify patient exists
    const patientExists = patients.find(p => p.id === patient_id);
    if (!patientExists) {
      return res.status(400).json({ error: 'Referenced patient does not exist' });
    }

    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (!doctor || patientExists.doctor_id !== doctor.id) {
        return res.status(403).json({ error: 'Access denied: Patient is not assigned to you.' });
      }
    }

    const newDiagnosis = {
      id: uuidv4(),
      patient_id,
      icd_code,
      description,
      severity,
      created_at: new Date().toISOString(),
    };

    diagnoses.push(newDiagnosis);

    return res.status(201).json({ data: newDiagnosis });
  } catch (error) {
    console.error('Error creating diagnosis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an existing diagnosis
 * PUT /api/diagnoses/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const index = diagnoses.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    const { patient_id, icd_code, description, severity } = req.body;

    // Validate severity if provided
    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return res.status(400).json({ error: 'Invalid severity. Must be one of: mild, moderate, severe' });
    }

    if (patient_id) {
      const patientExists = patients.find(p => p.id === patient_id);
      if (!patientExists) {
        return res.status(400).json({ error: 'Referenced patient does not exist' });
      }
    }

    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      const nextPatientId = patient_id || diagnoses[index].patient_id;
      const patient = patients.find(p => p.id === nextPatientId);
      if (!doctor || !patient || patient.doctor_id !== doctor.id) {
        return res.status(403).json({ error: 'Access denied: Patient is not assigned to you.' });
      }
    }

    const existing = diagnoses[index];
    diagnoses[index] = {
      ...existing,
      patient_id: patient_id || existing.patient_id,
      icd_code: icd_code || existing.icd_code,
      description: description || existing.description,
      severity: severity || existing.severity,
    };

    return res.json({ data: diagnoses[index] });
  } catch (error) {
    console.error('Error updating diagnosis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a diagnosis
 * DELETE /api/diagnoses/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const index = diagnoses.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Diagnosis not found' });
    }

    diagnoses.splice(index, 1);

    return res.json({ message: 'Diagnosis deleted successfully' });
  } catch (error) {
    console.error('Error deleting diagnosis:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
