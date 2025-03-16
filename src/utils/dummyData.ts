
import { Story } from '../types/story';

// This is a dummy response for the "What are the tallest buildings in the world?" prompt
export const tallestBuildingsStory: Story = {
  id: "tallest-buildings-2023",
  title: "The World's Tallest Architectural Marvels",
  originalPrompt: "What are the tallest buildings in the world?",
  metadata: {
    createdAt: new Date().toISOString(),
    tags: ["architecture", "skyscrapers", "world-records"]
  },
  scenes: [
    {
      id: "intro",
      title: "Reaching for the Sky",
      description: "Throughout history, humans have been driven to build ever taller structures, pushing the boundaries of engineering and architecture. These massive skyscrapers represent our ambition to reach higher and our technical ability to defy gravity.",
      threeJsCode: `
        // Create a scene with rotating skyline silhouette
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;
        
        // Create stylized buildings
        const buildingGeometries = [];
        const buildingMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x3b82f6,
          transparent: true,
          opacity: 0.8,
          roughness: 0.3,
          metalness: 0.7
        });
        
        // Create building skyline
        for (let i = 0; i < 10; i++) {
          const height = 2 + Math.random() * 6;
          const width = 0.8 + Math.random() * 0.5;
          const geometry = new THREE.BoxGeometry(width, height, width);
          const building = new THREE.Mesh(geometry, buildingMaterial);
          building.position.x = i * 2 - 10;
          building.position.y = height / 2 - 3;
          scene.add(building);
          buildingGeometries.push(building);
        }
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        scene.add(directionalLight);
        
        // Animation
        function animate() {
          requestAnimationFrame(animate);
          
          // Gentle rotation of the entire scene
          scene.rotation.y += 0.003;
          
          renderer.render(scene, camera);
        }
        
        animate();
      `
    },
    {
      id: "burj-khalifa",
      title: "1. Burj Khalifa",
      description: "Standing at 828 meters (2,717 feet) tall, the Burj Khalifa in Dubai, UAE has held the title of the world's tallest building since its completion in 2010. This neo-futurist skyscraper has 163 floors and was designed by Adrian Smith of Skidmore, Owings & Merrill.",
      data: {
        height: 828,
        floors: 163,
        completionYear: 2010,
        location: "Dubai, UAE",
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c"
      },
      threeJsCode: `
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;
        
        // Create stylized Burj Khalifa
        const baseGeometry = new THREE.CylinderGeometry(1, 2, 10, 6);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x64748b,
          metalness: 0.8,
          roughness: 0.2
        });
        const building = new THREE.Mesh(baseGeometry, baseMaterial);
        scene.add(building);
        
        // Add spire
        const spireGeometry = new THREE.ConeGeometry(0.2, 3, 8);
        const spireMaterial = new THREE.MeshStandardMaterial({ 
          color: 0x94a3b8,
          metalness: 0.9,
          roughness: 0.1
        });
        const spire = new THREE.Mesh(spireGeometry, spireMaterial);
        spire.position.y = 6.5;
        scene.add(spire);
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        scene.add(directionalLight);
        
        // Animation
        function animate() {
          requestAnimationFrame(animate);
          
          building.rotation.y += 0.005;
          spire.rotation.y += 0.005;
          
          renderer.render(scene, camera);
        }
        
        animate();
      `
    },
    {
      id: "merdeka-118",
      title: "2. Merdeka 118",
      description: "Completed in 2022, Merdeka 118 in Kuala Lumpur, Malaysia stands at 679 meters (2,227 feet) tall. With 118 floors, it's currently the second tallest building in the world and features a distinctive spire-topped design inspired by traditional Malaysian patterns.",
      data: {
        height: 679,
        floors: 118,
        completionYear: 2022,
        location: "Kuala Lumpur, Malaysia",
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93"
      }
    },
    {
      id: "shanghai-tower",
      title: "3. Shanghai Tower",
      description: "The Shanghai Tower reaches 632 meters (2,073 feet) into the sky above Shanghai, China. Completed in 2015, this 128-floor building features a unique twisted design that reduces wind loads on the building by 24%. The exterior features a double-skin façade that creates an atrium housing gardens and public spaces.",
      data: {
        height: 632,
        floors: 128,
        completionYear: 2015,
        location: "Shanghai, China",
        imageUrl: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9"
      }
    },
    {
      id: "abraj-al-bait",
      title: "4. Abraj Al-Bait Clock Tower",
      description: "Also known as the Makkah Royal Clock Tower, this building in Mecca, Saudi Arabia stands at 601 meters (1,972 feet). Completed in 2012, it's notable for housing the world's largest clock face and being located adjacent to the Great Mosque of Mecca.",
      data: {
        height: 601,
        floors: 120,
        completionYear: 2012,
        location: "Mecca, Saudi Arabia",
        imageUrl: "https://images.unsplash.com/photo-1575728252813-43a527978348"
      }
    },
    {
      id: "ping-an",
      title: "5. Ping An Finance Center",
      description: "Located in Shenzhen, China, the Ping An Finance Center reaches 599 meters (1,965 feet). Completed in 2017, this 115-floor skyscraper features a streamlined form clad in stainless steel and has one of the highest observation decks in the world.",
      data: {
        height: 599,
        floors: 115,
        completionYear: 2017,
        location: "Shenzhen, China",
        imageUrl: "https://images.unsplash.com/photo-1583507171283-4d6eaec0b7ab"
      },
      threeJsCode: `
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf8fafc);
        
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15;
        
        // Create a height comparison chart for the top 5 buildings
        const buildings = [
          { name: "Burj Khalifa", height: 828, color: 0x3b82f6 },
          { name: "Merdeka 118", height: 679, color: 0x10b981 },
          { name: "Shanghai Tower", height: 632, color: 0xef4444 },
          { name: "Abraj Al-Bait", height: 601, color: 0xf59e0b },
          { name: "Ping An", height: 599, color: 0x8b5cf6 }
        ];
        
        const group = new THREE.Group();
        scene.add(group);
        
        // Scale factor for visualization
        const scale = 0.01;
        const spacing = 3;
        
        buildings.forEach((building, index) => {
          const height = building.height * scale;
          const geometry = new THREE.BoxGeometry(1, height, 1);
          const material = new THREE.MeshStandardMaterial({ 
            color: building.color,
            metalness: 0.5,
            roughness: 0.5
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          mesh.position.x = (index - 2) * spacing;
          mesh.position.y = height / 2 - 3;
          
          group.add(mesh);
          
          // Add height label
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.width = 128;
          canvas.height = 64;
          context.fillStyle = '#ffffff';
          context.fillRect(0, 0, canvas.width, canvas.height);
          context.font = '24px Arial';
          context.fillStyle = '#000000';
          context.textAlign = 'center';
          context.fillText(building.height + 'm', canvas.width/2, canvas.height/2);
          
          const texture = new THREE.CanvasTexture(canvas);
          const labelMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true
          });
          
          const labelGeometry = new THREE.PlaneGeometry(2, 1);
          const label = new THREE.Mesh(labelGeometry, labelMaterial);
          label.position.y = height + 0.5;
          label.position.x = (index - 2) * spacing;
          label.rotation.x = -Math.PI / 4;
          
          group.add(label);
        });
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 15);
        scene.add(directionalLight);
        
        // Animation
        function animate() {
          requestAnimationFrame(animate);
          
          group.rotation.y = Math.sin(Date.now() * 0.001) * 0.2;
          
          renderer.render(scene, camera);
        }
        
        animate();
      `
    },
    // Additional buildings 6-10 would be added here, following the same pattern
    {
      id: "conclusion",
      title: "The Future of Skyscrapers",
      description: "Engineers continue to push the boundaries of what's possible, with several ambitious projects currently in development. The Jeddah Tower in Saudi Arabia, designed to reach 1,000 meters, could become the first building to break the one-kilometer mark. As technology advances, who knows how high future generations will reach?",
      interactiveElements: [
        {
          type: "button",
          id: "restart-tour",
          label: "Restart Tour",
          action: "restartTour"
        },
        {
          type: "button",
          id: "new-prompt",
          label: "Ask a New Question",
          action: "newPrompt"
        }
      ]
    }
  ]
};
