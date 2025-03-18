
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Story } from '@/types/story';

interface BuildingsVisualizationProps {
  story: Story | null;
}

const BuildingsVisualization: React.FC<BuildingsVisualizationProps> = ({ story }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const buildingsRef = useRef<THREE.Group | null>(null);
  const scrollY = useRef(0);
  
  // Initialize the 3D scene
  useEffect(() => {
    if (!containerRef.current || !story) return;
    
    console.log("Creating buildings visualization");
    
    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add fog for atmosphere
    scene.fog = new THREE.Fog(0xf1f0fb, 20, 100);
    scene.background = new THREE.Color(0xf1f0fb);
    
    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      45, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 30, 80);
    camera.lookAt(0, 30, 0);
    cameraRef.current = camera;
    
    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true 
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    scene.add(directionalLight);
    
    // Ground plane
    const groundGeometry = new THREE.PlaneGeometry(500, 500);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xc8c8c9, 
      roughness: 0.8, 
      metalness: 0.2 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Grid helper
    const gridHelper = new THREE.GridHelper(500, 50, 0x8e9196, 0x8a898c);
    scene.add(gridHelper);
    
    // Create the buildings group
    const buildingsGroup = new THREE.Group();
    buildingsRef.current = buildingsGroup;
    scene.add(buildingsGroup);
    
    // Create buildings
    createBuildings();
    
    // Animation loop
    const animate = () => {
      if (!containerRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      requestAnimationFrame(animate);
      
      // Camera movement based on scroll
      if (buildingsRef.current) {
        // Rotate camera around building group based on scroll position
        const targetAngle = scrollY.current * 0.003;
        const cameraRadius = 80;
        const cameraHeight = 30 + scrollY.current * 0.05;
        const cameraY = Math.min(80, Math.max(30, cameraHeight));
        
        cameraRef.current.position.x = Math.sin(targetAngle) * cameraRadius;
        cameraRef.current.position.z = Math.cos(targetAngle) * cameraRadius;
        cameraRef.current.position.y = cameraY;
        cameraRef.current.lookAt(0, 30, 0);
      }
      
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };
    
    animate();
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    // Handle scroll for camera animation
    const handleScroll = () => {
      scrollY.current = window.scrollY;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup
    return () => {
      console.log("Cleaning up buildings visualization");
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      
      if (rendererRef.current && containerRef.current.contains(rendererRef.current.domElement)) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
    };
  }, [story]);
  
  // Function to create buildings based on data
  const createBuildings = () => {
    if (!buildingsRef.current) return;
    
    // Clear existing buildings
    while (buildingsRef.current.children.length > 0) {
      buildingsRef.current.remove(buildingsRef.current.children[0]);
    }
    
    // Top 10 tallest buildings data (name, height in meters)
    const tallestBuildings = [
      { name: "Burj Khalifa", height: 828, location: "Dubai, UAE", color: 0x33C3F0 },
      { name: "Merdeka 118", height: 679, location: "Kuala Lumpur, Malaysia", color: 0x8E9196 },
      { name: "Shanghai Tower", height: 632, location: "Shanghai, China", color: 0x9F9EA1 },
      { name: "Abraj Al-Bait Clock Tower", height: 601, location: "Mecca, Saudi Arabia", color: 0xC8C8C9 },
      { name: "Ping An Finance Center", height: 599, location: "Shenzhen, China", color: 0x33C3F0 },
      { name: "Lotte World Tower", height: 555, location: "Seoul, South Korea", color: 0x8E9196 },
      { name: "One World Trade Center", height: 541, location: "New York City, USA", color: 0x9F9EA1 },
      { name: "Guangzhou CTF Finance Centre", height: 530, location: "Guangzhou, China", color: 0xC8C8C9 },
      { name: "Tianjin CTF Finance Centre", height: 530, location: "Tianjin, China", color: 0x33C3F0 },
      { name: "CITIC Tower", height: 528, location: "Beijing, China", color: 0x8E9196 }
    ];
    
    // Create building meshes with scaled heights
    const scaleFactor = 0.1; // Scale down heights to fit scene
    const spacing = 15; // Space between buildings
    const startX = -spacing * (tallestBuildings.length - 1) / 2;
    
    tallestBuildings.forEach((building, index) => {
      // Create building geometry
      const scaledHeight = building.height * scaleFactor;
      const width = 5;
      const depth = 5;
      
      // Create a detailed building
      const buildingGroup = new THREE.Group();
      
      // Main tower
      const towerGeometry = new THREE.BoxGeometry(width, scaledHeight, depth);
      const towerMaterial = new THREE.MeshStandardMaterial({ 
        color: building.color,
        metalness: 0.7,
        roughness: 0.3,
        emissive: new THREE.Color(building.color).multiplyScalar(0.1)
      });
      const tower = new THREE.Mesh(towerGeometry, towerMaterial);
      tower.position.y = scaledHeight / 2;
      tower.castShadow = true;
      buildingGroup.add(tower);
      
      // Top section for some buildings
      if (index % 3 === 0) {
        const topGeometry = new THREE.CylinderGeometry(width/3, width/2, scaledHeight/10, 8);
        const topMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x403E43,
          metalness: 0.8,
          roughness: 0.2
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = scaledHeight + (scaledHeight/20);
        top.castShadow = true;
        buildingGroup.add(top);
      }
      
      // Add windows
      const windowSize = 0.5;
      const windowGap = 2;
      const windowsPerSide = Math.floor(scaledHeight / windowGap) - 2;
      
      const windowGeometry = new THREE.BoxGeometry(windowSize, windowSize, 0.2);
      const windowMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffff,
        emissive: 0xcccccc,
        emissiveIntensity: 0.5
      });
      
      // Add windows on sides
      for (let side = 0; side < 4; side++) {
        for (let i = 0; i < windowsPerSide; i++) {
          const windowObj = new THREE.Mesh(windowGeometry, windowMaterial);
          const yPos = (i + 1) * windowGap;
          
          switch(side) {
            case 0: // Front
              windowObj.position.set(width/4, yPos, depth/2 + 0.1);
              break;
            case 1: // Right
              windowObj.position.set(width/2 + 0.1, yPos, depth/4);
              windowObj.rotation.y = Math.PI/2;
              break;
            case 2: // Back
              windowObj.position.set(-width/4, yPos, -depth/2 - 0.1);
              windowObj.rotation.y = Math.PI;
              break;
            case 3: // Left
              windowObj.position.set(-width/2 - 0.1, yPos, -depth/4);
              windowObj.rotation.y = -Math.PI/2;
              break;
          }
          
          buildingGroup.add(windowObj);
        }
      }
      
      // Position the building group
      buildingGroup.position.x = startX + index * spacing;
      buildingGroup.position.z = 0;
      
      // Create a text label for each building
      const nameDiv = document.createElement('div');
      nameDiv.className = 'building-label';
      nameDiv.textContent = `${building.name} (${building.height}m)`;
      nameDiv.style.position = 'absolute';
      nameDiv.style.color = '#fff';
      nameDiv.style.padding = '4px 8px';
      nameDiv.style.background = 'rgba(0,0,0,0.7)';
      nameDiv.style.borderRadius = '4px';
      nameDiv.style.fontSize = '12px';
      nameDiv.style.fontWeight = 'bold';
      nameDiv.style.pointerEvents = 'none';
      nameDiv.style.transform = 'translate(-50%, -100%)';
      
      // Add to building group
      buildingsRef.current.add(buildingGroup);
    });
  };
  
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full absolute top-0 left-0"
      style={{ zIndex: 0 }}
    />
  );
};

export default BuildingsVisualization;
