import serverless from "serverless-http";
import app from "../src/app";

// Export the serverless function handler without basePath so root (/) works
export const handler = serverless(app);

// Also export the app for local development
export default app;
