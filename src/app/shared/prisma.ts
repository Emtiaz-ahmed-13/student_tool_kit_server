import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Only attempt to connect if we're not in a serverless environment
if (process.env.VERCEL !== "1") {
  prisma
    .$connect()
    .then(() => console.log("Connected to database"))
    .catch((err: any) => console.error("Failed to connect:", err));
}

export default prisma;
