require("dotenv").config();

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const archiverModule = require("archiver");
const archiver =
  typeof archiverModule === "function"
    ? archiverModule
    : archiverModule.default;

const createBackup = async (req, res) => {
  try {
    const backupDir = path.join(__dirname, "..", "backups");

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const sqlFile = path.join(
      backupDir,
      `database-backup-${timestamp}.sql`
    );

    const zipFile = path.join(
      backupDir,
      `database-backup-${timestamp}.zip`
    );

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        message: "DATABASE_URL is not configured",
      });
    }

    let dbUrl;

    try {
      dbUrl = new URL(databaseUrl);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Invalid DATABASE_URL",
      });
    }

    console.log("=================================");
    console.log("Starting database backup...");
    console.log("Database host:", dbUrl.hostname);
    console.log("Database user:", dbUrl.username);
    console.log("=================================");

    // Use DATABASE_URL directly with pg_dump
    const pgDump = spawn(
      "pg_dump",
      [
        databaseUrl,
        "--no-owner",
        "--no-privileges",
        "--format=plain",
        "--file",
        sqlFile,
      ],
      {
        windowsHide: true,
      }
    );

    let stderr = "";

    pgDump.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error("pg_dump:", data.toString());
    });

    pgDump.on("error", (error) => {
      console.error("Failed to start pg_dump:", error);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Could not start pg_dump",
          error: error.message,
        });
      }
    });

    pgDump.on("close", async (code) => {
      console.log("pg_dump finished with code:", code);

      if (code !== 0) {
        console.error("pg_dump failed:", stderr);

        if (fs.existsSync(sqlFile)) {
          try {
            fs.unlinkSync(sqlFile);
          } catch {}
        }

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: "Database backup failed",
            error: stderr || `pg_dump exited with code ${code}`,
          });
        }

        return;
      }

      // Verify SQL file
      if (!fs.existsSync(sqlFile)) {
        return res.status(500).json({
          success: false,
          message: "Backup SQL file was not created",
        });
      }

      const sqlSize = fs.statSync(sqlFile).size;

      console.log("SQL backup created.");
      console.log("SQL size:", sqlSize, "bytes");

      if (sqlSize === 0) {
        fs.unlinkSync(sqlFile);

        return res.status(500).json({
          success: false,
          message: "Backup SQL file is empty",
        });
      }

      // Create ZIP
      const output = fs.createWriteStream(zipFile);

      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      output.on("close", () => {
        const zipSize = archive.pointer();

        console.log("ZIP backup created.");
        console.log("ZIP size:", zipSize, "bytes");

        // Remove temporary SQL
        try {
          fs.unlinkSync(sqlFile);
        } catch (error) {
          console.error(
            "Could not remove temporary SQL:",
            error.message
          );
        }

        if (!res.headersSent) {
          return res.status(200).json({
            success: true,
            message: "Database backup created successfully",
            filename: path.basename(zipFile),
            size: zipSize,
            downloadUrl:
              `/api/admin/backup/download/${path.basename(zipFile)}`,
          });
        }
      });

      output.on("error", (error) => {
        console.error("ZIP output error:", error);

        if (fs.existsSync(sqlFile)) {
          try {
            fs.unlinkSync(sqlFile);
          } catch {}
        }

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: "Failed to create ZIP file",
            error: error.message,
          });
        }
      });

      archive.on("error", (error) => {
        console.error("Archive error:", error);

        if (fs.existsSync(sqlFile)) {
          try {
            fs.unlinkSync(sqlFile);
          } catch {}
        }

        if (fs.existsSync(zipFile)) {
          try {
            fs.unlinkSync(zipFile);
          } catch {}
        }

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: "Failed to create backup ZIP",
            error: error.message,
          });
        }
      });

      archive.pipe(output);

      archive.file(sqlFile, {
        name: path.basename(sqlFile),
      });

      await archive.finalize();
    });
  } catch (error) {
    console.error("Backup controller error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Backup failed",
        error: error.message,
      });
    }
  }
};

const downloadBackup = async (req, res) => {
  try {
    const filename = path.basename(req.params.filename);

    if (
      filename !== req.params.filename ||
      !filename.endsWith(".zip")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid backup filename",
      });
    }

    const backupPath = path.join(
      __dirname,
      "..",
      "backups",
      filename
    );

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: "Backup file not found",
      });
    }

    console.log("Downloading backup:", filename);

    return res.download(backupPath, filename);
  } catch (error) {
    console.error("Download error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to download backup",
      });
    }
  }
};

module.exports = {
  createBackup,
  downloadBackup,
};