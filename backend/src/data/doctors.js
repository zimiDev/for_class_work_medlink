const { v4: uuidv4 } = require('uuid');
const users = require('./users');

const POSITIONS = [
  'Bosh shifokor',
  'Shifokor-mutaxassis',
  'Ordinatorlik shifokor',
  'Rezident shifokor',
  'Konsultant shifokor',
  'Kichik tibbiy xodim',
];

const SHIFTS = ['day', 'night', 'rotating'];

const clinicianByUsername = (username) => {
  const user = users.find((item) => item.username === username);
  return user ? user.id : null;
};

const seedDoctors = [
  ['dr.sardor', 'Dr. Sardor Rahimov', 'Kardiologiya', 'Yurak markazi', 'Bosh shifokor', 'day', '+998901110101'],
  ['dr.nilufar', 'Dr. Nilufar Karimova', 'Nevrologiya', 'Miya va Umurtqa', 'Shifokor-mutaxassis', 'night', '+998901110102'],
  ['dr.bobur', 'Dr. Bobur Toshmatov', 'Pediatriya', 'Bolalar salomatligi', 'Shifokor-mutaxassis', 'rotating', '+998901110103'],
  [null, 'Dr. Dilnoza Yusupova', 'Ortopediya', "Suyak va Bo'g'in", 'Konsultant shifokor', 'day', '+998901110104'],
  [null, 'Dr. Alisher Mirzayev', 'Dermatologiya', 'Teri kasalliklari', 'Shifokor-mutaxassis', 'day', '+998901110105'],
  [null, 'Dr. Kamola Hasanova', 'Ginekologiya', 'Ayollar salomatligi', 'Bosh shifokor', 'night', '+998901110106'],
  [null, 'Dr. Jasur Ergashev', 'Oftalmologiya', "Ko'z kasalliklari", 'Ordinatorlik shifokor', 'day', '+998901110107'],
  [null, 'Dr. Mohira Sultanova', 'Stomatologiya', 'Tish davolash', 'Shifokor-mutaxassis', 'day', '+998901110108'],
  [null, 'Dr. Nodir Xolmatov', 'Psixiatriya', 'Ruhiy salomatlik', 'Konsultant shifokor', 'rotating', '+998901110109'],
  [null, 'Dr. Feruza Nazarova', 'Onkologiya', 'Saraton davolash', 'Bosh shifokor', 'day', '+998901110110'],
  [null, 'Dr. Ulugbek Qodirov', 'Endokrinologiya', 'Ichki sekretsiya', 'Rezident shifokor', 'night', '+998901110111'],
  [null, 'Dr. Zulfiya Tursunova', 'Revmatologiya', "Bo'g'im kasalliklari", 'Konsultant shifokor', 'day', '+998901110112'],
];

const doctors = seedDoctors.map(([username, name, specialty, department, position, shift, contact], index) => ({
  id: uuidv4(),
  user_id: username ? clinicianByUsername(username) : null,
  name,
  specialty,
  department,
  contact,
  position: POSITIONS.includes(position) ? position : 'Shifokor-mutaxassis',
  shift: SHIFTS.includes(shift) ? shift : 'day',
  created_at: new Date(Date.now() - index * 43200000).toISOString(),
}));

module.exports = doctors;
