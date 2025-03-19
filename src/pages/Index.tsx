import React, { useState, useEffect } from "react";
import ChatInput from "@/components/ChatInput";
import LoadingState from "@/components/LoadingState";
import StoryContainer from "@/components/StoryContainer";
import VideoPlayer from "@/components/VideoPlayer";
import { Story, StoryState } from "@/types/story";
import { tallestBuildingsStory } from "@/utils/dummyData";
import { toast } from "sonner";
import { streamConversation, invokeConversation } from "@/services/apiService";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BuildingsVisualization from "@/components/BuildingsVisualization";

const Index = () => {
  const [storyState, setStoryState] = useState<StoryState>('idle');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [hasValidThreeJsContent, setHasValidThreeJsContent] = useState(false);
  const [streamingContent, setStreamingContent] = useState<any[]>([]);
  const navigate = useNavigate();

  const handleNavigateToSketch = () => {
    console.log("Navigating to /sketch");
    navigate('/sketch');
  };

  useEffect(() => {
    if (!activeStory || storyState !== 'ready') {
      setHasValidThreeJsContent(false);
      return;
    }

    const hasThreeJs = activeStory.scenes.some(scene => 
      scene.data?.threejs_code || scene.threeJsCode
    );
    
    console.log("Story has Three.js content:", hasThreeJs);
    setHasValidThreeJsContent(hasThreeJs);
  }, [activeStory, storyState]);

  const handlePromptSubmit = async (prompt: string) => {
    setStoryState('loading');
    toast.info("Generating your story...");
    setStreamingContent([]);
    
    try {
      // Start streaming response
      toast.info("Starting stream...");
      await streamConversation(prompt, (eventType, data) => {
        console.log(`Stream event received: ${eventType}`, data);
        if (eventType === 'data' || eventType === 'metadata') {
          setStreamingContent(prev => [...prev, { type: eventType, data }]);
        } else if (eventType === 'error') {
          console.error('Stream error:', data);
          toast.error(`Stream error: ${data.message}`);
        }
      });
      
      toast.info("Generating content from dummy data...");
      const story = await invokeConversation(prompt);
      
      console.log('Successfully loaded story:', story.title);
      setActiveStory(story);
      setStoryState('ready');
      setHasValidThreeJsContent(true);
      toast.success("Your story is ready!");
      
    } catch (error) {
      console.error("Error processing prompt:", error);
      toast.error("Using fallback dummy data");
      
      // Always use dummy data even in case of error
      setActiveStory({
        ...tallestBuildingsStory,
        originalPrompt: prompt,
        title: prompt.length > 30 ? `${prompt.substring(0, 30)}...` : prompt
      });
      
      setStoryState('ready');
      setHasValidThreeJsContent(true);
    }
  };

  const handleReset = () => {
    setStoryState('idle');
    setActiveStory(null);
    setHasValidThreeJsContent(false);
    setStreamingContent([]);
  };

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const youtubeId = getYoutubeId("https://www.youtube.com/watch?v=7wIIzk_aUsg") || "";

  const videoUrl = "https://static-gstudio.gliacloud.com/10903/files/a86e423ead118924eba4577a3505f818aff8c413.mp4";

  return (
    <div className="min-h-screen w-full bg-background relative">
      {storyState === 'ready' && <VideoPlayer videoUrl={videoUrl} />}

      {streamingContent.length > 0 && (
        <div className="fixed top-4 right-4 w-80 max-h-[400px] overflow-auto bg-black/80 text-white p-4 rounded-lg z-50 font-mono text-xs">
          <h3 className="text-sm font-bold mb-2">Stream Response:</h3>
          <div className="overflow-y-auto max-h-[350px]">
            {streamingContent.map((item, index) => (
              <div key={index} className="mb-2 pb-2 border-b border-white/20">
                <div className="text-xs text-green-400 mb-1">{item.type}:</div>
                <pre className="whitespace-pre-wrap text-xs overflow-hidden text-ellipsis">
                  {JSON.stringify(item.data, null, 2)}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {storyState === 'ready' && hasValidThreeJsContent && (
        <div className="relative w-full h-screen">
          <BuildingsVisualization story={activeStory} isActive={storyState === 'ready'} />
          
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
          
          <div className="relative mt-screen">
            <div className="h-[300vh] bg-gradient-to-b from-transparent to-background pt-[100vh]">
              <div className="container mx-auto px-4 py-20">
                <h2 className="text-3xl font-bold mb-6">Scroll to Explore the Buildings</h2>
                <p className="text-lg mb-8">As you scroll down, watch how the camera flies around the world's tallest buildings.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-3">About This Visualization</h3>
                    <p>This interactive 3D visualization shows the top 10 tallest buildings in the world. 
                    Scroll to change the camera angle and get different perspectives.</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                    <h3 className="text-xl font-semibold mb-3">Architectural Wonders</h3>
                    <p>These incredible structures represent some of humanity's greatest architectural and engineering achievements.</p>
                  </div>
                </div>
                
                {/* Adding more scrollable content */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                  {tallestBuildingsStory.scenes.slice(2, 8).map((scene, index) => (
                    scene.data && (
                      <div key={scene.id} className="bg-white/10 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                        <h3 className="text-xl font-semibold mb-3">{scene.title}</h3>
                        <p className="mb-3">{scene.data.content_copy ? scene.data.content_copy.substring(0, 150) + '...' : scene.description}</p>
                        {scene.data.height && (
                          <div className="mt-2 text-sm">
                            <p>Height: {scene.data.height}m</p>
                            <p>Completed: {scene.data.completionYear}</p>
                            <p>Location: {scene.data.location}</p>
                          </div>
                        )}
                      </div>
                    )
                  ))}
                </div>
                
                <div className="h-[50vh] flex items-center justify-center bg-white/5 backdrop-blur-sm rounded-lg p-8">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold mb-4">Keep Scrolling for More</h2>
                    <p className="text-xl">The visualization responds to your scroll position</p>
                  </div>
                </div>
                
                <div className="h-[30vh]"></div>
              </div>
            </div>
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
