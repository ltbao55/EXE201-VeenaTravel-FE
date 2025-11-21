// Environment Configuration
export const ENV_CONFIG = {
  // Google Maps API Key
  GOOGLE_MAPS_API_KEY:
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    "YOUR_ACTUAL_GOOGLE_MAPS_API_KEY_HERE",

  // Backend API URL
  API_BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://exe-201-veena-travel-be.vercel.app/api",

  // Environment
  NODE_ENV: import.meta.env.VITE_NODE_ENV || "development",

  // Debug mode
  DEBUG: import.meta.env.VITE_DEBUG === "true" || false,
};

// Validate required environment variables
export const validateEnvironment = () => {
  const requiredVars = ["GOOGLE_MAPS_API_KEY"];
  const missingVars = requiredVars.filter(
    (varName) => !ENV_CONFIG[varName as keyof typeof ENV_CONFIG]
  );

  if (missingVars.length > 0) {
    console.warn("Missing environment variables:", missingVars);
    console.warn("Please create a .env file with the required variables");
  }

  return missingVars.length === 0;
};

// Export default
export default ENV_CONFIG;
