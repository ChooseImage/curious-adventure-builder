
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { toast } from 'sonner';
import VideoPlayer from './VideoPlayer';

interface StoryPageProps {
  chapters?: {
    html: string;
    gliastar: string;  // This contains the video URL
    article: {
      title: string;
      content: string;
    };
  }[];
}

const StoryPage: React.FC<StoryPageProps> = ({ chapters = [] }) => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [localChapters, setLocalChapters] = useState(chapters);
  
  // Convert chapterId to index (1-based to 0-based)
  const chapterIndex = parseInt(chapterId || '1') - 1;
  
  useEffect(() => {
    // If no chapters were provided as props, try to get them from localStorage
    if (chapters.length === 0) {
      try {
        const storedChapters = localStorage.getItem('storyChapters');
        if (storedChapters) {
          const parsedChapters = JSON.parse(storedChapters);
          console.log("Retrieved chapters from localStorage:", parsedChapters);
          setLocalChapters(parsedChapters);
        } else {
          console.warn("No chapters found in localStorage");
          toast.error("No story chapters found. Returning to home page.");
          setTimeout(() => navigate('/'), 2000);
        }
      } catch (error) {
        console.error("Error retrieving chapters from localStorage:", error);
        toast.error("Error loading story. Returning to home page.");
        setTimeout(() => navigate('/'), 2000);
      }
    } else {
      // If chapters were provided as props, store them in localStorage for future use
      console.log("Storing chapters in localStorage:", chapters);
      localStorage.setItem('storyChapters', JSON.stringify(chapters));
      setLocalChapters(chapters);
    }
  }, [chapters, navigate]);
  
  // Get total chapters from our localChapters state
  const totalChapters = localChapters.length;
  
  useEffect(() => {
    console.log("StoryPage component with chapters:", localChapters);
    console.log("Current chapter index:", chapterIndex);
    
    if (localChapters.length === 0) {
      // This is handled in the first useEffect
    } else if (chapterIndex < 0 || chapterIndex >= localChapters.length) {
      toast.error(`Invalid chapter number. Valid range: 1-${localChapters.length}`);
      setTimeout(() => navigate('/story/1'), 2000);
    }
  }, [localChapters, chapterIndex, navigate]);
  
  // Get current chapter data with better error handling
  const chapter = localChapters.length > 0 && chapterIndex >= 0 && chapterIndex < localChapters.length 
    ? localChapters[chapterIndex] 
    : {
        html: '',
        gliastar: '',
        article: { title: 'Chapter not found', content: 'Sorry, this chapter could not be loaded.' }
      };
  
  // Setup navigation
  const prevChapter = chapterIndex > 0 ? `/story/${chapterIndex}` : null;
  const nextChapter = chapterIndex < totalChapters - 1 ? `/story/${chapterIndex + 2}` : null;

  // Handle iframe loading
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Function to add paragraph spacing to content
  const formatContent = (content: string) => {
    if (!content) return '';
    // Split by paragraphs and join with increased spacing (mb-24 instead of mb-6)
    return content.split('\n').map((paragraph, index) => (
      <p key={index} className="mb-24 leading-relaxed">{paragraph}</p>
    ));
  };

  return (
    <div className="relative min-h-screen">
      {/* The background HTML iframe takes full screen */}
      <div className="fixed inset-0 w-full h-full z-0">
        {chapter.html ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-2xl font-light animate-pulse">Loading chapter...</div>
              </div>
            )}
            <iframe 
              src={chapter.html} 
              className="w-full h-full border-none" 
              title={`Chapter ${chapterIndex + 1}`}
              onLoad={handleIframeLoad}
            />
          </>
        ) : (
          <div className="w-full h-full">
            {/* Empty div for background */}
          </div>
        )}
      </div>
      
      {/* Display video player if there's a gliastar video URL */}
      {chapter.gliastar && (
        <VideoPlayer videoUrl={chapter.gliastar} />
      )}
      
      {/* Transparent article container */}
      <div className="relative z-10 pt-8 pb-16 px-4 min-h-screen flex flex-col items-center">
        {/* Navigation header - smaller and more subtle */}
        <header className="w-full max-w-3xl mx-auto flex justify-between items-center mb-12 px-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-white border-white/20 hover:text-white">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
          
          <div className="text-white text-sm font-medium px-3 py-1.5 rounded-full">
            Chapter {chapterIndex + 1} of {totalChapters}
          </div>
        </header>
        
        {/* Article content with better spacing */}
        <article className="prose prose-lg prose-invert max-w-3xl w-full mx-auto px-6 py-8 rounded-xl border border-white/10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 leading-tight">
            {chapter.article.title || "Chapter Title Not Available"}
          </h1>
          
          <div className="text-white/90 text-lg space-y-6 font-serif">
            {formatContent(chapter.article.content)}
          </div>
        </article>
        
        {/* Navigation footer - more subtle and positioned at bottom */}
        <footer className="w-full max-w-3xl mx-auto flex justify-between items-center mt-12 px-4">
          {prevChapter ? (
            <Link to={prevChapter}>
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:text-white">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextChapter ? (
            <Link to={nextChapter}>
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:text-white">
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="outline" size="sm" className="text-white border-white/20 hover:text-white">
                Finish Story
                <Home className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          )}
        </footer>
      </div>
    </div>
  );
};

export default StoryPage;
