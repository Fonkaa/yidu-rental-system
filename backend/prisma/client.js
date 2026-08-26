const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: ['error', 'warn'],
});

// Optional: Test connection on startup with retry
async function connectWithRetry() {
  const maxRetries = 5;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      await prisma.$connect();
      console.log("Database connected successfully to Neon!");
      return;
    } catch (error) {
      retries++;
      console.error(`Database connection attempt ${retries} failed. Retrying in 3 seconds...`);
      await new Promise((res) => setTimeout(res, 3000));
    }
  }
  console.error("Failed to connect to the database after multiple attempts.");
}

connectWithRetry();

module.exports = prisma;