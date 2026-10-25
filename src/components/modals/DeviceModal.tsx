import React from 'react';
import { X, Laptop, Speaker, Smartphone, Check } from 'lucide-react';

interface DeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeviceModal: React.FC<DeviceModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-spotify-card border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl flex flex-col gap-6 select-none animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Laptop size={24} className="text-spotify-green" />
            <h2 className="text-xl font-bold text-white">Connect to a device</h2>
          </div>
          <button
            onClick={onClose}
            className="text-spotify-subdued hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {/* Active Device */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-spotify-elevated border border-spotify-green/40">
            <div className="flex items-center gap-3">
              <Laptop size={22} className="text-spotify-green" />
              <div>
                <p className="text-sm font-bold text-spotify-green flex items-center gap-2">
                  This Web Browser
                  <span className="w-2 h-2 rounded-full bg-spotify-green animate-ping" />
                </p>
                <p className="text-xs text-spotify-subdued">Listening on this computer</p>
              </div>
            </div>
            <Check size={20} className="text-spotify-green" />
          </div>

          {/* Standby Devices */}
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-spotify-elevated/60 cursor-pointer transition">
            <div className="flex items-center gap-3">
              <Speaker size={22} className="text-spotify-subdued" />
              <div>
                <p className="text-sm font-semibold text-white">Living Room Soundbar</p>
                <p className="text-xs text-spotify-subdued">Spotify Connect</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-spotify-elevated/60 cursor-pointer transition">
            <div className="flex items-center gap-3">
              <Smartphone size={22} className="text-spotify-subdued" />
              <div>
                <p className="text-sm font-semibold text-white">iPhone 16 Pro</p>
                <p className="text-xs text-spotify-subdued">Spotify Connect</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-spotify-subdued border-t border-white/10 pt-4 text-center">
          Powered by real-time WebSocket state synchronization engine (Spotify Dealer protocol).
        </div>
      </div>
    </div>
  );
};
