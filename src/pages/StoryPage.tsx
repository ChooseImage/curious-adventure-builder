
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
  const chapters = state?.chapters || [];
  
  useEffect(() => {
    console.log("StoryPage received chapters:", chapters);
    
    // If no chapters are available, redirect back to home with a warning
    if (!chapters || chapters.length === 0) {
      console.warn("No story chapters found, redirecting to home");
      toast.error("No story chapters found. Redirecting to home page.");
      navigate('/');
    } else {
      setIsLoading(false);
    }
  }, [chapters, navigate]);

  // Only render the StoryPageComponent if we have chapters and we're not in loading state
  return !isLoading && chapters.length > 0 ? (
    <StoryPageComponent chapters={chapters} />
  ) : null;
};

export default StoryPage;
