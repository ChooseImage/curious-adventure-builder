
import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoPlayerProps {
  videoUrl: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [formattedUrl, setFormattedUrl] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const previousUrlRef = useRef<string>('');

  // Log when the component receives a new videoUrl prop
  useEffect(() => {
    console.log("VideoPlayer component received new videoUrl:", videoUrl);
    console.log("Previous URL was:", previousUrlRef.current);
    
    if (videoUrl !== previousUrlRef.current) {
      console.log("URL has changed, updating...");
      previousUrlRef.current = videoUrl;
      
      // Ensure URL is properly formatted
      if (videoUrl && videoUrl.endsWith('.webm')) {
        console.log("Using .webm video directly:", videoUrl);
        setFormattedUrl(videoUrl);
      } else if (videoUrl && !videoUrl.startsWith('https://')) {
        console.log("Converting videoUrl format:", videoUrl);
        // If it's not a URL, assume it needs to be converted to one
        setFormattedUrl(`https://static-gstudio.gliacloud.com/${videoUrl}`);
      } else {
        console.log("Using provided URL without changes:", videoUrl);
        setFormattedUrl(videoUrl);
      }
    } else {
      console.log("URL is the same, no update needed");
    }
  }, [videoUrl]);

  // Debug the current formatted URL and reload video if needed
  useEffect(() => {
    console.log("VideoPlayer using formatted URL:", formattedUrl);
    
    // Reset the video element with the new source
    if (videoRef.current && formattedUrl) {
      console.log("Reloading video with new source");
      videoRef.current.load();
    }
  }, [formattedUrl]);

  // Reset closed state if a new URL is provided
  useEffect(() => {
    if (videoUrl && isClosed) {
      console.log("New video URL provided, resetting closed state");
      setIsClosed(false);
    }
  }, [videoUrl, isClosed]);

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
        ref={videoRef}
        className="w-full h-full object-cover"
        src={formattedUrl}
        autoPlay
        loop
        muted
        playsInline
        onError={(e) => console.error("Video error:", e)}
        onLoadedData={() => console.log("Video loaded successfully:", formattedUrl)}
      />
    </div>
  );
};

export default VideoPlayer;
