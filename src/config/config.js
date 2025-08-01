
const conf = {
  // Supabase configuration - use VITE_ prefix for client-side variables
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL || 'your-supabase-url',
  supabaseKey: import.meta.env.VITE_SUPABASE_PROJECT_ANON_KEY || 'your-supabase-anon-key',
  
  // Environment detection (Vite way)
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // App info
  appName: import.meta.env.VITE_APP_NAME || 'Supabase Auth',
  appVersion: import.meta.env.VITE_APP_VERSION || '1.0.0',
  
  // Mode detection
  mode: import.meta.env.MODE, // 'development', 'production', or custom modes
}

// Validation
if (!conf.supabaseUrl || !conf.supabaseKey) {
  throw new Error('Missing required Supabase configuration. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.')
}

export default conf