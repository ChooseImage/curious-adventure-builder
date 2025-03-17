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
      let currentThreadId = threadId;
      if (!currentThreadId) {
        const threadResponse = await createThread();
        currentThreadId = threadResponse.thread_id;
        setThreadId(currentThreadId);
        console.log('Created new thread:', currentThreadId);
      }
      
      if (!currentThreadId) {
        throw new Error("Failed to create or retrieve thread ID");
      }
      
      // Invoke the thread with the user's prompt
      console.log('Invoking thread with prompt:', prompt);
      const story = await invokeThread(currentThreadId, prompt);
      
      console.log('Successfully received story:', story.title);
      setActiveStory(story);
      setStoryState('ready');
      
    } catch (error) {
      console.error("Error processing prompt:", error);
      toast.error("There was an error generating your story. Using demo data instead.");
      
      // Fallback to dummy data in case of API failure
      setActiveStory({
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt
      });
      
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
