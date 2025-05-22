import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const MinecraftGame = () => {
  const mountRef = useRef(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });
  const [blockCount, setBlockCount] = useState(0);
  const [selectedBlock, setSelectedBlock] = useState('grass');
  
  // Game state refs
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const worldRef = useRef({});
  const playerRef = useRef({ x: 0, y: 10, z: 0, vx: 0, vy: 0, vz: 0 });
  const keysRef = useRef({});
  const mouseRef = useRef({ x: 0, y: 0, sensitivity: 0.002 });
  const isPointerLockedRef = useRef(false);
  const raycasterRef = useRef(new THREE.Raycaster());
  const animationIdRef = useRef();

  const BLOCK_SIZE = 1;
  const WORLD_SIZE = 32;
  const WORLD_HEIGHT = 16;

  // Block materials
  const materials = {
    grass: new THREE.MeshLambertMaterial({ color: 0x4CAF50 }),
    dirt: new THREE.MeshLambertMaterial({ color: 0x8B4513 }),
    stone: new THREE.MeshLambertMaterial({ color: 0x808080 }),
    wood: new THREE.MeshLambertMaterial({ color: 0xDEB887 }),
    leaves: new THREE.MeshLambertMaterial({ color: 0x228B22 }),
    sand: new THREE.MeshLambertMaterial({ color: 0xF4A460 })
  };

  const blockTypes = ['grass', 'dirt', 'stone', 'wood', 'leaves', 'sand'];

  const initGame = () => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(playerRef.current.x, playerRef.current.y + 1.6, playerRef.current.z);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(50, 100, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.shadow.camera.left = -100;
    directionalLight.shadow.camera.right = 100;
    directionalLight.shadow.camera.top = 100;
    directionalLight.shadow.camera.bottom = -100;
    scene.add(directionalLight);

    generateWorld();
    setupControls();
    animate();
  };

  const generateWorld = () => {
    const world = worldRef.current;
    const scene = sceneRef.current;
    
    for (let x = -WORLD_SIZE/2; x < WORLD_SIZE/2; x++) {
      for (let z = -WORLD_SIZE/2; z < WORLD_SIZE/2; z++) {
        const height = Math.floor(Math.random() * 4) + 4;
        
        for (let y = 0; y < height; y++) {
          let blockType = 'stone';
          if (y === height - 1) blockType = 'grass';
          else if (y >= height - 3) blockType = 'dirt';
          
          createBlock(x, y, z, blockType);
        }
        
        if (Math.random() < 0.05) {
          generateTree(x, height, z);
        }
      }
    }
    
    setBlockCount(Object.keys(world).length);
  };

  const generateTree = (x, y, z) => {
    for (let i = 0; i < 4; i++) {
      createBlock(x, y + i, z, 'wood');
    }
    
    for (let dx = -2; dx <= 2; dx++) {
      for (let dz = -2; dz <= 2; dz++) {
        for (let dy = 0; dy < 3; dy++) {
          if (Math.abs(dx) + Math.abs(dz) + dy < 4) {
            createBlock(x + dx, y + 3 + dy, z + dz, 'leaves');
          }
        }
      }
    }
  };

  const createBlock = (x, y, z, type) => {
    const geometry = new THREE.BoxGeometry(BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    const mesh = new THREE.Mesh(geometry, materials[type]);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { x, y, z, type };
    
    sceneRef.current.add(mesh);
    
    const key = `${x},${y},${z}`;
    worldRef.current[key] = mesh;
  };

  const removeBlock = (x, y, z) => {
    const key = `${x},${y},${z}`;
    const world = worldRef.current;
    
    if (world[key]) {
      sceneRef.current.remove(world[key]);
      delete world[key];
      setBlockCount(Object.keys(world).length);
    }
  };

  const setupControls = () => {
    const handleKeyDown = (e) => {
      keysRef.current[e.code] = true;
      
      if (e.code >= 'Digit1' && e.code <= 'Digit6') {
        const index = parseInt(e.code.slice(-1)) - 1;
        if (blockTypes[index]) {
          setSelectedBlock(blockTypes[index]);
        }
      }
    };

    const handleKeyUp = (e) => {
      keysRef.current[e.code] = false;
    };

    const handleClick = () => {
      if (!isPointerLockedRef.current && rendererRef.current) {
        rendererRef.current.domElement.requestPointerLock();
      }
    };

    const handlePointerLockChange = () => {
      isPointerLockedRef.current = document.pointerLockElement === rendererRef.current?.domElement;
    };

    const handleMouseMove = (e) => {
      if (isPointerLockedRef.current) {
        const mouse = mouseRef.current;
        mouse.x += e.movementX * mouse.sensitivity;
        mouse.y += e.movementY * mouse.sensitivity;
        mouse.y = Math.max(-Math.PI/2, Math.min(Math.PI/2, mouse.y));
      }
    };

    const handleMouseDown = (e) => {
      if (isPointerLockedRef.current) {
        if (e.button === 0) {
          castRay(true);
        } else if (e.button === 2) {
          castRay(false);
        }
      }
    };

    const handleContextMenu = (e) => e.preventDefault();

    const handleResize = () => {
      if (cameraRef.current && rendererRef.current) {
        cameraRef.current.aspect = window.innerWidth / window.innerHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('click', handleClick);
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('resize', handleResize);
    };
  };

  const castRay = (remove = true) => {
    const raycaster = raycasterRef.current;
    const camera = cameraRef.current;
    const scene = sceneRef.current;
    
    raycaster.setFromCamera({ x: 0, y: 0 }, camera);
    const intersects = raycaster.intersectObjects(scene.children.filter(obj => obj.userData.x !== undefined));
    
    if (intersects.length > 0) {
      const intersect = intersects[0];
      const block = intersect.object.userData;
      
      if (remove) {
        removeBlock(block.x, block.y, block.z);
      } else {
        const normal = intersect.face.normal;
        const newX = block.x + Math.round(normal.x);
        const newY = block.y + Math.round(normal.y);
        const newZ = block.z + Math.round(normal.z);
        
        const key = `${newX},${newY},${newZ}`;
        const player = playerRef.current;
        const playerDistance = Math.sqrt(
          Math.pow(newX - player.x, 2) +
          Math.pow(newY - (player.y + 0.8), 2) +
          Math.pow(newZ - player.z, 2)
        );
        
        if (!worldRef.current[key] && playerDistance > 1.5) {
          createBlock(newX, newY, newZ, selectedBlock);
          setBlockCount(Object.keys(worldRef.current).length);
        }
      }
    }
  };

  const updatePlayer = () => {
    const player = playerRef.current;
    const keys = keysRef.current;
    const mouse = mouseRef.current;
    const camera = cameraRef.current;
    
    const speed = 0.1;
    const jumpPower = 0.2;
    
    let moveX = 0, moveZ = 0;
    
    if (keys['KeyW']) moveZ -= 1;
    if (keys['KeyS']) moveZ += 1;
    if (keys['KeyA']) moveX -= 1;
    if (keys['KeyD']) moveX += 1;
    
    const rotY = mouse.x;
    const newMoveX = moveX * Math.cos(rotY) - moveZ * Math.sin(rotY);
    const newMoveZ = moveX * Math.sin(rotY) + moveZ * Math.cos(rotY);
    
    player.vx = newMoveX * speed;
    player.vz = newMoveZ * speed;
    
    player.vy -= 0.01;
    
    if (keys['Space'] && isOnGround()) {
      player.vy = jumpPower;
    }
    
    player.x += player.vx;
    player.y += player.vy;
    player.z += player.vz;
    
    handleCollisions();
    
    if (player.y < 1) {
      player.y = 1;
      player.vy = 0;
    }
    
    camera.position.set(player.x, player.y + 1.6, player.z);
    camera.rotation.x = mouse.y;
    camera.rotation.y = mouse.x;
    
    setPosition({
      x: Math.round(player.x),
      y: Math.round(player.y),
      z: Math.round(player.z)
    });
  };

  const isOnGround = () => {
    const player = playerRef.current;
    const x = Math.round(player.x);
    const y = Math.floor(player.y - 0.1);
    const z = Math.round(player.z);
    
    return worldRef.current[`${x},${y},${z}`] !== undefined;
  };

  const handleCollisions = () => {
    const player = playerRef.current;
    const world = worldRef.current;
    const playerRadius = 0.3;
    const playerHeight = 1.8;
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 2; dy++) {
        for (let dz = -1; dz <= 1; dz++) {
          const x = Math.floor(player.x) + dx;
          const y = Math.floor(player.y) + dy;
          const z = Math.floor(player.z) + dz;
          
          if (world[`${x},${y},${z}`]) {
            const distX = Math.abs(player.x - x);
            const distY = Math.abs((player.y + playerHeight/2) - y);
            const distZ = Math.abs(player.z - z);
            
            if (distX < 0.5 + playerRadius && distY < 0.5 + playerHeight/2 && distZ < 0.5 + playerRadius) {
              if (distX > distZ) {
                player.x += (player.x > x ? 0.1 : -0.1);
              } else {
                player.z += (player.z > z ? 0.1 : -0.1);
              }
              
              if (player.vy < 0 && player.y < y + 1) {
                player.y = y + 1;
                player.vy = 0;
              }
            }
          }
        }
      }
    }
  };

  const animate = () => {
    animationIdRef.current = requestAnimationFrame(animate);
    
    updatePlayer();
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setTimeout(() => {
      initGame();
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (rendererRef.current && mountRef.current) {
        mountRef.current.removeChild(rendererRef.current.domElement);
      }
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-sky-300">
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-80 text-white p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Minecraft Three.js</h2>
            <div className="text-left mb-6">
              <p className="font-bold mb-2">Controls:</p>
              <p>WASD - Move around</p>
              <p>Mouse - Look around</p>
              <p>Left Click - Remove block</p>
              <p>Right Click - Place block</p>
              <p>Numbers 1-6 - Select block type</p>
              <p>Space - Jump</p>
            </div>
            <button 
              onClick={startGame}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
            >
              Start Game
            </button>
          </div>
        </div>
      )}
      
      {gameStarted && (
        <>
          <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 p-3 rounded z-40">
            <div>Position: {position.x}, {position.y}, {position.z}</div>
            <div>Blocks: {blockCount}</div>
          </div>
          
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none z-40">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white transform -translate-x-1/2"></div>
          </div>
          
          <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex gap-0.5 z-40">
            {blockTypes.map((blockType, index) => (
              <div
                key={blockType}
                className={`w-12 h-12 flex items-center justify-center text-white text-xs cursor-pointer border-2 ${
                  selectedBlock === blockType 
                    ? 'bg-white bg-opacity-20 border-white' 
                    : 'bg-black bg-opacity-80 border-gray-600'
                }`}
                onClick={() => setSelectedBlock(blockType)}
              >
                {blockType.toUpperCase()}
              </div>
            ))}
          </div>
        </>
      )}
      
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

export default MinecraftGame;
