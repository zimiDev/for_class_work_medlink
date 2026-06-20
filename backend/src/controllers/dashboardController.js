const doctors = require('../data/doctors');
const patients = require('../data/patients');
const diagnoses = require('../data/diagnoses');

/**
 * Dashboard Controller
 * Provides summary statistics for the dashboard page.
 */

/**
 * getStats - Returns total counts and recent records
 * GET /api/dashboard/stats
 */
const getStats = async (req, res) => {
  try {
    let filteredPatients = [...patients];
    let filteredDiagnoses = [...diagnoses];

    // Clinician Role Scoping: Only compute stats and recents for assigned patients
    if (req.user.role === 'Clinician') {
      const doctor = doctors.find(d => d.user_id === req.user.id);
      if (doctor) {
        filteredPatients = patients.filter(p => p.doctor_id === doctor.id);
        const doctorPatientIds = filteredPatients.map(p => p.id);
        filteredDiagnoses = diagnoses.filter(d => doctorPatientIds.includes(d.patient_id));
      } else {
        filteredPatients = [];
        filteredDiagnoses = [];
      }
    }

    // Total counts
    const totalDoctors = doctors.length;
    const totalPatients = filteredPatients.length;
    const totalDiagnoses = filteredDiagnoses.length;
    const dayShiftCount = doctors.filter(d => d.shift === 'day').length;
    const nightShiftCount = doctors.filter(d => d.shift === 'night').length;
    const rotatingShiftCount = doctors.filter(d => d.shift === 'rotating').length;
    const severityStats = {
      mild: filteredDiagnoses.filter(d => d.severity === 'mild').length,
      moderate: filteredDiagnoses.filter(d => d.severity === 'moderate').length,
      severe: filteredDiagnoses.filter(d => d.severity === 'severe').length,
    };

    // Recent patients (5 most recent, sorted by created_at descending)
    const recentPatients = [...filteredPatients]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        age: p.age,
        gender: p.gender,
        created_at: p.created_at,
      }));

    // Recent diagnoses (5 most recent, with patient name)
    const recentDiagnoses = [...filteredDiagnoses]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(d => {
        const patient = patients.find(p => p.id === d.patient_id);
        return {
          id: d.id,
          icd_code: d.icd_code,
          description: d.description,
          severity: d.severity,
          created_at: d.created_at,
          patient_name: patient ? `${patient.first_name} ${patient.last_name}` : null,
        };
      });

    res.json({
      data: {
        totalDoctors,
        totalPatients,
        totalDiagnoses,
        shiftStats: {
          day: dayShiftCount,
          night: nightShiftCount,
          rotating: rotatingShiftCount,
        },
        severityStats,
        recentPatients,
        recentDiagnoses,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getStats };
