
import React, { useState } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoPlayerProps {
  youtubeId: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ youtubeId }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  if (isClosed) return null;

  return (
    <div 
      className={`fixed bottom-8 left-8 z-40 glass-panel rounded-lg shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
        isMinimized ? 'w-64 h-36' : 'w-80 h-48 sm:w-96 sm:h-56'
      }`}
    >
      <div className="absolute top-2 right-2 flex gap-2 z-10">
        <button 
          onClick={() => setIsMinimized(!isMinimized)} 
          className="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
          aria-label={isMinimized ? "Maximize" : "Minimize"}
        >
          {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
        </button>
        <button 
          onClick={() => setIsClosed(true)} 
          className="bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>
      
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
};

export default VideoPlayer;
