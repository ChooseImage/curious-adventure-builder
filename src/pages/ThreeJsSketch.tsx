
import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { tallestBuildingsStory } from "@/utils/dummyData";

const ThreeJsSketch = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const navigate = useNavigate();

  // Setup Three.js scene and renderer
  useEffect(() => {
    console.log("Setting up Three.js sketch page");
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      
      // Clear any existing renderer to prevent duplicates
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
          // Use a variable name other than 'scene' to avoid redeclaration
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

  return (
    <div className="min-h-screen w-full bg-background relative">
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      
      <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center bg-black/20 text-white z-10">
        <Button
          variant="outline"
          size="sm" 
          onClick={() => navigate('/')}
          className="bg-white/20 hover:bg-white/30 text-white border-white/20"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
        
        <h1 className="text-xl font-bold">Three.js Visualization</h1>
      </div>
      
      <div className="absolute bottom-0 left-0 w-full p-4 bg-black/20 text-white z-10">
        <p className="text-sm text-center">
          {tallestBuildingsStory.scenes[0]?.data?.content_copy || 
            "Throughout human history, we've constantly pushed the boundaries of what's possible in architecture and engineering, creating ever taller structures that reach for the sky. These massive skyscrapers stand as monuments to human ingenuity and technological advancement."}
        </p>
      </div>
    </div>
  );
};

export default ThreeJsSketch;
