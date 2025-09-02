import serverless from "serverless-http";
import app from "../src/app";

// Export the serverless function handler
export const handler = serverless(app, {
  basePath: "/api/v1",
});

// Also export the app for local development
export default app;
