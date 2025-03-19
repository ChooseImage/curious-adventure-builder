
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryPageComponent from '@/components/StoryPage';
import { toast } from 'sonner';

const StoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  const [isLoading, setIsLoading] = useState(true);
  
  // Get chapters from location state, or provide empty array as fallback
  // We'll let the StoryPageComponent handle localStorage retrieval if this is empty
  const chapters = state?.chapters || [];
  
  useEffect(() => {
    console.log("StoryPage received chapters from route state:", chapters);
    
    // If no chapters in route state, we'll try localStorage in the component
    if (!chapters || chapters.length === 0) {
      console.log("No chapters in route state, will try localStorage in component");
      
      // Check if we have chapters in localStorage before showing a warning
      const storedChapters = localStorage.getItem('storyChapters');
      if (!storedChapters) {
        console.warn("No story chapters found in localStorage either, redirecting to home");
        toast.error("No story chapters found. Redirecting to home page.");
        navigate('/');
      } else {
        console.log("Found chapters in localStorage, component will use them");
        setIsLoading(false);
      }
    } else {
      // If we have chapters, update localStorage with the fresh data
      localStorage.setItem('storyChapters', JSON.stringify(chapters));
      setIsLoading(false);
    }
  }, [chapters, navigate]);

  // Render the StoryPageComponent - it will handle empty chapters by checking localStorage
  return !isLoading ? (
    <StoryPageComponent chapters={chapters} />
  ) : null;
};

export default StoryPage;
