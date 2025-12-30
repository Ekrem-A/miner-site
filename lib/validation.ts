// Form validation utilities

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: 'Şifre en az 8 karakter olmalıdır' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Şifre en az bir büyük harf içermelidir' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Şifre en az bir küçük harf içermelidir' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Şifre en az bir rakam içermelidir' };
  }
  return { valid: true };
};

export const validatePhone = (phone: string): boolean => {
  // Turkish phone format: 05XX XXX XX XX or +90 5XX XXX XX XX
  const phoneRegex = /^(\+90|0)?5\d{9}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const sanitizeInput = (input: string): string => {
  // Remove potentially dangerous characters
  return input
    .trim()
    .replace(/<script>/gi, '')
    .replace(/<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

export const validateFullName = (name: string): boolean => {
  return name.trim().length >= 3 && /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/.test(name);
};

// Rate limiting helper (client-side basic protection)
const rateLimitMap = new Map<string, number[]>();

export const checkRateLimit = (key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const attempts = rateLimitMap.get(key) || [];
  
  // Remove old attempts outside the window
  const recentAttempts = attempts.filter(time => now - time < windowMs);
  
  if (recentAttempts.length >= maxAttempts) {
    return false; // Rate limit exceeded
  }
  
  recentAttempts.push(now);
  rateLimitMap.set(key, recentAttempts);
  return true;
};