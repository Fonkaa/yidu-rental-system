require("dotenv").config();

require("dotenv").config();

const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");
const archiver = require("archiver");
const AdmZip = require("adm-zip");

const backupDir = path.join(__dirname, "..", "backups");

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}
// =====================================================
// GET ALL BACKUPS
// =====================================================

const getBackups = async (req, res) => {
  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const files = fs
      .readdirSync(backupDir)
      .filter((file) => file.toLowerCase().endsWith(".zip"));

    const backups = files
      .map((filename) => {
        const filePath = path.join(backupDir, filename);

        const stats = fs.statSync(filePath);

        return {
          id: filename,
          filename,
          fileName: filename,
          name: filename,
          size: stats.size,
          fileSize: stats.size,
          createdAt: stats.birthtime,
          date: stats.birthtime,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      );

    return res.status(200).json({
      success: true,
      backups,
    });
  } catch (error) {
    console.error("Get backups error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load backups",
      error: error.message,
    });
  }
};

// =====================================================
// CREATE BACKUP
// =====================================================

const createBackup = async (req, res) => {
  try {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      return res.status(500).json({
        success: false,
        message: "DATABASE_URL is not configured",
      });
    }

    try {
      const dbUrl = new URL(databaseUrl);

      console.log("=================================");
      console.log("Starting database backup...");
      console.log("Database host:", dbUrl.hostname);
      console.log("Database user:", dbUrl.username);
      console.log("=================================");
    } catch {
      return res.status(500).json({
        success: false,
        message: "Invalid DATABASE_URL",
      });
    }

    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");

    const sqlFilename =
      `database-backup-${timestamp}.sql`;

    const zipFilename =
      `database-backup-${timestamp}.zip`;

    const sqlFile = path.join(
      backupDir,
      sqlFilename
    );

    const zipFile = path.join(
      backupDir,
      zipFilename
    );

    console.log("SQL file:", sqlFile);
    console.log("ZIP file:", zipFile);

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
      const text = data.toString();

      stderr += text;

      console.error("pg_dump:", text);
    });

    pgDump.on("error", (error) => {
      console.error(
        "Failed to start pg_dump:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Could not start pg_dump. Make sure PostgreSQL bin is in your PATH.",
          error: error.message,
        });
      }
    });

    pgDump.on("close", async (code) => {
      console.log(
        "pg_dump finished with code:",
        code
      );

      if (code !== 0) {
        if (fs.existsSync(sqlFile)) {
          try {
            fs.unlinkSync(sqlFile);
          } catch {}
        }

        return res.status(500).json({
          success: false,
          message: "Database backup failed",
          error:
            stderr ||
            `pg_dump exited with code ${code}`,
        });
      }

      if (!fs.existsSync(sqlFile)) {
        return res.status(500).json({
          success: false,
          message:
            "Backup SQL file was not created",
        });
      }

      const sqlStats = fs.statSync(sqlFile);

      if (sqlStats.size === 0) {
        fs.unlinkSync(sqlFile);

        return res.status(500).json({
          success: false,
          message:
            "Backup SQL file is empty",
        });
      }

      console.log(
        "SQL backup created:",
        sqlStats.size,
        "bytes"
      );

      const output =
        fs.createWriteStream(zipFile);

      const archive = archiver("zip", {
        zlib: { level: 9 },
      });

      output.on("close", () => {
        const zipSize = archive.pointer();

        console.log(
          "ZIP backup created:",
          zipSize,
          "bytes"
        );

        try {
          fs.unlinkSync(sqlFile);
        } catch (error) {
          console.error(
            "Could not remove SQL:",
            error.message
          );
        }

        if (!res.headersSent) {
          return res.status(200).json({
            success: true,
            message:
              "Database backup created successfully",
            filename: zipFilename,
            size: zipSize,
            createdAt: new Date(),
          });
        }
      });

      output.on("error", (error) => {
        console.error(
          "ZIP output error:",
          error
        );

        try {
          if (fs.existsSync(sqlFile)) {
            fs.unlinkSync(sqlFile);
          }
        } catch {}

        try {
          if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile);
          }
        } catch {}

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to create ZIP file",
            error: error.message,
          });
        }
      });

      archive.on("error", (error) => {
        console.error(
          "Archive error:",
          error
        );

        try {
          if (fs.existsSync(sqlFile)) {
            fs.unlinkSync(sqlFile);
          }
        } catch {}

        try {
          if (fs.existsSync(zipFile)) {
            fs.unlinkSync(zipFile);
          }
        } catch {}

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message:
              "Failed to create backup ZIP",
            error: error.message,
          });
        }
      });

      archive.pipe(output);

      archive.file(sqlFile, {
        name: sqlFilename,
      });

      await archive.finalize();
    });
  } catch (error) {
    console.error(
      "Create backup error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Backup failed",
        error: error.message,
      });
    }
  }
};

// =====================================================
// DOWNLOAD BACKUP
// =====================================================

const downloadBackup = async (req, res) => {
  try {
    const filename = path.basename(
      req.params.filename
    );

    if (
      filename !== req.params.filename ||
      !filename.toLowerCase().endsWith(".zip")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid backup filename",
      });
    }

    const backupPath = path.join(
      backupDir,
      filename
    );

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: "Backup file not found",
      });
    }

    console.log(
      "Downloading backup:",
      filename
    );

    return res.download(
      backupPath,
      filename
    );
  } catch (error) {
    console.error(
      "Download backup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to download backup",
      error: error.message,
    });
  }
};

// =====================================================
// DELETE BACKUP
// =====================================================

const deleteBackup = async (req, res) => {
  try {
    const filename = path.basename(
      req.params.filename
    );

    if (
      filename !== req.params.filename ||
      !filename.toLowerCase().endsWith(".zip")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid backup filename",
      });
    }

    const backupPath = path.join(
      backupDir,
      filename
    );

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: "Backup file not found",
      });
    }

    fs.unlinkSync(backupPath);

    console.log(
      "Deleted backup:",
      filename
    );

    return res.status(200).json({
      success: true,
      message:
        "Backup deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete backup error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete backup",
      error: error.message,
    });
  }
};

// =====================================================
// RESTORE BACKUP
// =====================================================

const restoreBackup = async (req, res) => {
  let tempZip = null;
  let tempDir = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message:
          "Please upload a backup file",
      });
    }

    if (!process.env.DATABASE_URL) {
      return res.status(500).json({
        success: false,
        message:
          "DATABASE_URL is not configured",
      });
    }

    tempZip = req.file.path;

    tempDir = fs.mkdtempSync(
      path.join(
        os.tmpdir(),
        "house-rental-restore-"
      )
    );

    const zip = new AdmZip(tempZip);

    zip.extractAllTo(
      tempDir,
      true
    );

    const sqlFileName =
      fs.readdirSync(tempDir).find(
        (file) =>
          file.toLowerCase().endsWith(".sql")
      );

    if (!sqlFileName) {
      return res.status(400).json({
        success: false,
        message:
          "The backup ZIP does not contain an SQL file",
      });
    }

    const sqlFile = path.join(
      tempDir,
      sqlFileName
    );

    console.log(
      "Starting database restore..."
    );

    const psql = spawn(
      "psql",
      [
        process.env.DATABASE_URL,
        "--set",
        "ON_ERROR_STOP=1",
        "--file",
        sqlFile,
      ],
      {
        windowsHide: true,
      }
    );

    let stderr = "";

    psql.stderr.on("data", (data) => {
      stderr += data.toString();

      console.error(
        "psql:",
        data.toString()
      );
    });

    psql.on("error", (error) => {
      console.error(
        "Failed to start psql:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Could not start psql. Make sure PostgreSQL bin is in your PATH.",
          error: error.message,
        });
      }
    });

    psql.on("close", (code) => {
      try {
        if (tempZip && fs.existsSync(tempZip)) {
          fs.unlinkSync(tempZip);
        }

        if (
          tempDir &&
          fs.existsSync(tempDir)
        ) {
          fs.rmSync(tempDir, {
            recursive: true,
            force: true,
          });
        }
      } catch (cleanupError) {
        console.error(
          "Restore cleanup error:",
          cleanupError
        );
      }

      if (code !== 0) {
        return res.status(500).json({
          success: false,
          message:
            "Database restore failed",
          error:
            stderr ||
            `psql exited with code ${code}`,
        });
      }

      console.log(
        "Database restore completed successfully."
      );

      return res.status(200).json({
        success: true,
        message:
          "Database restored successfully",
      });
    });
  } catch (error) {
    console.error(
      "Restore backup error:",
      error
    );

    try {
      if (tempZip && fs.existsSync(tempZip)) {
        fs.unlinkSync(tempZip);
      }

      if (
        tempDir &&
        fs.existsSync(tempDir)
      ) {
        fs.rmSync(tempDir, {
          recursive: true,
          force: true,
        });
      }
    } catch {}

    return res.status(500).json({
      success: false,
      message:
        "Failed to restore backup",
      error: error.message,
    });
  }
};

module.exports = {
  getBackups,
  createBackup,
  downloadBackup,
  deleteBackup,
  restoreBackup,
};