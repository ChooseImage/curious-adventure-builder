import React, { useState } from "react";
import ChatInput from "@/components/ChatInput";
import LoadingState from "@/components/LoadingState";
import StoryContainer from "@/components/StoryContainer";
import { Story, StoryState } from "@/types/story";
import { tallestBuildingsStory } from "@/utils/dummyData";
import { toast } from "sonner";
import { createThread, invokeThread } from "@/services/apiService";

const Index = () => {
  const [storyState, setStoryState] = useState<StoryState>('idle');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  const handlePromptSubmit = async (prompt: string) => {
    // Start loading state
    setStoryState('loading');
    
    try {
      // If we don't have a thread ID yet, create a new thread
      if (!threadId) {
        const threadResponse = await createThread();
        setThreadId(threadResponse.thread_id);
      }
      
      if (!threadId) {
        throw new Error("Failed to create or retrieve thread ID");
      }
      
      // Invoke the thread with the user's prompt
      const story = await invokeThread(threadId, prompt);
      setActiveStory(story);
      setStoryState('ready');
    } catch (error) {
      console.error("Error processing prompt:", error);
      toast.error("There was an error generating your story. Using demo data instead.");
      
      // Fallback to dummy data in case of API failure
      if (prompt.toLowerCase().includes('tall') || 
          prompt.toLowerCase().includes('build') || 
          prompt.toLowerCase().includes('skyscraper')) {
        setActiveStory(tallestBuildingsStory);
      } else {
        setActiveStory(tallestBuildingsStory);
        toast.info("Demo mode: Using the tallest buildings story for all prompts");
      }
      
      setStoryState('ready');
    }
  };

  const handleReset = () => {
    setStoryState('idle');
    setActiveStory(null);
    // Keep the thread ID for potential follow-up conversations
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
