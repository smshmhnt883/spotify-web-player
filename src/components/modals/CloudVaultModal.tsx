import React, { useState } from 'react';
import { X, Cloud, Zap, CheckCircle2, AlertCircle, RefreshCw, ExternalLink, Copy, Check } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface CloudVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CloudVaultModal: React.FC<CloudVaultModalProps> = ({ isOpen, onClose }) => {
  const {
    isCloudSynced,
    cloudSyncStatus,
    cloudSyncMessage,
    cloudTrackCount,
    workerApiUrl,
    setWorkerApiUrl,
    syncCloudLibrary,
    cloudVaultUrl
  } = usePlayerStore();

  const [inputUrl, setInputUrl] = useState(workerApiUrl);
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  if (!isOpen) return null;

  const handleSync = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setWorkerApiUrl(inputUrl);
    await syncCloudLibrary(inputUrl);
  };

  const handleCopyGuide = () => {
    const guideText = `VaultX Music - Cloudflare Worker Setup (Method 2)\n1. Go to dash.cloudflare.com -> Workers & Pages -> Create Worker named "vaultx-music-api"\n2. In Settings -> Bindings -> Add R2 Bucket Binding: Variable name MY_BUCKET, Bucket: my-music-vault\n3. In Edit Code, paste worker.js and click Deploy\n4. Copy your Worker URL and paste it into VaultX Music!`;
    navigator.clipboard.writeText(guideText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#181818] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5 select-none animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-spotify-green/20 flex items-center justify-center text-spotify-green">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Cloudflare Vault Connection
              </h2>
              <p className="text-xs text-spotify-subdued">Stream your personal music library from anywhere</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-spotify-subdued hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Status Card */}
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          isCloudSynced
            ? 'bg-spotify-green/10 border-spotify-green/30'
            : cloudSyncStatus === 'error'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-white/5 border-white/10'
        }`}>
          <div className="flex items-center gap-3">
            {cloudSyncStatus === 'syncing' ? (
              <RefreshCw size={22} className="text-white animate-spin" />
            ) : isCloudSynced ? (
              <CheckCircle2 size={22} className="text-spotify-green" />
            ) : (
              <AlertCircle size={22} className="text-yellow-400" />
            )}
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                {isCloudSynced ? 'Vault Connected & Online' : 'Vault Not Synced'}
                {cloudTrackCount > 0 && (
                  <span className="text-[10px] bg-spotify-green/20 text-spotify-green px-2 py-0.5 rounded-full font-semibold">
                    {cloudTrackCount} Songs
                  </span>
                )}
              </div>
              <p className="text-xs text-spotify-subdued">
                {cloudSyncMessage || (isCloudSynced ? 'Ready for streaming' : 'Configure Worker or sync static R2')}
              </p>
            </div>
          </div>

          <button
            onClick={() => handleSync()}
            disabled={cloudSyncStatus === 'syncing'}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 hover:bg-white/20 text-white flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw size={13} className={cloudSyncStatus === 'syncing' ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>
        </div>

        {/* Method 2: Cloudflare Worker API Setup */}
        <form onSubmit={handleSync} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Zap size={14} className="text-spotify-green" />
              <span>Real-Time Worker API URL (Method 2)</span>
            </label>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="text-[11px] text-spotify-green hover:underline flex items-center gap-1"
            >
              {showGuide ? 'Hide instructions' : 'Setup guide (2 mins)'}
            </button>
          </div>

          <div className="flex gap-2">
            <input
              type="url"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              placeholder="https://vaultx-music-api.<your-subdomain>.workers.dev"
              className="flex-1 px-3 py-2 rounded-lg bg-black/40 border border-white/10 focus:border-spotify-green focus:outline-none text-xs text-white placeholder-white/30"
            />
            <button
              type="submit"
              disabled={cloudSyncStatus === 'syncing'}
              className="px-4 py-2 rounded-lg bg-spotify-green text-black text-xs font-bold hover:scale-105 active:scale-95 transition disabled:opacity-50 shadow-md"
            >
              {cloudSyncStatus === 'syncing' ? 'Syncing...' : 'Save & Sync'}
            </button>
          </div>
          <p className="text-[11px] text-spotify-subdued leading-relaxed">
            With the Worker active, any song you drop into your Cloudflare R2 bucket will appear on all your devices in real-time.
          </p>
        </form>

        {/* Guide / Instructions Dropdown */}
        {showGuide && (
          <div className="bg-black/50 border border-white/10 rounded-xl p-4 text-xs text-spotify-subdued flex flex-col gap-2.5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-white font-semibold">
              <span>Quick Cloudflare Worker Setup</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyGuide}
                  className="text-xs text-white/70 hover:text-white flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded transition"
                >
                  {copied ? <Check size={12} className="text-spotify-green" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied Steps!' : 'Copy Steps'}</span>
                </button>
                <a
                  href="https://dash.cloudflare.com"
                  target="_blank"
                  rel="noreferrer"
                  className="text-spotify-green text-[11px] flex items-center gap-1 hover:underline"
                >
                  <span>dash.cloudflare.com</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
              <li>Open Cloudflare Dashboard → <strong>Workers & Pages</strong> → <strong>Create application</strong> → <strong>Deploy</strong>.</li>
              <li>Go to Worker <strong>Settings</strong> → <strong>Variables & Secrets</strong> → <strong>R2 Bucket Bindings</strong>.</li>
              <li>Add binding: Variable name <code className="text-white bg-white/10 px-1 rounded">MY_BUCKET</code>, Bucket <code className="text-white bg-white/10 px-1 rounded">my-music-vault</code>.</li>
              <li>Click <strong>Edit code</strong>, paste the script from <code className="text-white">cloudflare-worker/worker.js</code>, and click <strong>Deploy</strong>.</li>
              <li>Copy your worker URL and paste it into the box above!</li>
            </ol>
          </div>
        )}

        {/* Static Fallback Info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-spotify-subdued">
          <span className="truncate max-w-[300px]">R2 Public Bucket: {cloudVaultUrl}</span>
          <button
            onClick={() => syncCloudLibrary()}
            className="text-spotify-subdued hover:text-white underline text-[11px]"
            title="Sync using static library.json fallback"
          >
            Use Static Manifest
          </button>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-1">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-white text-black hover:scale-105 active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
