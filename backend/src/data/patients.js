const { v4: uuidv4 } = require('uuid');
const doctors = require('./doctors');

const seedPatients = [
  ['Sardor', 'Nazarov', 42, 'Male', '998901234567', 'Toshkent, Chilonzor tumani', 0],
  ['Malika', 'Yusupova', 28, 'Female', '998901234568', 'Toshkent, Yunusobod tumani', 1],
  ['Aziz', 'Karimov', 11, 'Male', '998901234569', 'Toshkent, Mirzo Ulugbek tumani', 2],
  ['Gulnoza', 'Rahmatova', 56, 'Female', '998901234570', 'Samarqand, Registon mahallasi', 3],
  ['Jahongir', 'Aliyev', 35, 'Male', '998901234571', 'Toshkent, Shayxontohur tumani', 4],
  ['Shahnoza', 'Qodirova', 31, 'Female', '998901234572', 'Buxoro, Gijduvon tumani', 5],
  ['Diyor', 'Ergashev', 67, 'Male', '998901234573', 'Namangan, Chortoq tumani', 6],
  ['Mohira', 'Sultonova', 24, 'Female', '998901234574', 'Fargona, Margilon shahri', 7],
  ['Nodir', 'Xolmatov', 48, 'Male', '998901234575', 'Andijon, Asaka tumani', 8],
  ['Feruza', 'Nazarova', 52, 'Female', '998901234576', 'Qashqadaryo, Qarshi shahri', 9],
  ['Ulugbek', 'Qodirov', 39, 'Male', '998901234577', 'Toshkent, Olmazor tumani', 10],
  ['Zulfiya', 'Tursunova', 61, 'Female', '998901234578', 'Xorazm, Urganch shahri', 11],
  ['Bekzod', 'Ismoilov', 16, 'Male', '998901234579', 'Jizzax, Zomin tumani', 2],
  ['Lola', 'Ahmedova', 44, 'Female', '998901234580', 'Navoiy, Karmana tumani', 0],
  ['Rustam', 'Sobirov', 73, 'Male', '998901234581', 'Surxondaryo, Termiz shahri', 10],
  ['Madina', 'Komilova', 7, 'Female', '998901234582', 'Toshkent, Sergeli tumani', 2],
  ['Akmal', 'Toshpulatov', 58, 'Male', '998901234583', 'Sirdaryo, Guliston shahri', 9],
  ['Sevara', 'Muminova', 26, 'Female', '998901234584', 'Toshkent, Uchtepa tumani', 5],
  ['Oybek', 'Rasulov', 50, 'Male', '998901234585', 'Samarqand, Kattaqorgon tumani', 3],
  ['Nargiza', 'Usmonova', 37, 'Female', '998901234586', 'Toshkent, Yakkasaroy tumani', 1],
];

const patients = seedPatients.map(([first_name, last_name, age, gender, phone, address, doctorIndex], index) => ({
  id: uuidv4(),
  first_name,
  last_name,
  age,
  gender,
  phone,
  address,
  doctor_id: doctors[doctorIndex]?.id || null,
  created_at: new Date(Date.now() - index * 21600000).toISOString(),
}));

module.exports = patients;
