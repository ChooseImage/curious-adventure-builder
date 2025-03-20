
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import StoryPageComponent from '@/components/StoryPage';
import { toast } from 'sonner';
import { useStoryChapters } from '@/hooks/useStoryChapters';

const StoryPage = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // Use our custom hook to access chapters globally
  const { chapters, isLoading: isChaptersLoading, error } = useStoryChapters();
  
  useEffect(() => {
    console.log("StoryPage loaded with chapterId:", chapterId);
    console.log("StoryPage received chapters from hook:", chapters);
    
    // If we're loading chapters, wait
    if (isChaptersLoading) {
      console.log("Still loading chapters data...");
      return;
    }
    
    // If we have chapters, we're good to go
    if (chapters && chapters.length > 0) {
      console.log("Using chapters from global store:", chapters);
      setIsLoading(false);
    } else {
      // If no chapters are available, redirect to home
      console.warn("No story chapters found in global store, redirecting to home");
      toast.error("No story chapters found. Redirecting to home page.");
      navigate('/');
    }
  }, [chapters, isChaptersLoading, navigate, chapterId]);

  // Handle errors from the hook
  useEffect(() => {
    if (error) {
      console.error("Error loading chapters:", error);
      toast.error("Error loading story. Redirecting to home page.");
      navigate('/');
    }
  }, [error, navigate]);

  // Render the StoryPageComponent with chapters from the hook
  return !isLoading ? (
    <StoryPageComponent chapters={chapters} />
  ) : null;
};

export default StoryPage;
