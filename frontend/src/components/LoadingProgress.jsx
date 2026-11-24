import React from 'react';
import { Loader2, UploadCloud, CheckCircle2, Clock3, AlertCircle } from 'lucide-react';

const STATUS_COPY = {
  uploading: { title: 'Uploading resume securely', detail: 'Your PDF is being sent to the backend for private S3 storage.', icon: UploadCloud },
  pending: { title: 'Evaluation queued', detail: 'Your resume is stored. An evaluation worker will begin processing it shortly.', icon: Clock3 },
  processing: { title: 'Evaluation in progress', detail: 'The backend is processing your resume and developer signals.', icon: Loader2 },
  completed: { title: 'Evaluation complete', detail: 'Your results are ready.', icon: CheckCircle2 },
  failed: { title: 'Evaluation failed', detail: 'The evaluation could not be completed.', icon: AlertCircle },
};

export default function LoadingProgress({ uploadProgress = 0, jobStatus = 'uploading' }) {
  const status = STATUS_COPY[jobStatus] || STATUS_COPY.pending;
  const Icon = status.icon;
  const isUploading = jobStatus === 'uploading';
  return (
    <section role="status" aria-live="polite" style={{ maxWidth: 680, margin: '48px auto', padding: 28, textAlign: 'center' }}>
      <div className="card-solid" style={{ padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18, color: 'var(--primary)' }}>
          <Icon size={34} className={jobStatus === 'processing' ? 'animate-spin' : ''} />
        </div>
        <h2 className="font-display" style={{ color: 'var(--text-main)', marginBottom: 10 }}>{status.title}</h2>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.55, margin: '0 auto', maxWidth: 500 }}>{status.detail}</p>
        {isUploading && (
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: 8 }}>
              <span>Upload progress</span><span>{uploadProgress}%</span>
            </div>
            <div style={{ height: 8, borderRadius: 8, background: 'var(--bg-muted)', overflow: 'hidden' }}>
              <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.2s ease' }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
