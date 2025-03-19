
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { cn } from '@/lib/utils';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import { Book, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StreamMessage {
  id: string;
  content: string;
  type: string;
  timestamp: string;
}

interface StoryChapter {
  html: string;
  gliastar: string;
  article: {
    title: string;
    content: string;
  };
}

interface LoadingStateProps {
  isLoading: boolean;
  streamingContent?: any[];
}

const LoadingState: React.FC<LoadingStateProps> = ({ isLoading, streamingContent = [] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animationRef = useRef<number | null>(null);
  const objectsRef = useRef<THREE.Object3D[]>([]);
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [storyChapters, setStoryChapters] = useState<StoryChapter[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (streamingContent.length === 0) {
      setMessages([]);
      setStoryChapters([]);
      setIsCompleted(false);
      return;
    }

    const latestItem = streamingContent[streamingContent.length - 1];
    if (!latestItem || !latestItem.data) return;

    // Handle different types of content
    if (latestItem.type === "result" && latestItem.data.content && Array.isArray(latestItem.data.content.scenes)) {
      // This is the final result with story chapters
      setStoryChapters(latestItem.data.content.scenes);
      setIsCompleted(true);
    } else if (latestItem.data.content && Array.isArray(latestItem.data.content)) {
      latestItem.data.content.forEach((contentItem: any) => {
        if (contentItem.id && contentItem.content) {
          // Handle AI text streaming
          if (contentItem.type === "ai") {
            setMessages(prevMessages => {
              const existingIndex = prevMessages.findIndex(m => m.id === contentItem.id);
              
              if (existingIndex === -1) {
                return [
                  ...prevMessages,
                  {
                    id: contentItem.id,
                    content: contentItem.content,
                    type: contentItem.type,
                    timestamp: latestItem.timestamp
                  }
                ];
              } else {
                const updatedMessages = [...prevMessages];
                updatedMessages[existingIndex] = {
                  ...updatedMessages[existingIndex],
                  content: contentItem.content,
                  timestamp: latestItem.timestamp
                };
                return updatedMessages;
              }
            });
          }
          // Handle result type with scenes
          else if (contentItem.type === "result" && contentItem.content && contentItem.content.scenes) {
            setStoryChapters(contentItem.content.scenes);
            setIsCompleted(true);
          }
        }
      });
    }
  }, [streamingContent]);

  useEffect(() => {
    if (!containerRef.current) return;

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

    const objects: THREE.Object3D[] = [];
    objectsRef.current = objects;

    const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      transparent: true,
      opacity: 0.7,
    });

    for (let i = 0; i < 30; i++) {
      const mesh = new THREE.Mesh(particleGeometry, particleMaterial);
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 2 + Math.random() * 3;
      
      mesh.position.x = radius * Math.sin(phi) * Math.cos(theta);
      mesh.position.y = radius * Math.sin(phi) * Math.sin(theta);
      mesh.position.z = radius * Math.cos(phi);
      
      mesh.userData.initialX = mesh.position.x;
      mesh.userData.initialY = mesh.position.y;
      mesh.userData.initialZ = mesh.position.z;
      
      mesh.userData.speed = 0.2 + Math.random() * 0.3;
      mesh.userData.movementRadius = 0.2 + Math.random() * 0.3;
      
      scene.add(mesh);
      objects.push(mesh);
    }

    const bookGeometry = new THREE.BoxGeometry(1.2, 1.6, 0.2);
    const bookMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.3,
      metalness: 0.2,
    });
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    scene.add(book);
    objects.push(book);

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7);
    scene.add(directionalLight);

    const animate = () => {
      if (!isLoading) return;

      objects.forEach((obj, index) => {
        if (obj.type === 'Mesh') {
          if (index < 30) {
            const time = Date.now() * 0.001;
            const speed = obj.userData.speed;
            const radius = obj.userData.movementRadius;
            
            obj.position.x = obj.userData.initialX + Math.sin(time * speed) * radius;
            obj.position.y = obj.userData.initialY + Math.cos(time * speed) * radius;
            obj.position.z = obj.userData.initialZ + Math.sin(time * speed * 0.5) * radius;
          } else if (obj === book) {
            obj.rotation.y += 0.005;
            obj.position.y = Math.sin(Date.now() * 0.001) * 0.1;
          } else {
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

    animate();

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
      <div className="absolute bottom-20 left-0 right-0 text-center space-y-4 px-4">
        {isCompleted && storyChapters.length > 0 ? (
          <div className="bg-black/80 backdrop-blur-md p-6 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Storybook is Ready!</h2>
            <p className="text-white/90 mb-6">Explore your interactive storybook with three chapters:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {storyChapters.map((chapter, index) => (
                <Link 
                  key={index} 
                  to={`/story/${index + 1}`} 
                  className="bg-white/10 hover:bg-white/20 transition-colors rounded-lg p-4 text-white flex flex-col items-center"
                >
                  <Book className="h-10 w-10 mb-2 text-primary" />
                  <h3 className="font-medium text-sm text-center">{chapter.article.title}</h3>
                  <div className="mt-3 flex items-center text-xs text-white/70">
                    <span>Read Chapter {index + 1}</span>
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 text-white/70 text-sm">
              Click on any chapter to start reading
            </div>
          </div>
        ) : (
          <>
            <div className="text-2xl font-light tracking-tight text-primary animate-pulse-soft">
              Creating your storybook...
            </div>
            <div className="text-sm text-muted-foreground max-w-xs mx-auto mb-4">
              Crafting an interactive experience just for you
            </div>
            
            {messages.length > 0 && (
              <div className="bg-black/40 backdrop-blur-sm p-4 rounded-lg max-w-lg mx-auto">
                <ScrollArea className="h-32 w-full">
                  <div className="space-y-2 text-left font-mono text-xs text-white/90">
                    {messages.map((message) => (
                      <div key={message.id} className="pb-2">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingState;
