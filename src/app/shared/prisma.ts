import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Always attempt to connect, but handle errors gracefully
prisma
  .$connect()
  .then(() => console.log("Connected to database"))
  .catch((err: any) => {
    console.error("Failed to connect to database:", err);
    // Don't throw an error here as it might crash the serverless function
  });

export default prisma;
