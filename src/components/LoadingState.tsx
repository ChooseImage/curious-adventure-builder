
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize Three.js scene
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(0xf8fafc);

    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    cameraRef.current = camera;
    camera.position.z = 10;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Create objects
    const objects: THREE.Object3D[] = [];
    objectsRef.current = objects;

    // Create particles
    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.7,
    });

    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
      
      // Position randomly in a sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 3;
      
      mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
      mesh.position.z = radius * Math.cos(phi);
      
      // Store initial position for animation
      mesh.userData.initialX = mesh.position.x;
      mesh.userData.initialY = mesh.position.y;
      mesh.userData.initialZ = mesh.position.z;
      
      // Random movement parameters
      mesh.userData.speed = 0.2 + Math.random() * 0.3;
      mesh.userData.movementRadius = 0.2 + Math.random() * 0.3;
      
      scene.add(mesh);
      objects.push(mesh);
    }

    // Add a central object (abstracted book or document shape)
    const bookGeometry = new THREE.BoxGeometry(1.2, 1.6, 0.2);
    const bookMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2,
    });
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    scene.add(book);
    objects.push(book);

    // Add pages
    const pageGeometry = new THREE.PlaneGeometry(1, 1.4);
    const pageMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < 3; i++) {
      const page = new THREE.Mesh(pageGeometry, pageMaterial);
      page.position.z = 0.12 - i * 0.01;
      page.rotation.x = Math.PI / 2;
      page.rotation.z = (Math.random() - 0.5) * 0.2;
      page.userData.speed = 0.3 + Math.random() * 0.3;
      book.add(page);
      objects.push(page);
    }

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    // Animation function
    const animate = () => {
      if (!isLoading) return;

      objects.forEach((obj, index) => {
        if (obj.type === 'Mesh') {
          if (index < 30) {
            // Particles
            const time = Date.now() * 0.001;
            const speed = obj.userData.speed;
            const radius = obj.userData.movementRadius;
            
            obj.position.x = obj.userData.initialX + Math.sin(time * speed) * radius;
            obj.position.y = obj.userData.initialY + Math.cos(time * speed) * radius;
            obj.position.z = obj.userData.initialZ + Math.sin(time * speed * 0.5) * radius;
          } else if (obj === book) {
            // Book
            obj.rotation.y += 0.005;
            obj.position.y = Math.sin(Date.now() * 0.001) * 0.1;
          } else {
            // Pages
            const speed = obj.userData.speed;
            obj.rotation.z = Math.sin(Date.now() * 0.001 * speed) * 0.2;
          }
        }
      });

      if (renderer && camera && scene) {
        renderer.render(scene, camera);
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (renderer) {
        renderer.dispose();
      }
    };
  }, [isLoading]);

  return (
    <div 
      className={cn(
        'fixed inset-0 z-40 flex flex-col items-center justify-center',
        'transition-opacity duration-500 ease-in-out',
        isLoading ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}
    >
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
      <div className="absolute bottom-10 text-center space-y-4">
        <div className="text-2xl font-light tracking-tight text-primary animate-pulse-soft">
          Creating your storybook...
        </div>
        <div className="text-sm text-muted-foreground max-w-xs mx-auto">
          Crafting an interactive experience just for you
        </div>
      </div>
    </div>
  );
};

export default LoadingState;
