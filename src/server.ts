import { Server } from "http";
import app from "./app";
import config from "./config";

async function main() {
  try {
    const server: Server = app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`🌐 Environment: ${config.env || "development"}`);
      console.log(`🔗 Base URL: http://localhost:${config.port}`);
      console.log(`📊 Health Check: http://localhost:${config.port}/health`);
    });

    // Handle server shutdown gracefully
    const exitHandler = () => {
      if (server) {
        server.close(() => {
          console.log("Server closed");
          process.exit(1);
        });
      } else {
        process.exit(1);
      }
    };

    const unexpectedErrorHandler = (error: unknown) => {
      console.error("Unexpected error:", error);
      exitHandler();
    };

    process.on("uncaughtException", unexpectedErrorHandler);
    process.on("unhandledRejection", unexpectedErrorHandler);

    process.on("SIGTERM", () => {
      console.log("SIGTERM received");
      if (server) {
        server.close();
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
