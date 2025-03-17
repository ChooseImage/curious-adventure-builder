
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Initialize Three.js scene when component mounts
  useEffect(() => {
    if (storyState === 'idle' && canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 10;
      cameraRef.current = camera;

      // Add lights
      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      // Execute the threejs_code from the dummy data
      try {
        // Get the first scene with threejs_code
        const firstScene = tallestBuildingsStory.scenes[0];
        if (firstScene && firstScene.data && firstScene.data.threejs_code) {
          const setupFn = new Function(
            'THREE', 
            'scene', 
            'camera', 
            'renderer', 
            'canvas',
            firstScene.data.threejs_code
          );
          
          setupFn(THREE, scene, camera, renderer, canvas);
        }
      } catch (error) {
        console.error("Error executing Three.js code:", error);
      }

      // Animation loop
      const animate = () => {
        if (!canvasRef.current) return;
        
        requestAnimationFrame(animate);
        
        // Rotate camera slightly for subtle movement
        if (cameraRef.current && sceneRef.current) {
          cameraRef.current.position.x = Math.sin(Date.now() * 0.0001) * 2;
          cameraRef.current.lookAt(sceneRef.current.position);
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      animate();

      // Handle window resize
      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        rendererRef.current?.dispose();
      };
    }
  }, [storyState]);

  const handlePromptSubmit = async (prompt: string) => {
    // Start loading state
    setStoryState('loading');
    toast.info("Generating your story...");
    
    try {
      // If we don't have a thread ID yet, create a new thread
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
      
      // Invoke the thread with the user's prompt
      console.log('Invoking thread with prompt:', prompt);
      toast.info("Sending your prompt to generate content...");
      const story = await invokeThread(currentThreadId, prompt);
      
      console.log('Successfully received story:', story.title);
      setActiveStory(story);
      setStoryState('ready');
      toast.success("Your story is ready!");
      
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
    <div className="min-h-screen w-full bg-background relative">
      {/* Three.js background canvas */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full -z-10"
      />
      
      {/* Initial welcome state - only visible when idle */}
      {storyState === 'idle' && (
        <div className="min-h-screen flex flex-col justify-center items-center p-8 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6 animate-fade-in glass-panel p-8 rounded-lg">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Interactive Storybook Creator
            </h1>
            
            {/* Content from the dummy data */}
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
