import { useEffect, useState } from "react";
import axios from "axios";
import {
  DatabaseBackup,
  Download,
  Upload,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Trash2,
  HardDrive,
  Shield,
  Clock,
  FileArchive,
  Zap,
} from "lucide-react";

const API_URL = "http://localhost:5000/api/admin";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function SystemBackup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load Backups
  const loadBackups = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/backup");
      setBackups(response.data.backups || response.data || []);
    } catch (err) {
      console.error("Load backups error:", err);
      setError(err.response?.data?.message || "Unable to load system backups.");
    } finally {
      setLoading(false);
    }
  };

  // Create Backup
  const createBackup = async () => {
    try {
      setCreating(true);
      setMessage("");
      setError("");
      const response = await api.post("/backup");
      setMessage(response.data?.message || "System backup created successfully.");
      await loadBackups();
    } catch (err) {
      console.error("Create backup error:", err);
      setError(err.response?.data?.message || "Failed to create system backup.");
    } finally {
      setCreating(false);
    }
  };

  // Download Backup
  const downloadBackup = async (backup) => {
    try {
      setError("");
      setMessage("");
      const backupId = backup.filename || backup.fileName || backup.name || backup.id;
      if (!backupId) {
        setError("Backup filename was not found.");
        return;
      }
      const response = await api.get(`/backup/download/${encodeURIComponent(backupId)}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = backupId;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("Backup downloaded successfully.");
    } catch (err) {
      console.error("Download backup error:", err);
      setError(err.response?.data?.message || "Failed to download backup.");
    }
  };

  // Delete Backup
  const deleteBackup = async (backup) => {
    const backupId = backup.id || backup.filename || backup.fileName;
    if (!backupId) {
      setError("Backup ID was not found.");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to delete this backup?");
    if (!confirmed) return;
    try {
      setError("");
      setMessage("");
      await api.delete(`/backup/${encodeURIComponent(backupId)}`);
      setMessage("Backup deleted successfully.");
      await loadBackups();
    } catch (err) {
      console.error("Delete backup error:", err);
      setError(err.response?.data?.message || "Failed to delete backup.");
    }
  };

  // Restore Backup
  const restoreBackup = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const confirmed = window.confirm(
      `Restore the system from "${file.name}"?\n\n` +
      "Warning: restoring a backup may replace existing database data."
    );
    if (!confirmed) {
      event.target.value = "";
      return;
    }
    try {
      setRestoring(true);
      setMessage("");
      setError("");
      const formData = new FormData();
      formData.append("backup", file);
      const response = await api.post("/backup/restore", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage(response.data?.message || "System restored successfully.");
    } catch (err) {
      console.error("Restore backup error:", err);
      setError(err.response?.data?.message || "Failed to restore system backup.");
    } finally {
      setRestoring(false);
      event.target.value = "";
    }
  };

  // Format File Size
  const formatSize = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB"];
    const index = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, index)).toFixed(2)} ${units[index]}`;
  };

  // Format Date
  const formatDate = (date) => {
    if (!date) return "Unknown";
    return new Date(date).toLocaleString();
  };

  useEffect(() => {
    loadBackups();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6 bg-gradient-to-br from-slate-50 via-white to-amber-50/20">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#022036] text-[#FFC107] flex items-center justify-center shadow-md border-2 border-[#FFC107]/20">
            <DatabaseBackup size={22} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#022036] tracking-tight">
              System Backup
            </h1>
            <p className="text-xs text-[#022036]/50 font-medium">
              Create, download, restore and manage system backups
            </p>
          </div>
        </div>

        <button
          onClick={loadBackups}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-black/20 hover:border-black rounded-xl text-xs font-black text-[#022036] transition-all hover:shadow-md disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* =====================================================
          MESSAGES
      ===================================================== */}

      {message && (
        <div className="flex items-center gap-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl text-emerald-700">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span className="text-xs font-bold">{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-700">
          <AlertCircle size={18} className="flex-shrink-0" />
          <span className="text-xs font-bold">{error}</span>
        </div>
      )}

      {/* =====================================================
          ACTION CARDS
      ===================================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Create Backup */}
        <div className="group bg-white border-2 border-black/20 hover:border-black rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#FFC107]/10 border-2 border-[#FFC107]/30 text-[#FFC107] flex items-center justify-center group-hover:bg-[#FFC107] group-hover:text-[#022036] transition-all">
              <DatabaseBackup size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-black text-[#022036]">Create Backup</h2>
          </div>
          <p className="text-[11px] text-[#022036]/50 mb-5 leading-relaxed">
            Create a new backup of the system database and all related data.
          </p>
          <button
            onClick={createBackup}
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#022036] hover:bg-black text-white font-black text-xs rounded-xl transition-all border-2 border-[#022036] hover:border-black disabled:opacity-50"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <DatabaseBackup size={15} />
                Create Backup
              </>
            )}
          </button>
        </div>

        {/* Restore Backup */}
        <div className="group bg-white border-2 border-black/20 hover:border-black rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 border-2 border-orange-300 text-orange-600 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white group-hover:border-orange-500 transition-all">
              <Upload size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-black text-[#022036]">Restore Backup</h2>
          </div>
          <p className="text-[11px] text-[#022036]/50 mb-5 leading-relaxed">
            Restore the database using an existing backup file.
          </p>
          <label
            className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xs rounded-xl transition-all border-2 border-orange-600 cursor-pointer ${
              restoring ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {restoring ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <Upload size={15} />
                Select Backup
              </>
            )}
            <input
              type="file"
              accept=".zip,.sql,.backup"
              className="hidden"
              onChange={restoreBackup}
              disabled={restoring}
            />
          </label>
        </div>

        {/* Backup Count */}
        <div className="group bg-white border-2 border-black/20 hover:border-black rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
              <HardDrive size={18} strokeWidth={2.5} />
            </div>
            <h2 className="text-sm font-black text-[#022036]">Available Backups</h2>
          </div>
          <div className="text-3xl font-black text-[#022036] font-mono">
            {backups.length}
          </div>
          <p className="text-[11px] text-[#022036]/50 mt-1">
            Backup files available on the server
          </p>
        </div>
      </div>

      {/* =====================================================
          BACKUP HISTORY TABLE
      ===================================================== */}

      <div className="bg-white border-2 border-black/20 rounded-2xl overflow-hidden shadow-sm">

        <div className="px-5 py-4 border-b-2 border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-black text-[#022036] flex items-center gap-2">
              <FileArchive size={18} className="text-[#FFC107]" />
              Backup History
            </h2>
            <p className="text-[10px] text-[#022036]/40 mt-0.5">
              Previously created system backups
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[#022036]/40">
            <Shield size={12} />
            <span>Encrypted & Secure</span>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#FFC107]" />
          </div>
        ) : backups.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-black/5 border-2 border-black/10 flex items-center justify-center mb-4">
              <DatabaseBackup size={28} className="text-black/30" />
            </div>
            <h3 className="text-sm font-black text-[#022036]">No backups found</h3>
            <p className="text-xs text-[#022036]/40 mt-1">
              Create your first system backup to protect your data.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-black/5 border-b-2 border-black/10">
                <tr>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#022036]/50">
                    Backup File
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#022036]/50">
                    Size
                  </th>
                  <th className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-wider text-[#022036]/50">
                    Created
                  </th>
                  <th className="px-5 py-3 text-right text-[10px] font-black uppercase tracking-wider text-[#022036]/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {backups.map((backup, index) => {
                  const fileName = backup.filename || backup.fileName || backup.name || `Backup ${index + 1}`;
                  return (
                    <tr key={backup.id || backup.filename || index} className="hover:bg-black/5 transition-all">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#FFC107]/10 border border-[#FFC107]/20 flex items-center justify-center">
                            <FileArchive size={14} className="text-[#FFC107]" />
                          </div>
                          <span className="text-xs font-bold text-[#022036]">
                            {fileName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-[#022036]/60">
                        {formatSize(backup.size || backup.fileSize)}
                      </td>
                      <td className="px-5 py-4 text-xs font-medium text-[#022036]/60">
                        {formatDate(backup.createdAt || backup.created_at || backup.date)}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => downloadBackup(backup)}
                            title="Download backup"
                            className="p-2 rounded-lg border-2 border-black/10 hover:border-[#FFC107] text-[#022036]/60 hover:text-[#FFC107] hover:bg-[#FFC107]/5 transition-all"
                          >
                            <Download size={15} />
                          </button>
                          <button
                            onClick={() => deleteBackup(backup)}
                            title="Delete backup"
                            className="p-2 rounded-lg border-2 border-black/10 hover:border-rose-400 text-[#022036]/60 hover:text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {backups.length > 0 && (
          <div className="px-5 py-3 border-t-2 border-black/10 bg-black/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[10px] font-bold text-[#022036]/40">
              Total: <span className="text-[#022036]">{backups.length}</span> backups
            </span>
            <div className="flex items-center gap-3 text-[10px] text-[#022036]/30">
              <span>Last backup: {formatDate(backups[0]?.createdAt || backups[0]?.created_at)}</span>
              <span className="w-px h-3 bg-black/10" />
              <span>Total size: {formatSize(backups.reduce((acc, b) => acc + (b.size || b.fileSize || 0), 0))}</span>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          QUICK STATS
      ===================================================== */}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FFC107]/10 text-[#FFC107] flex items-center justify-center">
            <Clock size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Last Backup</p>
            <p className="text-[10px] font-black text-[#022036]">
              {backups.length > 0 ? formatDate(backups[0]?.createdAt || backups[0]?.created_at) : "Never"}
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <HardDrive size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Total Backups</p>
            <p className="text-[10px] font-black text-[#022036]">{backups.length}</p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
            <Zap size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Status</p>
            <p className="text-[10px] font-black text-emerald-600 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Healthy
            </p>
          </div>
        </div>

        <div className="bg-white border-2 border-black/10 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
            <Shield size={14} />
          </div>
          <div>
            <p className="text-[8px] font-black uppercase tracking-wider text-black/40">Security</p>
            <p className="text-[10px] font-black text-emerald-600">Encrypted</p>
          </div>
        </div>
      </div>

    </div>
  );
}