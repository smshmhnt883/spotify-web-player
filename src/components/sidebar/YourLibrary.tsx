import React, { useState } from 'react';
import { Home, Search, Library, Plus, ArrowRight, Heart, Pin, Music } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

export const YourLibrary: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'playlists' | 'artists'>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    currentView,
    activePlaylistId,
    playlists,
    likedTrackIds,
    navigateTo
  } = usePlayerStore();

  return (
    <aside className={`flex flex-col gap-2 p-2 bg-black select-none transition-all duration-300 ${
      isCollapsed ? 'w-[72px]' : 'w-[280px] lg:w-[320px]'
    }`}>
      {/* Primary Navigation Box */}
      <nav className="bg-spotify-base rounded-lg p-3 flex flex-col gap-4">
        <button
          onClick={() => navigateTo('home')}
          className={`flex items-center gap-4 text-sm font-semibold transition ${
            currentView === 'home' ? 'text-white' : 'text-spotify-subdued hover:text-white'
          }`}
          title="Home"
        >
          <Home size={24} className={currentView === 'home' ? 'text-white' : 'text-spotify-subdued'} />
          {!isCollapsed && <span>Home</span>}
        </button>

        <button
          onClick={() => navigateTo('search')}
          className={`flex items-center gap-4 text-sm font-semibold transition ${
            currentView === 'search' ? 'text-white' : 'text-spotify-subdued hover:text-white'
          }`}
          title="Search"
        >
          <Search size={24} className={currentView === 'search' ? 'text-white' : 'text-spotify-subdued'} />
          {!isCollapsed && <span>Search</span>}
        </button>
      </nav>

      {/* Your Library Panel */}
      <div className="flex-1 bg-spotify-base rounded-lg p-2 flex flex-col overflow-hidden">
        {/* Library Header */}
        <div className="flex items-center justify-between px-2 py-3">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center gap-3 text-spotify-subdued hover:text-white transition group"
            title="Expand or collapse library"
          >
            <Library size={24} className="text-spotify-subdued group-hover:text-white transition" />
            {!isCollapsed && <span className="font-semibold text-sm">Your Library</span>}
          </button>

          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 rounded-full flex items-center justify-center text-spotify-subdued hover:text-white hover:bg-spotify-card-hover transition"
                title="Create playlist or folder"
              >
                <Plus size={18} />
              </button>
              <button 
                onClick={() => setIsCollapsed(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-spotify-subdued hover:text-white hover:bg-spotify-card-hover transition"
                title="Show more"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        {!isCollapsed && (
          <div className="flex items-center gap-2 px-2 pb-2">
            {(['all', 'playlists', 'artists'] as const).map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition ${
                  filter === item 
                    ? 'bg-white text-black' 
                    : 'bg-spotify-elevated text-white hover:bg-spotify-highlight'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Playlists & Collections Scrollable List */}
        <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-1 mt-1">
          {/* Liked Songs Tile */}
          {(filter === 'all' || filter === 'playlists') && (
            <div
              onClick={() => navigateTo('liked')}
              className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
                currentView === 'liked' ? 'bg-spotify-card-hover' : 'hover:bg-spotify-card/80'
              }`}
              title="Liked Songs"
            >
              <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center flex-shrink-0 shadow-md">
                <Heart size={20} className="text-white fill-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold truncate ${
                    currentView === 'liked' ? 'text-spotify-green' : 'text-white'
                  }`}>
                    Liked Songs
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-spotify-subdued">
                    <Pin size={12} className="text-spotify-green fill-spotify-green" />
                    <span>Playlist • {likedTrackIds.length} songs</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* User Playlists */}
          {(filter === 'all' || filter === 'playlists') && playlists.map((playlist) => {
            const isActive = currentView === 'playlist' && activePlaylistId === playlist.id;
            return (
              <div
                key={playlist.id}
                onClick={() => navigateTo('playlist', playlist.id)}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${
                  isActive ? 'bg-spotify-card-hover' : 'hover:bg-spotify-card/80'
                }`}
                title={playlist.title}
              >
                <img
                  src={playlist.coverUrl}
                  alt={playlist.title}
                  className="w-12 h-12 rounded-md object-cover flex-shrink-0 shadow-sm"
                />
                {!isCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold truncate ${
                      isActive ? 'text-spotify-green' : 'text-white'
                    }`}>
                      {playlist.title}
                    </p>
                    <p className="text-xs text-spotify-subdued truncate">
                      Playlist • {playlist.creator}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Artists (if filter selected) */}
          {filter === 'artists' && (
            <div className="flex flex-col gap-2 p-2">
              {['Aether Wave', 'Luna Solaris', 'Komorebi Sound', 'Vektor 99'].map((art, idx) => (
                <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-spotify-card/80 cursor-pointer">
                  <div className="w-12 h-12 rounded-full bg-spotify-elevated flex items-center justify-center text-spotify-subdued">
                    <Music size={20} />
                  </div>
                  {!isCollapsed && (
                    <div>
                      <p className="text-sm font-semibold text-white">{art}</p>
                      <p className="text-xs text-spotify-subdued">Artist</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
