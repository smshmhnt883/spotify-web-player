import React from 'react';
import { ChevronLeft, ChevronRight, Search, X, Bell, User, Upload } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface TopBarProps {
  onOpenUploadModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({ onOpenUploadModal }) => {
  const {
    currentView,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    navigateTo
  } = usePlayerStore();

  return (
    <header className="h-16 px-4 sm:px-6 flex items-center justify-between bg-spotify-base/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Navigation history & Search Input */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <div className="hidden sm:flex items-center gap-2">
          <button 
            onClick={() => navigateTo('home')} 
            className="w-8 h-8 rounded-full bg-spotify-black/70 flex items-center justify-center text-spotify-subdued hover:text-white transition"
            title="Go back"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            className="w-8 h-8 rounded-full bg-spotify-black/40 flex items-center justify-center text-spotify-subdued/50 cursor-not-allowed"
            title="Go forward"
            disabled
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-spotify-subdued">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (currentView !== 'search') navigateTo('search');
            }}
            onFocus={() => {
              if (currentView !== 'search') navigateTo('search');
            }}
            placeholder="Search songs, artists..."
            className="w-full pl-10 pr-9 py-2 rounded-full bg-spotify-elevated hover:bg-[#2e2e2e] focus:bg-[#2e2e2e] text-xs sm:text-sm text-white placeholder-spotify-subdued border border-transparent focus:border-white/30 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-spotify-subdued hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips (Home View) */}
        {currentView === 'home' && (
          <div className="hidden md:flex items-center gap-2 pl-2">
            {(['all', 'music', 'podcasts'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition ${
                  categoryFilter === cat 
                    ? 'bg-white text-black' 
                    : 'bg-spotify-elevated text-white hover:bg-spotify-highlight'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* Upload Button */}
        <button
          onClick={onOpenUploadModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-spotify-green text-black hover:scale-105 active:scale-95 transition shadow-md"
          title="Upload your downloaded music"
        >
          <Upload size={14} className="stroke-[2.5]" />
          <span>Upload Music</span>
        </button>

        <button 
          className="w-8 h-8 rounded-full bg-spotify-black/70 hidden sm:flex items-center justify-center text-spotify-subdued hover:text-white transition"
          title="What's New"
        >
          <Bell size={18} />
        </button>

        <button 
          className="flex items-center gap-2 p-1 pl-1 sm:pr-3 rounded-full bg-spotify-black/80 hover:bg-spotify-highlight transition"
          title="Profile"
        >
          <div className="w-7 h-7 rounded-full bg-[#535353] flex items-center justify-center text-white">
            <User size={16} />
          </div>
          <span className="text-xs font-semibold text-white hidden sm:inline">Guest User</span>
        </button>
      </div>
    </header>
  );
};
