export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

export function validateAge(age) {
  const num = Number(age);
  return Number.isInteger(num) && num > 0;
}

export function validatePhone(phone) {
  if (!phone) return true; // phone is optional
  const regex = /^[\d\s\-+()]{7,}$/;
  return regex.test(phone);
}

export function validateRequired(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}
