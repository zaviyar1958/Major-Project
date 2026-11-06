const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

const prisma = new PrismaClient();

// Auto-start PostgreSQL if offline when backend starts
(async function ensureDatabaseRunning() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    console.log("[DB] PostgreSQL is offline. Auto-starting PostgreSQL server...");
    try {
      const pgCtl = "C:\\Program Files\\PostgreSQL\\18\\bin\\pg_ctl.exe";
      const pgData = "C:\\Program Files\\PostgreSQL\\18\\data";
      execSync(`"${pgCtl}" start -D "${pgData}"`, { stdio: "ignore" });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await prisma.$connect();
      console.log("[DB] PostgreSQL server auto-started and connected successfully.");
    } catch (startErr) {
      console.error("[DB] Could not auto-start PostgreSQL:", startErr.message);
    }
  }
})();

module.exports = prisma;