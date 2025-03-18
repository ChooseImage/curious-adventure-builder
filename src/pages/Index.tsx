
import React, { useState, useEffect } from "react";
import ChatInput from "@/components/ChatInput";
import LoadingState from "@/components/LoadingState";
import StoryContainer from "@/components/StoryContainer";
import { Story, StoryState } from "@/types/story";
import { tallestBuildingsStory } from "@/utils/dummyData";
import { toast } from "sonner";
import { createThread, invokeThread } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BuildingsVisualization from "@/components/BuildingsVisualization";

const Index = () => {
  const [storyState, setStoryState] = useState<StoryState>('idle');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [hasValidThreeJsContent, setHasValidThreeJsContent] = useState(false);
  const navigate = useNavigate();

  // Handle navigation to the Three.js sketch page
  const handleNavigateToSketch = () => {
    console.log("Navigating to /sketch");
    navigate('/sketch');
  };

  // Validate if the story has any Three.js content
  useEffect(() => {
    if (!activeStory || storyState !== 'ready') {
      setHasValidThreeJsContent(false);
      return;
    }

    // Check if any scene has Three.js code
    const hasThreeJs = activeStory.scenes.some(scene => 
      scene.data?.threejs_code || scene.threeJsCode
    );
    
    console.log("Story has Three.js content:", hasThreeJs);
    setHasValidThreeJsContent(hasThreeJs);
  }, [activeStory, storyState]);

  const handlePromptSubmit = async (prompt: string) => {
    setStoryState('loading');
    toast.info("Generating your story...");
    
    try {
      let currentThreadId = threadId;
      if (!currentThreadId) {
        toast.info("Creating a new conversation thread...");
        const threadResponse = await createThread();
        currentThreadId = threadResponse.thread_id;
        setThreadId(currentThreadId);
        console.log('Created new thread:', currentThreadId);
        toast.success("Thread created successfully!");
      }
      
      if (!currentThreadId) {
        throw new Error("Failed to create or retrieve thread ID");
      }
      
      console.log('Invoking thread with prompt:', prompt);
      toast.info("Sending your prompt to generate content...");
      const story = await invokeThread(currentThreadId, prompt);
      
      console.log('Successfully received story:', story.title);
      setActiveStory(story);
      setStoryState('ready');
      setHasValidThreeJsContent(true); // Force enable visualization for now
      toast.success("Your story is ready!");
      
    } catch (error) {
      console.error("Error processing prompt:", error);
      toast.error("There was an error generating your story. Using demo data instead.");
      
      setActiveStory({
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt
      });
      
      setStoryState('ready');
      setHasValidThreeJsContent(true); // Force enable visualization for demo data
    }
  };

  const handleReset = () => {
    setStoryState('idle');
    setActiveStory(null);
    setHasValidThreeJsContent(false);
  };

  return (
    <div className="min-h-screen w-full bg-background relative">
      {/* Only show the buildings visualization when in ready state AND we have valid Three.js content */}
      {storyState === 'ready' && hasValidThreeJsContent && (
        <div className="relative w-full h-screen">
          <BuildingsVisualization story={activeStory} />
          
          {/* Navigation Header */}
          <div className="absolute top-0 left-0 w-full p-4 bg-black/50 text-white z-50 pointer-events-auto">
            <h2 className="text-lg font-bold">World's Tallest Buildings Visualization</h2>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNavigateToSketch}
              className="mt-2 bg-white/40 hover:bg-white/60 text-white border-white/40 font-semibold"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Full Screen Three.js Sketch
            </Button>
          </div>
        </div>
      )}
      
      {storyState === 'idle' && (
        <div className="absolute top-0 left-0 w-full min-h-screen flex flex-col justify-center items-center p-8 z-20">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in glass-panel p-8 rounded-lg">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Interactive Storybook Creator
            </h1>
            
            {tallestBuildingsStory.scenes[0]?.data?.content_copy && (
              <p className="text-lg text-muted-foreground">
                {tallestBuildingsStory.scenes[0].data.content_copy}
              </p>
            )}
            
            <div className="text-muted-foreground">
              <p>Try asking about:</p>
              <ul className="mt-2 inline-flex flex-col gap-1">
                <li>"What are the tallest buildings in the world?"</li>
                <li>"How do volcanoes work?"</li>
                <li>"Tell me about the solar system"</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleNavigateToSketch}
              className="mt-4 bg-primary hover:bg-primary/80 text-white font-semibold px-6 py-2 shadow-lg z-50 relative"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Explore Three.js Visualization
            </Button>
          </div>
        </div>
      )}
      
      <LoadingState isLoading={storyState === 'loading'} />
      
      <StoryContainer 
        story={activeStory} 
        isVisible={storyState === 'ready'}
        onReset={handleReset}
      />
      
      <ChatInput 
        onSubmit={handlePromptSubmit} 
        isLoading={storyState === 'loading'} 
      />
    </div>
  );
};

export default Index;
