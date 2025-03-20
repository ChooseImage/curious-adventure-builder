
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
  const lastVideoUrlRef = useRef<string>('');
  const mountedRef = useRef<boolean>(false);

  // Initialize the mounted ref
  useEffect(() => {
    mountedRef.current = true;
    console.log("VideoPlayer mounted with URL:", videoUrl);
    
    // Clean up on unmount
    return () => {
      mountedRef.current = false;
      console.log("VideoPlayer unmounted");
    };
  }, []);

  // Log when the component receives a new videoUrl prop
  useEffect(() => {
    if (!mountedRef.current) return;
    
    console.log("VideoPlayer received videoUrl:", videoUrl);
    console.log("Previous URL was:", lastVideoUrlRef.current);
    
    // Check if the base URL has changed (ignoring query params)
    const currentBase = videoUrl?.split('?')[0] || '';
    const lastBase = lastVideoUrlRef.current?.split('?')[0] || '';
    
    if (currentBase !== lastBase) {
      console.log("Base URL changed from", lastBase, "to", currentBase);
      lastVideoUrlRef.current = videoUrl;
      
      // Reset closed state when URL changes
      if (videoUrl && isClosed) {
        console.log("New video URL provided, resetting closed state");
        setIsClosed(false);
      }
      
      // Process the URL
      processVideoUrl(videoUrl);
    } else if (videoUrl !== lastVideoUrlRef.current) {
      // Same base URL but different query params (like timestamp)
      console.log("Same base URL but query params changed, updating reference");
      lastVideoUrlRef.current = videoUrl;
      
      // Just update the formatted URL directly without changing closed state
      setFormattedUrl(currentBase);
    }
  }, [videoUrl, isClosed]);

  // Process the video URL
  const processVideoUrl = (url: string) => {
    if (!url) {
      setFormattedUrl('');
      return;
    }
    
    // Remove any query parameters (like timestamps)
    const baseUrl = url.split('?')[0];
    
    console.log("Processing video URL:", baseUrl);
    
    // Ensure URL is properly formatted
    if (baseUrl.endsWith('.webm')) {
      console.log("Using .webm video directly:", baseUrl);
      setFormattedUrl(baseUrl);
    } else if (!baseUrl.startsWith('https://')) {
      console.log("Converting videoUrl format:", baseUrl);
      // If it's not a URL, assume it needs to be converted to one
      setFormattedUrl(`https://static-gstudio.gliacloud.com/${baseUrl}`);
    } else {
      console.log("Using provided URL without changes:", baseUrl);
      setFormattedUrl(baseUrl);
    }
  };

  // Reset video when URL changes
  useEffect(() => {
    if (!formattedUrl || !mountedRef.current) return;
    
    console.log("VideoPlayer using formatted URL:", formattedUrl);
    
    // Reset the video element with the new source
    if (videoRef.current) {
      console.log("Reloading video with new source");
      videoRef.current.load();
    }
  }, [formattedUrl]);

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
