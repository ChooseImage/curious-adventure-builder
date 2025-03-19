
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface StoryPageProps {
  chapters?: {
    html: string;
    gliastar: string;
    article: {
      title: string;
      content: string;
    };
  }[];
}

const StoryPage: React.FC<StoryPageProps> = ({ chapters = [] }) => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [isLoading, setIsLoading] = useState(true);
  
  // Convert chapterId to index (1-based to 0-based)
  const chapterIndex = parseInt(chapterId || '1') - 1;
  const totalChapters = chapters.length;
  
  // Get current chapter data
  const chapter = chapters[chapterIndex] || {
    html: '',
    article: { title: 'Chapter not found', content: 'Sorry, this chapter could not be loaded.' }
  };
  
  // Setup navigation
  const prevChapter = chapterIndex > 0 ? `/story/${chapterIndex}` : null;
  const nextChapter = chapterIndex < totalChapters - 1 ? `/story/${chapterIndex + 2}` : null;

  // Handle iframe loading
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background HTML */}
      <div className="fixed inset-0 w-full h-full z-0">
        {chapter.html ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background">
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
          <div className="w-full h-full bg-gradient-to-b from-indigo-500 to-purple-700">
            {/* Fallback background */}
          </div>
        )}
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 w-full max-w-4xl mx-auto min-h-screen flex flex-col px-4 py-8">
        {/* Navigation header */}
        <header className="bg-black/40 backdrop-blur-md rounded-lg p-4 mb-8 flex justify-between items-center">
          <Link to="/">
            <Button variant="outline" size="sm" className="text-white border-white/40 bg-black/30">
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          
          <div className="text-white text-sm font-medium">
            Chapter {chapterIndex + 1} of {totalChapters}
          </div>
        </header>
        
        {/* Main content */}
        <div className="flex-grow flex flex-col mb-20">
          <div className="bg-black/60 backdrop-blur-md rounded-lg p-8 flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
              {chapter.article.title}
            </h1>
            
            <ScrollArea className="h-[calc(100vh-300px)] pr-4">
              <div className="text-white/90 text-lg leading-relaxed whitespace-pre-line">
                {chapter.article.content}
              </div>
            </ScrollArea>
          </div>
        </div>
        
        {/* Navigation footer */}
        <footer className="bg-black/40 backdrop-blur-md rounded-lg p-4 flex justify-between items-center">
          {prevChapter ? (
            <Link to={prevChapter}>
              <Button variant="outline" size="sm" className="text-white border-white/40 bg-black/30">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
          
          {nextChapter ? (
            <Link to={nextChapter}>
              <Button variant="outline" size="sm" className="text-white border-white/40 bg-black/30">
                Next Chapter
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link to="/">
              <Button variant="outline" size="sm" className="text-white border-white/40 bg-black/30">
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
