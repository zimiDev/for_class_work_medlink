const { v4: uuidv4 } = require('uuid');
const patients = require('../data/patients');
const doctors = require('../data/doctors');
const diagnoses = require('../data/diagnoses');
const { getPaginationParams, buildPaginationResponse } = require('../utils/helpers');
const VALID_GENDERS = ['Male', 'Female', 'Other'];

/**
 * Get all patients with optional search and pagination
 * GET /api/patients
 */
const getAll = async (req, res) => {
  try {
    const { search } = req.query;
    const { page, limit } = getPaginationParams(req.query);

    let filtered = [...patients];

    // Clinician Role Scoping: Only show patients assigned to this doctor
    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (doctor) {
        filtered = filtered.filter(p => p.doctor_id === doctor.id);
      } else {
        filtered = [];
      }
    }

    // Search by first_name, last_name, or phone (case-insensitive)
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(p =>
        p.first_name.toLowerCase().includes(term) ||
        p.last_name.toLowerCase().includes(term) ||
        (p.phone && p.phone.toLowerCase().includes(term))
      );
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = filtered.length;

    // Paginate
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    // Add doctor_name to each patient
    const withDoctorName = paginated.map(patient => {
      const doctor = doctors.find(d => d.id === patient.doctor_id);
      return {
        ...patient,
        doctor_name: doctor ? doctor.name : null,
      };
    });

    return res.json(buildPaginationResponse(withDoctorName, total, page, limit));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single patient by ID with doctor details and diagnoses
 * GET /api/patients/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const patient = patients.find(p => p.id === id);

    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Clinician Role Scoping: Ensure patient belongs to this doctor
    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (!doctor || patient.doctor_id !== doctor.id) {
        return res.status(403).json({ error: 'Access denied: You are not assigned to this patient profile.' });
      }
    }

    // Get doctor details
    const doctor = doctors.find(d => d.id === patient.doctor_id);

    // Get diagnoses for this patient
    const patientDiagnoses = diagnoses
      .filter(d => d.patient_id === id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return res.json({
      data: {
        ...patient,
        doctor: doctor ? {
          name: doctor.name,
          specialty: doctor.specialty,
          department: doctor.department,
          shift: doctor.shift,
          contact: doctor.contact,
        } : null,
        diagnoses: patientDiagnoses,
      }
    });
  } catch (error) {
    console.error('Error fetching patient:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new patient
 * POST /api/patients
 */
const create = async (req, res) => {
  try {
    const { first_name, last_name, age, gender, phone, address, doctor_id } = req.body;

    // Validate required fields
    if (!first_name || !last_name || age === undefined || age === null || !gender) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, age, gender' });
    }

    const numericAge = Number(age);
    if (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 130) {
      return res.status(400).json({ error: 'Age must be an integer between 0 and 130' });
    }

    if (!VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be one of: Male, Female, Other' });
    }

    const normalizedDoctorId = doctor_id || null;

    // If doctor_id is provided, verify the doctor exists
    if (normalizedDoctorId) {
      const doctorExists = doctors.find(d => d.id === normalizedDoctorId);
      if (!doctorExists) {
        return res.status(400).json({ error: 'Referenced doctor does not exist' });
      }
    }

    const newPatient = {
      id: uuidv4(),
      first_name,
      last_name,
      age: numericAge,
      gender,
      phone: phone || null,
      address: address || null,
      doctor_id: normalizedDoctorId,
      created_at: new Date().toISOString(),
    };

    patients.push(newPatient);

    return res.status(201).json({ data: newPatient });
  } catch (error) {
    console.error('Error creating patient:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an existing patient
 * PUT /api/patients/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, age, gender, phone, address, doctor_id } = req.body;

    const index = patients.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    const existing = patients[index];

    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (!doctor || existing.doctor_id !== doctor.id) {
        return res.status(403).json({ error: 'Access denied: You are not assigned to this patient profile.' });
      }
      if (doctor_id !== undefined && doctor_id !== doctor.id) {
        return res.status(403).json({ error: 'Clinicians cannot reassign patients to another doctor.' });
      }
    }

    if (age !== undefined) {
      const numericAge = Number(age);
      if (!Number.isInteger(numericAge) || numericAge < 0 || numericAge > 130) {
        return res.status(400).json({ error: 'Age must be an integer between 0 and 130' });
      }
    }

    if (gender !== undefined && !VALID_GENDERS.includes(gender)) {
      return res.status(400).json({ error: 'Invalid gender. Must be one of: Male, Female, Other' });
    }

    const normalizedDoctorId = doctor_id === undefined ? existing.doctor_id : (doctor_id || null);

    if (normalizedDoctorId) {
      const doctorExists = doctors.find(d => d.id === normalizedDoctorId);
      if (!doctorExists) {
        return res.status(400).json({ error: 'Referenced doctor does not exist' });
      }
    }

    patients[index] = {
      ...existing,
      first_name: first_name || existing.first_name,
      last_name: last_name || existing.last_name,
      age: age !== undefined ? Number(age) : existing.age,
      gender: gender || existing.gender,
      phone: phone !== undefined ? phone : existing.phone,
      address: address !== undefined ? address : existing.address,
      doctor_id: normalizedDoctorId,
    };

    return res.json({ data: patients[index] });
  } catch (error) {
    console.error('Error updating patient:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a patient (cascade: remove their diagnoses too)
 * DELETE /api/patients/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const index = patients.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Cascade delete: remove all diagnoses for this patient
    for (let i = diagnoses.length - 1; i >= 0; i--) {
      if (diagnoses[i].patient_id === id) {
        diagnoses.splice(i, 1);
      }
    }

    patients.splice(index, 1);

    return res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
