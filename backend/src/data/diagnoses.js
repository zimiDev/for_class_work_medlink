const { v4: uuidv4 } = require('uuid');
const patients = require('./patients');

const seedDiagnoses = [
  [0, 'I25.1', 'Surunkali ishemik yurak kasalligi', 'severe'],
  [1, 'G43.9', 'Migran, aniqlanmagan', 'moderate'],
  [2, 'J06.9', "O'tkir yuqori nafas yo'llari infeksiyasi", 'mild'],
  [3, 'M17.9', 'Tizza osteoartriti, aniqlanmagan', 'moderate'],
  [4, 'L20.9', 'Atopik dermatit, aniqlanmagan', 'mild'],
  [5, 'N92.0', "Ko'p va tez-tez hayz ko'rish", 'moderate'],
  [6, 'H40.9', 'Glaukoma, aniqlanmagan', 'severe'],
  [7, 'K02.9', 'Tish kariyesi, aniqlanmagan', 'mild'],
  [8, 'F41.1', 'Umumiy xavotir buzilishi', 'moderate'],
  [9, 'C50.9', "Ko'krak bezi xavfli o'smasi", 'severe'],
  [10, 'E11.9', 'Asoratlanmagan 2-tur qandli diabet', 'moderate'],
  [11, 'M06.9', 'Revmatoid artrit, aniqlanmagan', 'moderate'],
  [12, 'J45.9', 'Astma, aniqlanmagan', 'moderate'],
  [13, 'I10', 'Birlamchi gipertenziya', 'moderate'],
  [14, 'E03.9', 'Gipotireoz, aniqlanmagan', 'mild'],
  [15, 'A09', 'Infeksion gastroenterit va kolit', 'mild'],
  [16, 'C34.9', "Bronx yoki o'pkaning xavfli o'smasi", 'severe'],
  [17, 'O20.0', 'Homiladorlikda qon ketish xavfi', 'severe'],
  [18, 'M54.5', "Bel sohasidagi og'riq", 'moderate'],
  [19, 'G40.9', 'Epilepsiya, aniqlanmagan', 'severe'],
  [0, 'E78.5', 'Giperlipidemiya, aniqlanmagan', 'mild'],
  [1, 'R51', "Bosh og'rig'i", 'mild'],
  [2, 'H66.9', "O'rta quloq yallig'lanishi", 'mild'],
  [3, 'S72.0', "Son suyagi bo'yni sinishi", 'severe'],
  [4, 'B35.4', 'Tana dermatofitozi', 'mild'],
  [5, 'N76.0', 'Otkir vaginit', 'mild'],
  [6, 'H52.1', 'Miopiya', 'mild'],
  [7, 'K05.1', 'Surunkali gingivit', 'mild'],
  [8, 'F32.1', 'O' + "'rta darajadagi depressiv epizod", 'moderate'],
  [10, 'E05.9', 'Tireotoksikoz, aniqlanmagan', 'moderate'],
];

const diagnoses = seedDiagnoses.map(([patientIndex, icd_code, description, severity], index) => ({
  id: uuidv4(),
  patient_id: patients[patientIndex]?.id || patients[0].id,
  icd_code,
  description,
  severity,
  created_at: new Date(Date.now() - index * 10800000).toISOString(),
}));

module.exports = diagnoses;
