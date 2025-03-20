
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryPageComponent from '@/components/StoryPage';
import { toast } from 'sonner';

const StoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [isLoading, setIsLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  
  useEffect(() => {
    // Get the chapters directly from location state
    const routeChapters = state?.chapters || [];
    console.log("StoryPage received chapters from route state:", routeChapters);
    
    // If we have chapters in route state, update our state
    if (routeChapters && routeChapters.length > 0) {
      console.log("Using chapters from route state");
      setChapters(routeChapters);
      
      // Also update localStorage with the fresh data
      // Force a timestamp to ensure data is treated as new
      const chaptersWithTimestamp = routeChapters.map((chapter: any) => ({
        ...chapter,
        _timestamp: new Date().getTime()
      }));
      localStorage.setItem('storyChapters', JSON.stringify(chaptersWithTimestamp));
      setIsLoading(false);
    } else {
      // If no chapters in route state, try localStorage
      console.log("No chapters in route state, trying localStorage");
      
      try {
        const storedChapters = localStorage.getItem('storyChapters');
        if (storedChapters) {
          console.log("Found chapters in localStorage");
          const parsedChapters = JSON.parse(storedChapters);
          setChapters(parsedChapters);
          setIsLoading(false);
        } else {
          console.warn("No story chapters found in localStorage either, redirecting to home");
          toast.error("No story chapters found. Redirecting to home page.");
          navigate('/');
        }
      } catch (error) {
        console.error("Error reading localStorage:", error);
        toast.error("Error loading story. Redirecting to home page.");
        navigate('/');
      }
    }
  }, [state, navigate]);

  // Render the StoryPageComponent with chapters
  return !isLoading ? (
    <StoryPageComponent chapters={chapters} />
  ) : null;
};

export default StoryPage;
