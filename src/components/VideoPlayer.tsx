
import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [formattedUrl, setFormattedUrl] = useState(videoUrl);

  useEffect(() => {
    console.log("VideoPlayer received URL:", videoUrl);
    
    // Ensure URL is properly formatted
    if (videoUrl && videoUrl.endsWith('.webm')) {
      console.log("Using .webm video directly");
      setFormattedUrl(videoUrl);
    } else if (videoUrl && !videoUrl.startsWith('https://')) {
      console.log("Converting videoUrl format");
      // If it's not a URL, assume it needs to be converted to one
      setFormattedUrl(`https://static-gstudio.gliacloud.com/${videoUrl}`);
    } else {
      setFormattedUrl(videoUrl);
    }
  }, [videoUrl]);

  if (isClosed || !formattedUrl) return null;

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
      
      <video
        className="w-full h-full object-cover"
        src={formattedUrl}
        autoPlay
        loop
        muted
        playsInline
      />
    </div>
  );
};

export default VideoPlayer;
