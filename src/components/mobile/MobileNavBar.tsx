import React from 'react';
import { Home, Search, Library } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const MobileNavBar: React.FC = () => {
  const { currentView, navigateTo } = usePlayerStore();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-spotify-black/95 backdrop-blur-lg border-t border-white/5 flex items-center justify-around z-40 px-2 pb-[env(safe-area-inset-bottom)] select-none">
      <button
        onClick={() => navigateTo('home')}
        className={`flex flex-col items-center gap-1 py-1 transition ${
          currentView === 'home' ? 'text-white' : 'text-spotify-subdued hover:text-white'
        }`}
      >
        <Home size={22} className={currentView === 'home' ? 'text-white' : 'text-spotify-subdued'} />
        <span className="text-[10px] font-semibold tracking-wide">Home</span>
      </button>

      <button
        onClick={() => navigateTo('search')}
        className={`flex flex-col items-center gap-1 py-1 transition ${
          currentView === 'search' ? 'text-white' : 'text-spotify-subdued hover:text-white'
        }`}
      >
        <Search size={22} className={currentView === 'search' ? 'text-white' : 'text-spotify-subdued'} />
        <span className="text-[10px] font-semibold tracking-wide">Search</span>
      </button>

      <button
        onClick={() => navigateTo('liked')}
        className={`flex flex-col items-center gap-1 py-1 transition ${
          currentView === 'liked' ? 'text-white' : 'text-spotify-subdued hover:text-white'
        }`}
      >
        <Library size={22} className={currentView === 'liked' ? 'text-white' : 'text-spotify-subdued'} />
        <span className="text-[10px] font-semibold tracking-wide">Your Library</span>
      </button>
    </nav>
  );
};
