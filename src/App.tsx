import React, { useState, useEffect } from 'react';
import { MinimalistPlayer } from './components/player/MinimalistPlayer';
import { AlbumsSlideBar } from './components/sidebar/AlbumsSlideBar';
import { DeviceModal } from './components/modals/DeviceModal';
import { UploadMusicModal } from './components/upload/UploadMusicModal';
import { CloudVaultModal } from './components/modals/CloudVaultModal';
import { AudioEngine } from './services/AudioEngine';
import { usePlayerStore } from './store/usePlayerStore';

export const App: React.FC = () => {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCloudVaultModalOpen, setIsCloudVaultModalOpen] = useState(false);
  const [isAlbumsSlideBarOpen, setIsAlbumsSlideBarOpen] = useState(false);

  const { syncCloudLibrary } = usePlayerStore();

  useEffect(() => {
    // Attempt to automatically sync with Cloudflare on startup
    syncCloudLibrary();
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white select-none">
      {/* 1. Headless Audio & MediaSession Service */}
      <AudioEngine />

      {/* 2. Main Minimalist One-Home-Page Player (Matches Reference Screenshot) */}
      <MinimalistPlayer
        onToggleAlbumsSlideBar={() => setIsAlbumsSlideBarOpen(!isAlbumsSlideBarOpen)}
        onOpenCloudVaultModal={() => setIsCloudVaultModalOpen(true)}
      />

      {/* 3. Left Slide Bar (Triple Tap Bar Drawer for Albums Selection) */}
      <AlbumsSlideBar
        isOpen={isAlbumsSlideBarOpen}
        onClose={() => setIsAlbumsSlideBarOpen(false)}
        onOpenCloudVaultModal={() => setIsCloudVaultModalOpen(true)}
      />

      {/* 4. Modals */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />

      <UploadMusicModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />

      <CloudVaultModal
        isOpen={isCloudVaultModalOpen}
        onClose={() => setIsCloudVaultModalOpen(false)}
      />
    </div>
  );
};

export default App;
