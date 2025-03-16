
import React, { useState } from "react";
import ChatInput from "@/components/ChatInput";
import LoadingState from "@/components/LoadingState";
import StoryContainer from "@/components/StoryContainer";
import { Story } from "@/types/story";
import { tallestBuildingsStory } from "@/utils/dummyData";
import { toast } from "sonner";

const Index = () => {
  const [storyState, setStoryState] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [activeStory, setActiveStory] = useState<Story | null>(null);

  const handlePromptSubmit = (prompt: string) => {
    // Start loading state
    setStoryState('loading');
    
    // For demo purposes, simulate a loading delay
    setTimeout(() => {
      // In a real app, this would make an API call to generate the story
      // For now, we'll use our dummy data for any prompt
      if (prompt.toLowerCase().includes('tall') || 
          prompt.toLowerCase().includes('build') || 
          prompt.toLowerCase().includes('skyscraper')) {
        setActiveStory(tallestBuildingsStory);
      } else {
        // For any other prompt, still use our buildings story but notify the user
        setActiveStory(tallestBuildingsStory);
        toast.info("Demo mode: Using the tallest buildings story for all prompts");
      }
      
      setStoryState('ready');
    }, 3000);
  };

  const handleReset = () => {
    setStoryState('idle');
    setActiveStory(null);
  };

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Initial welcome state - only visible when idle */}
      {storyState === 'idle' && (
        <div className="min-h-screen flex flex-col justify-center items-center p-8">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Interactive Storybook Creator
            </h1>
            <p className="text-xl text-muted-foreground">
              Ask me anything and I'll create an interactive story just for you.
            </p>
            <div className="text-muted-foreground">
              <p>Try asking about:</p>
              <ul className="mt-2 inline-flex flex-col gap-1">
                <li>"What are the tallest buildings in the world?"</li>
                <li>"How do volcanoes work?"</li>
                <li>"Tell me about the solar system"</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {/* Loading state */}
      <LoadingState isLoading={storyState === 'loading'} />
      
      {/* Story container */}
      <StoryContainer 
        story={activeStory} 
        isVisible={storyState === 'ready'}
        onReset={handleReset}
      />
      
      {/* Chat input is always visible */}
      <ChatInput 
        onSubmit={handlePromptSubmit} 
        isLoading={storyState === 'loading'} 
      />
    </div>
  );
};

export default Index;
