
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
      data: {
        content_copy: "Throughout human history, we've constantly pushed the boundaries of what's possible in architecture and engineering, creating ever taller structures that reach for the sky. These massive skyscrapers stand as monuments to human ingenuity and technological advancement.",
        threejs_code: `
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
      }
    },
    {
      id: "top-ten-overview",
      title: "Top 10 Tallest Buildings Visualization",
      description: "A visual comparison of the world's ten tallest buildings, arranged from tallest to shortest. This visualization helps you appreciate the incredible scale of these architectural achievements.",
      data: {
        content_copy: "The world's tallest buildings represent extraordinary feats of engineering and human ambition. These skyscrapers push the boundaries of what's possible, creating iconic silhouettes on city skylines around the globe. The following visualization showcases the top 10 tallest buildings in the world, arranged by height, allowing you to compare their impressive scales.",
        threejs_code: `
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0xf8fafc);
          
          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.z = 25;
          
          // Define all 10 tallest buildings with their heights
          const buildings = [
            { name: "Burj Khalifa", height: 828, location: "Dubai, UAE", color: 0x3b82f6 },
            { name: "Merdeka 118", height: 679, location: "Kuala Lumpur, Malaysia", color: 0x10b981 },
            { name: "Shanghai Tower", height: 632, location: "Shanghai, China", color: 0xef4444 },
            { name: "Abraj Al-Bait Clock Tower", height: 601, location: "Mecca, Saudi Arabia", color: 0xf59e0b },
            { name: "Ping An Finance Center", height: 599, location: "Shenzhen, China", color: 0x8b5cf6 },
            { name: "Lotte World Tower", height: 555, location: "Seoul, South Korea", color: 0xec4899 },
            { name: "One World Trade Center", height: 541, location: "New York City, USA", color: 0x0ea5e9 },
            { name: "Guangzhou CTF Finance Centre", height: 530, location: "Guangzhou, China", color: 0xd946ef },
            { name: "Tianjin CTF Finance Centre", height: 530, location: "Tianjin, China", color: 0x14b8a6 },
            { name: "CITIC Tower", height: 528, location: "Beijing, China", color: 0xf43f5e }
          ];
          
          const buildingGroup = new THREE.Group();
          scene.add(buildingGroup);
          
          // Scale and spacing constants
          const HEIGHT_SCALE = 0.02;  // Scale down the heights for visualization
          const SPACING = 3;          // Distance between buildings
          const BASE_WIDTH = 0.8;     // Base width for buildings
          
          // Create all buildings with height indicators
          buildings.forEach((building, index) => {
            // Calculate scaled height
            const scaledHeight = building.height * HEIGHT_SCALE;
            
            // Create building mesh
            const buildingGeometry = new THREE.BoxGeometry(BASE_WIDTH, scaledHeight, BASE_WIDTH);
            const buildingMaterial = new THREE.MeshStandardMaterial({ 
              color: building.color,
              metalness: 0.4,
              roughness: 0.6
            });
            
            const buildingMesh = new THREE.Mesh(buildingGeometry, buildingMaterial);
            
            // Position the building
            buildingMesh.position.x = index * SPACING - (buildings.length * SPACING / 2) + SPACING/2;
            buildingMesh.position.y = scaledHeight / 2;
            
            buildingGroup.add(buildingMesh);
            
            // Create height indicator line and label
            const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
            const lineGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(buildingMesh.position.x + BASE_WIDTH/2 + 0.1, 0, 0),
              new THREE.Vector3(buildingMesh.position.x + BASE_WIDTH/2 + 0.1, scaledHeight, 0)
            ]);
            
            const heightLine = new THREE.Line(lineGeometry, lineMaterial);
            buildingGroup.add(heightLine);
            
            // Create horizontal tick marks every 200m
            for (let h = 0; h <= building.height; h += 200) {
              if (h === 0) continue; // Skip the ground level
              
              const tickGeometry = new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(buildingMesh.position.x + BASE_WIDTH/2 + 0.1, h * HEIGHT_SCALE, 0),
                new THREE.Vector3(buildingMesh.position.x + BASE_WIDTH/2 + 0.4, h * HEIGHT_SCALE, 0)
              ]);
              
              const tickLine = new THREE.Line(tickGeometry, lineMaterial);
              buildingGroup.add(tickLine);
            }
            
            // Create text label canvas
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 256;
            canvas.height = 128;
            
            // Fill background
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            // Add text
            context.font = 'bold 24px Arial';
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.fillText(building.name, canvas.width/2, 30);
            
            context.font = '20px Arial';
            context.fillText(building.height + ' m', canvas.width/2, 60);
            
            context.font = '16px Arial';
            context.fillText(building.location, canvas.width/2, 90);
            
            // Create texture and sprite
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const sprite = new THREE.Sprite(labelMaterial);
            
            // Position the label
            sprite.position.set(buildingMesh.position.x, scaledHeight + 1.5, 0);
            sprite.scale.set(3, 1.5, 1);
            buildingGroup.add(sprite);
          });
          
          // Add a horizontal ground plane
          const groundGeometry = new THREE.PlaneGeometry(50, 20);
          const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xcccccc, 
            roughness: 0.8,
            metalness: 0.2
          });
          const ground = new THREE.Mesh(groundGeometry, groundMaterial);
          ground.rotation.x = -Math.PI / 2;
          ground.position.y = -0.1;
          scene.add(ground);
          
          // Add grid helper
          const gridHelper = new THREE.GridHelper(50, 50, 0x888888, 0x444444);
          scene.add(gridHelper);
          
          // Add lighting
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);
          
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(10, 20, 15);
          directionalLight.castShadow = true;
          scene.add(directionalLight);
          
          // Add orbit controls for interactivity
          let isDragging = false;
          let prevMouseX = 0;
          let prevMouseY = 0;
          
          canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
          });
          
          canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - prevMouseX;
            const deltaY = e.clientY - prevMouseY;
            
            buildingGroup.rotation.y += deltaX * 0.01;
            buildingGroup.rotation.x += deltaY * 0.01;
            
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
          });
          
          window.addEventListener('mouseup', () => {
            isDragging = false;
          });
          
          // Add mouse wheel zoom
          canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            camera.position.z += e.deltaY * 0.01;
            camera.position.z = Math.max(5, Math.min(40, camera.position.z));
          });
          
          // Auto-rotate when not interacting
          let autoRotate = true;
          let lastInteractionTime = Date.now();
          
          canvas.addEventListener('mousedown', () => {
            autoRotate = false;
            lastInteractionTime = Date.now();
          });
          
          // Resume auto-rotation after 5 seconds of inactivity
          setInterval(() => {
            if (!isDragging && Date.now() - lastInteractionTime > 5000) {
              autoRotate = true;
            }
          }, 1000);
          
          // Animation loop
          function animate() {
            requestAnimationFrame(animate);
            
            if (autoRotate) {
              buildingGroup.rotation.y += 0.002;
            }
            
            renderer.render(scene, camera);
          }
          
          animate();
        `
      }
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
        imageUrl: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c",
        content_copy: "The Burj Khalifa stands as an engineering marvel in the heart of Dubai. At 828 meters (2,717 feet), it has dominated the global skyline since its completion in 2010. The neo-futurist design by Adrian Smith features a Y-shaped floor plan that maximizes views of the Persian Gulf. With 163 floors, it houses residences, offices, and the Armani Hotel. The building's design was inspired by the Hymenocallis flower, and its construction required innovative engineering solutions to withstand desert conditions and high winds.",
        threejs_code: `
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
      }
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
        imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93",
        content_copy: "Merdeka 118, completed in 2022, is Malaysia's crown jewel of architecture, standing at an impressive 679 meters (2,227 feet). With 118 floors, it's the second tallest building in the world. The stunning design features a faceted glass facade inspired by traditional Malaysian patterns and motifs, particularly the iconic silhouette of Malaysia's first prime minister raising his hand during the declaration of independence. The building includes office space, luxury residences, and a Park Hyatt hotel. The tower's completion marks a significant milestone in Malaysia's architectural history and skyline."
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
        imageUrl: "https://images.unsplash.com/photo-1583195764036-6dc248ac07d9",
        content_copy: "The Shanghai Tower, completed in 2015, is a marvel of sustainable design and engineering. Rising 632 meters (2,073 feet) above Shanghai's Pudong district, it's the world's third tallest building and China's tallest structure. Its most distinctive feature is the twisting, spiral form that rotates 120 degrees from base to top, which reduces wind loads on the building by 24%. The innovative double-skin façade creates nine vertical zones each with their own atria, sky gardens, and public spaces. This design not only serves as a buffer against external temperature extremes but also creates natural ventilation for the building."
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
        imageUrl: "https://images.unsplash.com/photo-1575728252813-43a527978348",
        content_copy: "The Abraj Al-Bait Clock Tower, also known as the Makkah Royal Clock Tower, is an iconic landmark in the holy city of Mecca. Standing at 601 meters (1,972 feet) tall with 120 floors, it was completed in 2012 as part of the King Abdulaziz Endowment Project. The building's most distinctive feature is its massive clock face—the largest in the world at 43 meters in diameter—visible from up to 30 kilometers away. The tower's strategic location adjacent to the Great Mosque of Mecca makes it a significant part of the city's skyline and a useful orientation point for millions of pilgrims who visit annually for Hajj and Umrah."
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
        imageUrl: "https://images.unsplash.com/photo-1583507171283-4d6eaec0b7ab",
        content_copy: "The Ping An Finance Center in Shenzhen, China stands as a gleaming sentinel in one of the world's fastest-growing metropolises. Completed in 2017, this 599-meter (1,965-foot) skyscraper features 115 floors of office and retail space, serving as the headquarters for Ping An Insurance. The building's streamlined form tapers as it rises, crowned with a diamond-shaped top. Its exterior is clad in 1,700 tons of 316L stainless steel, chosen specifically for its corrosion resistance in Shenzhen's coastal environment. The building boasts one of the world's highest observation decks at 550 meters, offering breathtaking panoramic views of the city and surrounding areas."
      }
    },
    {
      id: "lotte-world-tower",
      title: "6. Lotte World Tower",
      description: "Located in Seoul, South Korea, the Lotte World Tower stands at 555 meters (1,821 feet) tall with 123 floors. Completed in 2017, it features a sleek, tapered design inspired by traditional Korean art forms.",
      data: {
        height: 555,
        floors: 123,
        completionYear: 2017,
        location: "Seoul, South Korea",
        imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f",
        content_copy: "The Lotte World Tower dominates Seoul's skyline at 555 meters (1,821 feet), making it the tallest building in South Korea and the sixth tallest in the world. Completed in 2017 after 13 years of planning and construction, this 123-floor skyscraper draws inspiration from traditional Korean ceramics, porcelain, and calligraphy. The building's sleek, tapered silhouette transitions from a square base to a circle at its summit, symbolizing the ancient Korean philosophy of the circle and square. The tower houses offices, a luxury hotel, residences, and the world's highest glass-bottomed observation deck at 500 meters, known as the Seoul Sky."
      }
    },
    {
      id: "one-world-trade",
      title: "7. One World Trade Center",
      description: "Standing at 541 meters (1,776 feet), One World Trade Center in New York City symbolizes American resilience. Completed in 2014, its height in feet represents the year of American independence, and its design includes a square base with the same footprint as the original Twin Towers.",
      data: {
        height: 541,
        floors: 104,
        completionYear: 2014,
        location: "New York City, USA",
        imageUrl: "https://images.unsplash.com/photo-1582439170934-d2474d9dce10",
        content_copy: "One World Trade Center stands as a symbol of American resilience and renewal at the site of the September 11 attacks. Rising to a symbolic height of 1,776 feet (541 meters)—referencing the year of American independence—it is the tallest building in the Western Hemisphere. Completed in 2014, the 104-story skyscraper features a prismatic design with eight isosceles triangles forming a perfect octagon at its center. The tower's base is a 200-foot square, reflecting the exact footprint of the original Twin Towers. Sustainable features include rainwater collection, LED lights, and renewable energy sources. The building houses offices, an observation deck called One World Observatory, and serves as a powerful memorial to those lost in 2001."
      }
    },
    {
      id: "guangzhou-ctf",
      title: "8. Guangzhou CTF Finance Centre",
      description: "The Guangzhou CTF Finance Centre reaches 530 meters (1,739 feet) and was completed in 2016. This 111-floor skyscraper in Guangzhou, China features a multi-use design with offices, a hotel, and residential apartments.",
      data: {
        height: 530,
        floors: 111,
        completionYear: 2016,
        location: "Guangzhou, China",
        imageUrl: "https://images.unsplash.com/photo-1522547902298-51566e4fb383",
        content_copy: "The Guangzhou CTF Finance Centre (also known as Guangzhou Chow Tai Fook Finance Centre) is an architectural marvel rising 530 meters (1,739 feet) in Guangzhou's Tianhe District. Completed in 2016, this elegant 111-floor mixed-use skyscraper was designed by Kohn Pedersen Fox. Its sleek, sculpted form tapers at the top and features a series of setbacks that accommodate mechanical floors, refuge floors, and sky terraces. The building houses Grade A offices, a luxury hotel, serviced apartments, and a shopping mall. The tower's efficient design incorporates advanced techniques to withstand the region's typhoons, and its exterior features a rippling facade inspired by traditional Chinese jade artifacts."
      }
    },
    {
      id: "tianjin-ctf",
      title: "9. Tianjin CTF Finance Centre",
      description: "The Tianjin CTF Finance Centre in Tianjin, China stands at 530 meters (1,739 feet) tall with 97 floors. Completed in 2019, it shares the same height as the Guangzhou CTF Finance Centre but has fewer floors due to different floor height requirements.",
      data: {
        height: 530,
        floors: 97,
        completionYear: 2019,
        location: "Tianjin, China",
        imageUrl: "https://images.unsplash.com/photo-1577138043155-7934dd897f2c",
        content_copy: "The Tianjin CTF Finance Centre, completed in 2019, rises to an impressive 530 meters (1,739 feet) in Tianjin's Binhai New Area. Designed by Skidmore, Owings & Merrill, this 97-floor skyscraper shares the exact same height as the Guangzhou CTF Finance Centre but has fewer floors due to different ceiling height requirements. The building's curved, tapering form minimizes the impact of wind vortices, and its eight gently curved megacolumns enhance both its structural efficiency and aesthetic appeal. The tower accommodates offices, serviced apartments, and a five-star hotel. Despite its massive size, its elegant proportions and soft corners create a surprisingly graceful addition to Tianjin's skyline."
      }
    },
    {
      id: "citic-tower",
      title: "10. CITIC Tower",
      description: "Also known as China Zun, the CITIC Tower in Beijing, China reaches 528 meters (1,732 feet) tall. Completed in 2018, its 109 floors mainly serve as office space, and its unique form was inspired by an ancient Chinese ritual vessel called a 'zun'.",
      data: {
        height: 528,
        floors: 109,
        completionYear: 2018,
        location: "Beijing, China",
        imageUrl: "https://images.unsplash.com/photo-1609593435912-81a0d0adb8a8",
        content_copy: "The CITIC Tower, commonly known as China Zun, stands as the tallest building in Beijing at 528 meters (1,732 feet). Completed in 2018, this 109-floor skyscraper serves as the headquarters for CITIC Group. Its distinctive shape—wider at the top and bottom than in the middle—was inspired by the 'zun,' an ancient Chinese ceremonial vessel. This unique silhouette not only provides cultural significance but also offers structural advantages, creating a wider base for stability and a larger floor area at the top for premium office space. The building incorporates numerous sustainable features, including a high-performance curtain wall system with integrated vents for natural ventilation. As the centerpiece of Beijing's central business district, China Zun has become an iconic symbol of the capital's economic ambition and cultural heritage."
      }
    },
    {
      id: "conclusion",
      title: "The Future of Skyscrapers",
      description: "Engineers continue to push the boundaries of what's possible, with several ambitious projects currently in development. The Jeddah Tower in Saudi Arabia, designed to reach 1,000 meters, could become the first building to break the one-kilometer mark. As technology advances, who knows how high future generations will reach?",
      data: {
        content_copy: "The race to build ever taller has not slowed down. Engineers and architects continue to push the boundaries of what's structurally possible, with several ambitious projects currently in development. The Jeddah Tower in Saudi Arabia, previously known as Kingdom Tower, was designed to reach an unprecedented 1,000 meters, potentially becoming the first building to break the one-kilometer mark. Although its construction has faced delays, it represents humanity's ongoing ambition to reach higher.\n\nFuture skyscrapers will likely incorporate increasingly sustainable design elements, such as vertical forests, renewable energy generation, and smart building systems. Advances in materials science, including ultra-high-strength concrete and carbon fiber composites, may enable even taller structures. As cities grow denser and land becomes scarcer, the vertical expansion of urban areas through innovative skyscrapers will continue to shape our cities and symbolize human ingenuity.",
        threejs_code: `
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0xf8fafc);
          
          const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
          camera.position.z = 15;
          
          // Create future skyscraper concepts
          const buildingGroup = new THREE.Group();
          scene.add(buildingGroup);
          
          // Create Jeddah Tower concept (1000m)
          const jeddahGeometry = new THREE.ConeGeometry(2, 20, 4);
          const jeddahMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3b82f6,
            metalness: 0.7,
            roughness: 0.3,
            transparent: true,
            opacity: 0.9
          });
          const jeddahTower = new THREE.Mesh(jeddahGeometry, jeddahMaterial);
          jeddahTower.position.set(-5, 10, 0);
          buildingGroup.add(jeddahTower);
          
          // Create futuristic tower concept
          const futuristicGeometry = new THREE.CylinderGeometry(0.5, 1.5, 18, 8);
          const futuristicMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x10b981,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
          });
          const futuristicTower = new THREE.Mesh(futuristicGeometry, futuristicMaterial);
          futuristicTower.position.set(5, 9, 0);
          buildingGroup.add(futuristicTower);
          
          // Add rings around futuristic tower
          for (let i = 0; i < 5; i++) {
            const ringGeometry = new THREE.TorusGeometry(2, 0.2, 8, 24);
            const ringMaterial = new THREE.MeshStandardMaterial({ 
              color: 0xf59e0b,
              metalness: 0.9,
              roughness: 0.1
            });
            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.y = i * 4 - 6;
            ring.position.x = 5;
            ring.rotation.x = Math.PI / 2;
            buildingGroup.add(ring);
          }
          
          // Create height comparison line for Jeddah Tower
          const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
          const jeddahLineGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-8, 0, 0),
            new THREE.Vector3(-8, 20, 0)
          ]);
          const jeddahHeightLine = new THREE.Line(jeddahLineGeometry, lineMaterial);
          buildingGroup.add(jeddahHeightLine);
          
          // Add 200m markers
          for (let h = 0; h <= 1000; h += 200) {
            if (h === 0) continue; // Skip ground level
            
            const scaledHeight = h * 0.02;
            const tickGeometry = new THREE.BufferGeometry().setFromPoints([
              new THREE.Vector3(-8, scaledHeight, 0),
              new THREE.Vector3(-7.5, scaledHeight, 0)
            ]);
            const tick = new THREE.Line(tickGeometry, lineMaterial);
            buildingGroup.add(tick);
            
            // Add height text
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = 128;
            canvas.height = 64;
            
            context.fillStyle = 'rgba(255, 255, 255, 0.8)';
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            context.font = 'bold 24px Arial';
            context.fillStyle = '#000000';
            context.textAlign = 'center';
            context.fillText(h + 'm', canvas.width/2, canvas.height/2);
            
            const texture = new THREE.CanvasTexture(canvas);
            const labelMaterial = new THREE.SpriteMaterial({ map: texture });
            const label = new THREE.Sprite(labelMaterial);
            
            label.position.set(-9, scaledHeight, 0);
            label.scale.set(2, 1, 1);
            buildingGroup.add(label);
          }
          
          // Add text label for Jeddah Tower
          const jeddahCanvas = document.createElement('canvas');
          const jeddahContext = jeddahCanvas.getContext('2d');
          jeddahCanvas.width = 256;
          jeddahCanvas.height = 128;
          
          jeddahContext.fillStyle = 'rgba(255, 255, 255, 0.8)';
          jeddahContext.fillRect(0, 0, jeddahCanvas.width, jeddahCanvas.height);
          
          jeddahContext.font = 'bold 24px Arial';
          jeddahContext.fillStyle = '#000000';
          jeddahContext.textAlign = 'center';
          jeddahContext.fillText('Jeddah Tower', jeddahCanvas.width/2, 40);
          jeddahContext.font = '20px Arial';
          jeddahContext.fillText('1000m (proposed)', jeddahCanvas.width/2, 70);
          
          const jeddahTexture = new THREE.CanvasTexture(jeddahCanvas);
          const jeddahLabelMaterial = new THREE.SpriteMaterial({ map: jeddahTexture });
          const jeddahLabel = new THREE.Sprite(jeddahLabelMaterial);
          
          jeddahLabel.position.set(-5, 22, 0);
          jeddahLabel.scale.set(4, 2, 1);
          buildingGroup.add(jeddahLabel);
          
          // Add text label for Future Tower
          const futureCanvas = document.createElement('canvas');
          const futureContext = futureCanvas.getContext('2d');
          futureCanvas.width = 256;
          futureCanvas.height = 128;
          
          futureContext.fillStyle = 'rgba(255, 255, 255, 0.8)';
          futureContext.fillRect(0, 0, futureCanvas.width, futureCanvas.height);
          
          futureContext.font = 'bold 24px Arial';
          futureContext.fillStyle = '#000000';
          futureContext.textAlign = 'center';
          futureContext.fillText('Future Concept', futureCanvas.width/2, 40);
          futureContext.font = '20px Arial';
          futureContext.fillText('Self-sustaining tower', futureCanvas.width/2, 70);
          
          const futureTexture = new THREE.CanvasTexture(futureCanvas);
          const futureLabelMaterial = new THREE.SpriteMaterial({ map: futureTexture });
          const futureLabel = new THREE.Sprite(futureLabelMaterial);
          
          futureLabel.position.set(5, 20, 0);
          futureLabel.scale.set(4, 2, 1);
          buildingGroup.add(futureLabel);
          
          // Add lighting
          const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
          scene.add(ambientLight);
          
          const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
          directionalLight.position.set(10, 20, 15);
          scene.add(directionalLight);
          
          // Add interactive rotation
          let isDragging = false;
          let prevMouseX = 0;
          let prevMouseY = 0;
          
          canvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
          });
          
          canvas.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - prevMouseX;
            const deltaY = e.clientY - prevMouseY;
            
            buildingGroup.rotation.y += deltaX * 0.01;
            buildingGroup.rotation.x += deltaY * 0.01;
            
            prevMouseX = e.clientX;
            prevMouseY = e.clientY;
          });
          
          window.addEventListener('mouseup', () => {
            isDragging = false;
          });
          
          // Auto-rotation
          function animate() {
            requestAnimationFrame(animate);
            
            if (!isDragging) {
              buildingGroup.rotation.y += 0.002;
            }
            
            renderer.render(scene, camera);
          }
          
          animate();
        `
      },
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
