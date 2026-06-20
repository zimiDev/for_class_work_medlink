const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const hashedPassword = bcrypt.hashSync('password123', 10);

const seedUsers = [
  { username: 'admin1', email: 'admin1@caretrack.com', role: 'Admin' },
  { username: 'admin2', email: 'admin2@caretrack.com', role: 'Admin' },
  { username: 'dr.sardor', email: 'sardor@caretrack.com', role: 'Clinician' },
  { username: 'dr.nilufar', email: 'nilufar@caretrack.com', role: 'Clinician' },
  { username: 'dr.bobur', email: 'bobur@caretrack.com', role: 'Clinician' },
  { username: 'receptionist1', email: 'reception1@caretrack.com', role: 'Receptionist' },
  { username: 'reception2', email: 'reception2@caretrack.com', role: 'Receptionist' },
  { username: 'reception3', email: 'reception3@caretrack.com', role: 'Receptionist' },
];

const users = seedUsers.map((user, index) => ({
  id: uuidv4(),
  ...user,
  password: hashedPassword,
  created_at: new Date(Date.now() - index * 86400000).toISOString(),
}));

module.exports = users;
