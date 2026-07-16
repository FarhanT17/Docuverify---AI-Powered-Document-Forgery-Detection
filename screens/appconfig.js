export const APP_INFO = {
  // ✅ Updated to correct model
  model: 'DiT (ViT)',
  dataset: '400K+ Documents',
  purpose: 'Document Forgery Detection',
};

export const SUPPORT = {
  email: 'farhantariq5251@gmail.com',
  // ✅ Update these with your actual URLs
  website: 'https://farhantariq.com', // Replace with your actual website
  linkedin: 'https://linkedin.com/in/farhantariq', // Replace with your actual LinkedIn
  github: 'https://github.com/farhantariq', // Replace with your actual GitHub
};

export const LINKS = {
  // ✅ Update these with your actual URLs
  privacyPolicy: 'https://your-actual-privacy-policy.com',
  termsOfService: 'https://your-actual-terms-of-service.com',
  licenses: 'https://your-actual-licenses.com',
};

// ============================================
// API CONFIGURATION
// ============================================
export const API_CONFIG = {
  // For Physical Device (use your laptop's IP)
  baseUrl: 'http://192.168.1.178:8000',
  
  // For iOS Simulator (uncomment if using simulator):
  // baseUrl: 'http://localhost:8000',
  
  // For Android Emulator (uncomment if using emulator):
  // baseUrl: 'http://10.0.2.2:8000',
  
  endpoints: {
    verify: '/verify',
    verifyBase64: '/verify_base64',
    verifyBatch: '/verify_batch',
    health: '/health',
  },
  
  timeout: 30000,
};