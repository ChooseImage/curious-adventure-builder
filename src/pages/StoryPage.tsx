
import React from 'react';
import { useLocation } from 'react-router-dom';
import StoryPageComponent from '@/components/StoryPage';

const StoryPage = () => {
  const location = useLocation();
  const { state } = location;
  
  // Get chapters from location state, or provide empty array as fallback
  const chapters = state?.chapters || [];

  return <StoryPageComponent chapters={chapters} />;
};

export default StoryPage;
