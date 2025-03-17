import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
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

const Index = () => {
  const [storyState, setStoryState] = useState<StoryState>('idle');
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Setting up Three.js scene");
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      const renderer = new THREE.WebGLRenderer({ 
        canvas, 
        antialias: true,
        alpha: true 
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(
        75, 
        window.innerWidth / window.innerHeight, 
        0.1, 
        1000
      );
      camera.position.z = 10;
      cameraRef.current = camera;

      const ambientLight = new THREE.AmbientLight(0x404040, 2);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(1, 1, 1);
      scene.add(directionalLight);

      try {
        const firstScene = tallestBuildingsStory.scenes[0];
        if (firstScene && firstScene.data && firstScene.data.threejs_code) {
          console.log("Executing Three.js code from dummy data");
          const setupFn = new Function(
            'THREE', 
            'existingScene', 
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

      const animate = () => {
        if (!canvasRef.current) return;
        
        requestAnimationFrame(animate);
        
        if (cameraRef.current && sceneRef.current) {
          cameraRef.current.position.x = Math.sin(Date.now() * 0.0001) * 2;
          cameraRef.current.lookAt(sceneRef.current.position);
        }
        
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      
      animate();

      const handleResize = () => {
        if (cameraRef.current && rendererRef.current) {
          cameraRef.current.aspect = window.innerWidth / window.innerHeight;
          cameraRef.current.updateProjectionMatrix();
          rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        }
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        rendererRef.current?.dispose();
      };
    }
  }, []);

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
    }
  };

  const handleReset = () => {
    setStoryState('idle');
    setActiveStory(null);
  };

  return (
    <div className="min-h-screen w-full bg-background relative">
      <div className="relative w-full h-screen z-0">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: 0 }}
        />
        <div className="absolute top-0 left-0 w-full p-4 bg-black/20 text-white z-10">
          <h2 className="text-lg font-bold">Three.js Canvas Debugging</h2>
          <p>If you see this text but no 3D content below, there might be an issue with Three.js rendering.</p>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/sketch')}
            className="mt-2 bg-white/20 hover:bg-white/30 text-white border-white/20"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Screen Three.js Sketch
          </Button>
        </div>
      </div>
      
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
              onClick={() => navigate('/sketch')}
              className="mt-4"
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
