import React, { useState } from 'react';
import { YourLibrary } from './components/sidebar/YourLibrary';
import { TopBar } from './components/topbar/TopBar';
import { HomeView } from './components/views/HomeView';
import { PlaylistView } from './components/views/PlaylistView';
import { SearchView } from './components/views/SearchView';
import { LikedSongsView } from './components/views/LikedSongsView';
import { NowPlayingBar } from './components/player/NowPlayingBar';
import { RightDrawer } from './components/drawers/RightDrawer';
import { DeviceModal } from './components/modals/DeviceModal';
import { UploadMusicModal } from './components/upload/UploadMusicModal';
import { MobileNavBar } from './components/mobile/MobileNavBar';
import { MobileMiniPlayer } from './components/mobile/MobileMiniPlayer';
import { FullScreenPlayer } from './components/mobile/FullScreenPlayer';
import { AudioEngine } from './services/AudioEngine';
import { usePlayerStore } from './store/usePlayerStore';

export const App: React.FC = () => {
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);

  const { currentView, activePlaylistId } = usePlayerStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-black text-white select-none">
      {/* 1. Headless Audio & MediaSession Service */}
      <AudioEngine />

      {/* 2. Main Work Area */}
      <div className="flex-1 flex overflow-hidden pb-[130px] md:pb-[84px]">
        {/* Left Sidebar: Visible on Desktop, Hidden on Mobile */}
        <div className="hidden md:flex">
          <YourLibrary />
        </div>

        {/* Center: Main Scrollable Viewport */}
        <main className="flex-1 flex flex-col bg-spotify-base md:rounded-lg m-0 md:m-2 md:ml-0 overflow-hidden relative">
          <TopBar onOpenUploadModal={() => setIsUploadModalOpen(true)} />

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 scroll-smooth">
            {currentView === 'home' && <HomeView />}
            {currentView === 'search' && <SearchView />}
            {currentView === 'playlist' && <PlaylistView playlistId={activePlaylistId} />}
            {currentView === 'liked' && <LikedSongsView />}
          </div>
        </main>

        {/* Right Drawer: Context Panel (Desktop Only) */}
        <div className="hidden md:flex">
          <RightDrawer />
        </div>
      </div>

      {/* 3. Desktop Persistent Bottom Audio Deck (Hidden on Mobile) */}
      <div className="hidden md:block">
        <NowPlayingBar onOpenDeviceModal={() => setIsDeviceModalOpen(true)} />
      </div>

      {/* 4. Mobile Layout: Floating Mini Player & Bottom Navigation */}
      <MobileMiniPlayer onOpenFullScreen={() => setIsFullScreenPlayerOpen(true)} />
      <MobileNavBar />

      {/* 5. Mobile Full Screen Now Playing Sheet */}
      <FullScreenPlayer
        isOpen={isFullScreenPlayerOpen}
        onClose={() => setIsFullScreenPlayerOpen(false)}
        onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
      />

      {/* 6. Modals */}
      <DeviceModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
      />

      <UploadMusicModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
      />
    </div>
  );
};

export default App;
