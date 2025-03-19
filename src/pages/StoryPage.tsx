
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StoryPageComponent from '@/components/StoryPage';

const StoryPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = location;
  
  // Get chapters from location state, or provide empty array as fallback
  const chapters = state?.chapters || [];
  
  useEffect(() => {
    console.log("StoryPage received chapters:", chapters);
    
    // If no chapters are available, redirect back to home
    if (!chapters || chapters.length === 0) {
      console.warn("No story chapters found, redirecting to home");
      navigate('/');
    }
  }, [chapters, navigate]);

  return <StoryPageComponent chapters={chapters} />;
};

export default StoryPage;
