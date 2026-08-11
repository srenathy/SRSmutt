import React, { useState } from 'react';
import { apiClient } from '../api/client';
import { Database, Download, ShieldAlert } from 'lucide-react';

export const BackupPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = async () => {
    try {
      setIsExporting(true);
      const res = await apiClient.get('/backup/export', {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `srsmutt-backup-${new Date().toISOString().split('T')[0]}.json`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Backup export failed:', err);
      alert('Failed to export logical database backup. Please check system permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-kumkum">Database Backup & Export</h2>
        <p className="text-xs text-textInk/60 mt-1">Administrator logical database JSON export tool.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-turmeric/30 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-turmeric/20 text-turmeric-dark flex items-center justify-center shrink-0">
            <Database className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-kumkum">Export Logical Database Snapshot</h3>
            <p className="text-xs text-textInk/70 mt-1">
              Generates a structured JSON archive containing users, temple config, sevas, devotees, receipts, and immutable audit logs.
            </p>
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Security Notice: </span>
            This export contains sensitive temple transaction & devotee data. Ensure the output file is stored securely in an encrypted vault or offsite cloud storage.
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            onClick={handleExportBackup}
            disabled={isExporting}
            className="bg-kumkum hover:bg-kumkum-light text-ivory font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
          >
            {isExporting ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-ivory border-t-transparent" />
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export & Download JSON Archive
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
