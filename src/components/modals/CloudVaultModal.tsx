import React, { useEffect, useRef, useState } from 'react';
import { X, Cloud, ArrowUpRight, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import './vault-modals.css';

interface CloudVaultModalProps { isOpen: boolean; onClose: () => void; }

export const CloudVaultModal: React.FC<CloudVaultModalProps> = ({ isOpen, onClose }) => {
  const cloudSyncStatus = usePlayerStore(state => state.cloudSyncStatus);
  const cloudSyncMessage = usePlayerStore(state => state.cloudSyncMessage);
  const cloudTrackCount = usePlayerStore(state => state.cloudTrackCount);
  const workerApiUrl = usePlayerStore(state => state.workerApiUrl);
  const setWorkerApiUrl = usePlayerStore(state => state.setWorkerApiUrl);
  const syncCloudLibrary = usePlayerStore(state => state.syncCloudLibrary);
  const [inputUrl, setInputUrl] = useState(workerApiUrl);
  const [copyStatus, setCopyStatus] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const syncing = cloudSyncStatus === 'syncing';

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen) {
      setInputUrl(usePlayerStore.getState().workerApiUrl);
      setCopyStatus('');
      if (!dialog?.open) dialog?.showModal();
    } else if (dialog?.open) dialog.close();
  }, [isOpen]);

  const handleSync = async (event: React.FormEvent) => {
    event.preventDefault();
    if (syncing) return;
    setWorkerApiUrl(inputUrl);
    await syncCloudLibrary(inputUrl);
  };

  const copyGuide = async () => {
    try {
      await navigator.clipboard.writeText('VaultX cloud setup\n1. Create a Cloudflare Worker.\n2. Add an R2 bucket binding named MY_BUCKET to your music bucket.\n3. Deploy the code in cloudflare-worker/worker.js.\n4. Paste the Worker URL into VaultX and choose Save & sync.');
      setCopyStatus('Steps copied');
    } catch {
      setCopyStatus('Copy unavailable. You can select the steps below.');
    }
  };

  const statusTitle = syncing ? 'Finding your music…' : cloudSyncStatus === 'success' ? 'Your vault is connected' : cloudSyncStatus === 'error' ? 'We couldn’t sync your vault' : 'Bring your collection with you';

  return (
    <dialog ref={dialogRef} className="vx-dialog vx-cloud-dialog" aria-labelledby="vault-dialog-title" onKeyDown={event => event.stopPropagation()}
      onCancel={event => { event.preventDefault(); onClose(); }}
      onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="vx-dialog-surface">
        <header className="vx-dialog-header">
          <span className="vx-modal-eyebrow">YOUR MUSIC, EVERYWHERE</span>
          <button className="vx-modal-icon-button" onClick={onClose} aria-label="Close cloud settings" autoFocus><X size={20} /></button>
        </header>
        <div className="vx-dialog-body">
          <div className="vx-cloud-symbol"><Cloud size={29} strokeWidth={1.4} /></div>
          <h2 id="vault-dialog-title" className="vx-dialog-title">A home for your music.</h2>
          <p className="vx-dialog-intro">Connect your cloud library and take your favorite sounds wherever you go.</p>
          <div className={`vx-connection-status ${cloudSyncStatus === 'error' ? 'is-error' : ''}`} role="status" aria-live="polite">
            {syncing ? <RefreshCw size={19} className="vx-spinning" /> : cloudSyncStatus === 'success' ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}
            <div><strong>{statusTitle}</strong><p>{cloudSyncStatus === 'success' ? `${cloudTrackCount} tracks in your collection` : cloudSyncMessage || 'Connect a Cloudflare Worker or use your saved library.'}</p></div>
          </div>
          <form onSubmit={handleSync} className="vx-cloud-form">
            <label htmlFor="vault-worker-url">Cloudflare Worker URL <span>Optional</span></label>
            <input id="vault-worker-url" type="url" value={inputUrl} onChange={event => setInputUrl(event.target.value)} placeholder="https://your-music.workers.dev" autoComplete="url" spellCheck={false} disabled={syncing} aria-describedby="vault-url-help" />
            <p id="vault-url-help" className="vx-helper">New uploads appear when you sync. Leave this empty to use your saved library manifest.</p>
            <button className="vx-primary-button" type="submit" disabled={syncing}>{syncing ? <><RefreshCw size={16} className="vx-spinning" />Syncing library…</> : <><RefreshCw size={16} />Save & sync library</>}</button>
          </form>
          <button className="vx-guide-toggle" type="button" onClick={() => setShowGuide(!showGuide)} aria-expanded={showGuide} aria-controls="vault-setup-guide">Setting up for the first time?<ChevronDown size={16} className={showGuide ? 'is-open' : ''} /></button>
          {showGuide && <div id="vault-setup-guide" className="vx-setup-guide">
            <ol>
              <li>Create a Worker in your Cloudflare dashboard.</li>
              <li>Bind your music bucket to the Worker using the name <code>MY_BUCKET</code>.</li>
              <li>Deploy the code from <code>cloudflare-worker/worker.js</code> in this project.</li>
              <li>Paste the Worker URL above, then save and sync.</li>
            </ol>
            <div className="vx-guide-actions"><button onClick={copyGuide} className="vx-text-button">{copyStatus === 'Steps copied' ? <Check size={15} /> : <Copy size={15} />}Copy steps</button><a href="https://dash.cloudflare.com" target="_blank" rel="noreferrer">Cloudflare dashboard<ArrowUpRight size={15} /></a></div>
            {copyStatus && <p role="status" className="vx-helper">{copyStatus}</p>}
          </div>}
        </div>
        <footer className="vx-dialog-footer"><span>Cloudflare R2 · Personal library</span><button className="vx-text-button" onClick={onClose}>Done<Check size={15} /></button></footer>
      </section>
    </dialog>
  );
};
