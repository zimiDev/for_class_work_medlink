const { v4: uuidv4 } = require('uuid');
const doctors = require('../data/doctors');
const patients = require('../data/patients');
const users = require('../data/users');
const bcrypt = require('bcrypt');
const { getPaginationParams, buildPaginationResponse } = require('../utils/helpers');
const VALID_SHIFTS = ['day', 'night', 'rotating'];

/**
 * Get all doctors with optional search, filter, and pagination
 * GET /api/doctors
 */
const getAll = async (req, res) => {
  try {
    const { search, department, shift } = req.query;
    const { page, limit } = getPaginationParams(req.query);

    let filtered = [...doctors];

    // Search by name, specialty, or department (case-insensitive)
    if (search) {
      const term = search.toLowerCase();
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(term) ||
        d.specialty.toLowerCase().includes(term) ||
        d.department.toLowerCase().includes(term)
      );
    }

    // Filter by exact department
    if (department) {
      const term = department.toLowerCase();
      filtered = filtered.filter(d => d.department.toLowerCase().includes(term));
    }

    if (shift) {
      if (!VALID_SHIFTS.includes(shift)) {
        return res.status(400).json({ error: 'Invalid shift. Must be one of: day, night, rotating' });
      }
      filtered = filtered.filter(d => d.shift === shift);
    }

    // Sort by created_at descending
    filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const total = filtered.length;

    // Paginate
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return res.json(buildPaginationResponse(paginated, total, page, limit));
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get a single doctor by ID
 * GET /api/doctors/:id
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const doctor = doctors.find(d => d.id === id);

    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const patientsList = patients.filter(p => p.doctor_id === id);

    return res.json({ data: { ...doctor, patients: patientsList } });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Create a new doctor
 * POST /api/doctors
 */
const create = async (req, res) => {
  try {
    const { name, specialty, department, contact, username, password, position, shift } = req.body;

    // Validate required fields
    if (!name || !specialty || !department || !username || !password || !position) {
      return res.status(400).json({ error: 'Missing required fields. Account credentials (username, password) and doctor details are required.' });
    }

    if (shift && !VALID_SHIFTS.includes(shift)) {
      return res.status(400).json({ error: 'Invalid shift. Must be one of: day, night, rotating' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check for duplicate username
    const existingUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ error: 'Username already exists' });
    }

    // Hash clinician password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = uuidv4();

    // 1. Create Clinician user account
    const newUser = {
      id: userId,
      username,
      email: `${username}@caretrack.com`,
      password: hashedPassword,
      role: 'Clinician',
      created_at: new Date().toISOString(),
    };
    users.push(newUser);

    // 2. Create Doctor profile and link using user_id
    const newDoctor = {
      id: uuidv4(),
      user_id: userId,
      name,
      specialty,
      department,
      contact: contact || null,
      position,
      shift: shift || 'day',
      created_at: new Date().toISOString(),
    };
    doctors.push(newDoctor);

    return res.status(201).json({ data: newDoctor });
  } catch (error) {
    console.error('Error creating doctor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update an existing doctor
 * PUT /api/doctors/:id
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialty, department, contact, position, shift } = req.body;

    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    if (shift && !VALID_SHIFTS.includes(shift)) {
      return res.status(400).json({ error: 'Invalid shift. Must be one of: day, night, rotating' });
    }

    const existing = doctors[index];
    doctors[index] = {
      ...existing,
      name: name || existing.name,
      specialty: specialty || existing.specialty,
      department: department || existing.department,
      contact: contact !== undefined ? contact : existing.contact,
      position: position || existing.position,
      shift: shift || existing.shift,
    };

    return res.json({ data: doctors[index] });
  } catch (error) {
    console.error('Error updating doctor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a doctor
 * DELETE /api/doctors/:id
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const index = doctors.findIndex(d => d.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Set doctor_id to null for patients assigned to this doctor (ON DELETE SET NULL)
    patients.forEach(patient => {
      if (patient.doctor_id === id) {
        patient.doctor_id = null;
      }
    });

    doctors.splice(index, 1);

    return res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAll, getById, create, update, remove };
