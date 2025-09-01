import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env") });

// Log environment for debugging
if (process.env.NODE_ENV === "development") {
  console.log("Environment variables loaded:");
  console.log("  NODE_ENV:", process.env.NODE_ENV);
  console.log("  PORT:", process.env.PORT);
}

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT || 3000, // Default to 3000 if PORT is not set
  gemini_api_key: process.env.GEMINI_API_KEY,
  jwt: {
    jwt_secret: process.env.JWT_SECRET,
    expires_in: process.env.JWT_EXPIRES_IN,
    refresh_token_secret: process.env.JWT_REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN,
    reset_pass_secret: process.env.JWT_RESET_PASS_TOKEN,
    reset_pass_token_expires_in: process.env.JWT_RESET_PASS_TOKEN_EXPIRES_IN,
  },
};
