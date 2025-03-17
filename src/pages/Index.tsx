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

  // Handle navigation to the Three.js sketch page
  const handleNavigateToSketch = () => {
    console.log("Navigating to /sketch");
    navigate('/sketch');
  };

  // Setup Three.js scene and renderer - only when storyState changes from idle
  useEffect(() => {
    // Only initialize Three.js after story is loading or ready
    if (storyState === 'idle' || !canvasRef.current) return;
    
    console.log("Setting up Three.js scene");
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

    // Add basic lighting to ensure visibility
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create a simple, visible geometry - similar to what works in the sketch page
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshStandardMaterial({ 
      color: 0x3b82f6,
      metalness: 0.7,
      roughness: 0.3
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Add a torus knot for visual interest
    const torusGeometry = new THREE.TorusKnotGeometry(1.5, 0.5, 100, 16);
    const torusMaterial = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.8,
      roughness: 0.2
    });
    const torusKnot = new THREE.Mesh(torusGeometry, torusMaterial);
    torusKnot.position.set(-4, 0, 0);
    scene.add(torusKnot);

    // Add a sphere
    const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      metalness: 0.6,
      roughness: 0.4
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.position.set(4, 0, 0);
    scene.add(sphere);

    // Create a grid helper for orientation
    const gridHelper = new THREE.GridHelper(20, 20, 0x888888, 0x444444);
    scene.add(gridHelper);

    const animate = () => {
      if (!canvasRef.current) return;
      
      requestAnimationFrame(animate);
      
      // Add animation to objects for visual interest
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
      torusKnot.rotation.x += 0.01;
      torusKnot.rotation.y += 0.01;
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;
      
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
  }, [storyState]); // Only re-run when storyState changes

  // Keep 3D scene visible after story is loaded
  useEffect(() => {
    if (storyState === 'ready' && rendererRef.current && sceneRef.current && cameraRef.current) {
      // Make sure 3D scene continues rendering even after story is ready
      const ensureRendering = () => {
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
          requestAnimationFrame(ensureRendering);
        }
      };
      ensureRendering();
    }
  }, [storyState]);

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
      {/* Only show the canvas container when not in idle state */}
      {storyState !== 'idle' && (
        <div className="relative w-full h-screen">
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: 0 }}
          />
          
          {/* Navigation Header - Increased z-index and added pointer-events-auto */}
          <div className="absolute top-0 left-0 w-full p-4 bg-black/50 text-white z-50 pointer-events-auto">
            <h2 className="text-lg font-bold">Interactive Storybook Visualization</h2>
            
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
