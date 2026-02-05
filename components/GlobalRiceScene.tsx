
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Sky, Cloud, PerspectiveCamera, OrbitControls, useCursor, Html, Text, Float, Stars, Line, Sphere, RoundedBox, Cone, Sparkles, Torus, Instance, Instances, Cylinder, Dodecahedron, Box } from '@react-three/drei';
import * as THREE from 'three';
import { Step, RiceStatus, GameState, RiceImage, OptimizationState } from '../types';

// --- Assets & Materials ---
const MATERIALS = {
  healthyStalk: new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.8, flatShading: true }),
  healthyGrain: new THREE.MeshStandardMaterial({ 
    color: '#86efac', 
    roughness: 0.2, 
    metalness: 0.1,
    emissive: '#22c55e',
    emissiveIntensity: 0.4 
  }), 
  
  sickStalk: new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9, flatShading: true }),
  sickGrain: new THREE.MeshStandardMaterial({ 
    color: '#fbbf24', 
    roughness: 0.2, 
    metalness: 0.1,
    emissive: '#fbbf24',
    emissiveIntensity: 0.6 
  }), 
  
  ground: new THREE.MeshStandardMaterial({ color: '#064e3b' }), 
  water: new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.0, metalness: 0.1, transparent: true, opacity: 0.6 }),
  
  // Organism Materials
  pestBody: new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 }),
  weed: new THREE.MeshStandardMaterial({ color: '#3f6212', flatShading: true }),
  
  scarecrowWood: new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 }),
  scarecrowClothes: new THREE.MeshStandardMaterial({ color: '#1d4ed8', roughness: 0.8 }),
  scarecrowStraw: new THREE.MeshStandardMaterial({ color: '#fde047', roughness: 1.0 }),
  scarecrowHat: new THREE.MeshStandardMaterial({ color: '#a16207', roughness: 1.0 }),
  
  ladybugRed: new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.3, metalness: 0.2 }),
  ladybugBlack: new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.3 }),
  
  dragonflyBody: new THREE.MeshStandardMaterial({ color: '#0ea5e9', metalness: 0.6 }),
  dragonflyWing: new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.3, side: THREE.DoubleSide }),
};

// --- Procedural Background Field ---
const RiceFieldBackground = () => {
  const { healthyData, sickData } = useMemo(() => {
    const healthy = [];
    const sick = [];
    const count = 400; 
    const minRadius = 15; 
    const maxRadius = 50;

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random() * (maxRadius**2 - minRadius**2) + minRadius**2);
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const scale = 0.8 + Math.random() * 0.5;
      const isSick = Math.random() > 0.8; 

      const obj = { position: [x, 0, z] as [number, number, number], scale, rotation: [0, Math.random() * Math.PI, 0] as [number, number, number] };
      if (isSick) sick.push(obj);
      else healthy.push(obj);
    }
    return { healthyData: healthy, sickData: sick };
  }, []);

  return (
    <group position={[0, -0.2, 0]}>
       <Instances range={healthyData.length} material={MATERIALS.healthyStalk} geometry={new THREE.CylinderGeometry(0.05, 0.02, 1, 5)}>
          {healthyData.map((data, i) => (
            <group key={i} position={data.position} rotation={data.rotation} scale={data.scale}>
               <Instance position={[0, 0.5, 0]} /> 
               <mesh position={[0, 1.1, 0]} material={MATERIALS.healthyGrain}> 
                  <dodecahedronGeometry args={[0.25, 0]} />
               </mesh>
            </group>
          ))}
       </Instances>

       <Instances range={sickData.length} material={MATERIALS.sickStalk} geometry={new THREE.CylinderGeometry(0.05, 0.02, 1, 5)}>
          {sickData.map((data, i) => (
            <group key={i} position={data.position} rotation={data.rotation} scale={data.scale}>
               <Instance position={[0, 0.5, 0]} />
               <mesh position={[0, 1.1, 0]} material={MATERIALS.sickGrain}>
                  <dodecahedronGeometry args={[0.25, 0]} />
               </mesh>
            </group>
          ))}
       </Instances>
    </group>
  );
};

// --- Organism Components ---

const Pest = ({ position }: { position: [number, number, number] }) => {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (group.current) {
        group.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 10) * 0.02;
        group.current.rotation.y += 0.01;
    }
  });

  return (
    <group ref={group} position={position} scale={0.4}>
      <mesh castShadow receiveShadow material={MATERIALS.pestBody}>
        <sphereGeometry args={[0.5, 16, 16]} />
      </mesh>
      <mesh position={[0.4, 0.2, 0.4]} rotation={[0, 0, -0.5]}>
         <cylinderGeometry args={[0.05, 0.02, 0.6]} />
         <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-0.4, 0.2, 0.4]} rotation={[0, 0, 0.5]}>
         <cylinderGeometry args={[0.05, 0.02, 0.6]} />
         <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
};

const Weed = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position} rotation={[0, Math.random() * Math.PI, 0]}>
             <mesh position={[0, 0.3, 0]} rotation={[0.2, 0, 0]} material={MATERIALS.weed}>
                 <coneGeometry args={[0.3, 0.8, 4]} />
             </mesh>
             <mesh position={[0.2, 0.2, 0]} rotation={[0, 0, -0.4]} material={MATERIALS.weed}>
                 <coneGeometry args={[0.2, 0.6, 4]} />
             </mesh>
        </group>
    );
};

const Scarecrow = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position} scale={1.2}>
            {/* Pole */}
            <mesh position={[0, 1.5, 0]} castShadow material={MATERIALS.scarecrowWood}>
                <cylinderGeometry args={[0.08, 0.08, 3.5]} />
            </mesh>
            {/* Arms */}
            <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI/2]} castShadow material={MATERIALS.scarecrowWood}>
                <cylinderGeometry args={[0.06, 0.06, 2.5]} />
            </mesh>
            {/* Body */}
            <mesh position={[0, 2, 0]} material={MATERIALS.scarecrowClothes}>
                <cylinderGeometry args={[0.3, 0.4, 1.2]} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.8, 0]} material={MATERIALS.scarecrowStraw}>
                <sphereGeometry args={[0.3]} />
            </mesh>
            {/* Hat */}
            <mesh position={[0, 3.1, 0]} rotation={[0, 0.2, 0]} material={MATERIALS.scarecrowHat}>
                <coneGeometry args={[0.6, 0.6, 16]} />
            </mesh>
        </group>
    );
};

const Ladybug = ({ position }: { position: [number, number, number] }) => {
    return (
        <group position={position} scale={0.3}>
            <mesh castShadow material={MATERIALS.ladybugRed}>
                <sphereGeometry args={[0.5, 16, 16, 0, Math.PI * 2, 0, Math.PI/2]} />
            </mesh>
            <mesh position={[0, 0.2, 0.3]} material={MATERIALS.ladybugBlack}>
                <sphereGeometry args={[0.2]} />
            </mesh>
            {/* Spots */}
            <mesh position={[0.2, 0.3, 0.1]} material={MATERIALS.ladybugBlack}>
                <sphereGeometry args={[0.08]} />
            </mesh>
            <mesh position={[-0.2, 0.35, -0.1]} material={MATERIALS.ladybugBlack}>
                <sphereGeometry args={[0.08]} />
            </mesh>
        </group>
    );
};

const Dragonfly = ({ position }: { position: [number, number, number] }) => {
    const group = useRef<THREE.Group>(null);
    useFrame((state) => {
        if (group.current) {
            // Flight path
            const t = state.clock.elapsedTime;
            group.current.position.y = position[1] + 3 + Math.sin(t * 2) * 0.5;
            group.current.position.x = position[0] + Math.cos(t * 0.5) * 2;
            group.current.position.z = position[2] + Math.sin(t * 0.5) * 2;
            group.current.lookAt(position[0] + Math.cos(t * 0.5 + 0.1) * 2, position[1] + 3, position[2] + Math.sin(t * 0.5 + 0.1) * 2);
        }
    });

    return (
        <group ref={group} scale={0.5}>
            <mesh material={MATERIALS.dragonflyBody}>
                <capsuleGeometry args={[0.1, 1.2, 4, 8]} />
            </mesh>
            {/* Wings */}
            <group>
                <mesh position={[0.5, 0, 0.2]} rotation={[Math.PI/2, 0, -0.2]} material={MATERIALS.dragonflyWing}>
                    <boxGeometry args={[1.5, 0.02, 0.4]} />
                </mesh>
                <mesh position={[-0.5, 0, 0.2]} rotation={[Math.PI/2, 0, 0.2]} material={MATERIALS.dragonflyWing}>
                     <boxGeometry args={[1.5, 0.02, 0.4]} />
                </mesh>
                <mesh position={[0.5, 0, -0.2]} rotation={[Math.PI/2, 0, 0.2]} material={MATERIALS.dragonflyWing}>
                    <boxGeometry args={[1.2, 0.02, 0.3]} />
                </mesh>
                <mesh position={[-0.5, 0, -0.2]} rotation={[Math.PI/2, 0, -0.2]} material={MATERIALS.dragonflyWing}>
                     <boxGeometry args={[1.2, 0.02, 0.3]} />
                </mesh>
            </group>
        </group>
    );
};

// --- AI Avatar Component ---
const AIAvatar = ({ name, state }: { name: string, state: Step }) => {
  const group = useRef<THREE.Group>(null);
  const eyeColor = state === 'TRAIN' || state === 'TEST' || state === 'EVALUATE' || state === 'OPTIMIZE' ? '#ef4444' : '#3b82f6';
  
  useFrame((state) => {
    if (group.current) {
      group.current.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
      group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group} position={[0, 1.5, 0]} scale={0.8}>
      <mesh position={[0, 0, 0]}>
        <capsuleGeometry args={[0.4, 0.8, 4, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0.35]}>
        <boxGeometry args={[0.5, 0.3, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.12, 0.3, 0.41]}>
        <sphereGeometry args={[0.06]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.12, 0.3, 0.41]}>
        <sphereGeometry args={[0.06]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0, -0.6, 0]} rotation={[Math.PI/2, 0, 0]}>
        <torusGeometry args={[0.3, 0.05, 16, 32]} />
        <meshStandardMaterial color="#64748b" />
      </mesh>
    </group>
  );
};

// --- Detective Station (Evaluation) ---
const DetectiveStation = ({ currentImage }: { currentImage?: RiceImage }) => {
    if (!currentImage) return null;

    const isHealthyPred = currentImage.aiPrediction === 'healthy';

    return (
        <group position={[0, 0, 2]}>
            <mesh position={[0, -1, 0]} receiveShadow>
                <cylinderGeometry args={[3, 3.5, 0.5, 32]} />
                <meshStandardMaterial color="#7c3aed" /> 
            </mesh>

            <group position={[0, -0.5, 0]}>
                 <SingleRice position={[0,0,0]} status={currentImage.status} interactive={false} scale={2} />
            </group>

            <Float speed={2} floatIntensity={0.5}>
                <group position={[1.5, 1, 1]} rotation={[0, -0.5, 0.2]}>
                     <mesh>
                         <torusGeometry args={[0.6, 0.05, 16, 32]} />
                         <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.2} />
                     </mesh>
                     <mesh position={[0, -1, 0]}>
                         <cylinderGeometry args={[0.05, 0.05, 1.2]} />
                         <meshStandardMaterial color="#92400e" />
                     </mesh>
                     <mesh rotation={[Math.PI/2, 0, 0]}>
                         <cylinderGeometry args={[0.58, 0.58, 0.02, 32]} />
                         <meshStandardMaterial color="#fff" transparent opacity={0.3} metalness={1} roughness={0} />
                     </mesh>
                </group>
            </Float>

            <group position={[-1.5, 1.5, 0]}>
                 <Float speed={3} floatIntensity={0.2}>
                    <RoundedBox args={[1.8, 1.2, 0.1]} radius={0.1}>
                        <meshStandardMaterial color="white" />
                    </RoundedBox>
                    <Text position={[0, 0.2, 0.1]} fontSize={0.2} color="#64748b">AI 认为这是:</Text>
                    <Text position={[0, -0.2, 0.1]} fontSize={0.3} color={isHealthyPred ? "#16a34a" : "#ca8a04"} fontWeight="bold">
                        {isHealthyPred ? "健康" : "生病"}
                    </Text>
                 </Float>
            </group>
        </group>
    );
};

// --- Doctor Station (Optimization) ---
const DoctorStation = ({ state }: { state: OptimizationState }) => {
    const curvePoints = useMemo(() => {
        const points = [];
        for(let i=0; i<=50; i++) {
            points.push(new THREE.Vector3((i/50)*4 - 2, 0, 0));
        }
        return points;
    }, []);

    const lineRef = useRef<any>(null);
    useFrame(({ clock }) => {
        if (lineRef.current) {
            const positions = lineRef.current.geometry.attributes.position.array;
            const t = clock.elapsedTime * state.learningSpeed;
            
            for(let i=0; i<=50; i++) {
                const x = (i/50)*4 - 2;
                let y = 0;
                
                if (state.isCuring) {
                    y = Math.sin(x * 5 + t) * (1 / (t % 10 + 1)) * 0.5;
                } else {
                    y = Math.sin(x * 3 + t) * 0.5 + Math.cos(x * 10 + t) * 0.2;
                }
                
                positions[i * 3 + 1] = y;
            }
            lineRef.current.geometry.attributes.position.needsUpdate = true;
        }
    });

    return (
        <group position={[0, 0, 2]}>
             <mesh position={[0, -1, 0]} receiveShadow>
                <boxGeometry args={[6, 0.5, 3]} />
                <meshStandardMaterial color="#fce7f3" />
            </mesh>

            <group position={[0, 1, -0.5]}>
                <RoundedBox args={[4.2, 2.2, 0.2]} radius={0.1}>
                    <meshStandardMaterial color="#374151" />
                </RoundedBox>
                <RoundedBox args={[4, 2, 0.1]} position={[0, 0, 0.1]} radius={0.05}>
                    <meshStandardMaterial color="#000" />
                </RoundedBox>
                <group position={[0, 0, 0.2]}>
                     <Line ref={lineRef} points={curvePoints} color={state.isCuring ? "#4ade80" : "#f472b6"} lineWidth={3} />
                </group>
                <Text position={[0, 1.3, 0]} fontSize={0.2} color="#374151">模型心电图 (Loss)</Text>
            </group>

            <group position={[-2, 0, 0.5]}>
                {Array.from({ length: state.blockCount }).map((_, i) => (
                    <RoundedBox key={i} args={[0.8, 0.2, 0.8]} position={[0, -0.6 + i * 0.25, 0]} radius={0.05}>
                        <meshStandardMaterial color={`hsl(${200 + i * 20}, 70%, 60%)`} />
                    </RoundedBox>
                ))}
                <Text position={[0, 1, 0]} fontSize={0.2} color="#374151">脑容量</Text>
            </group>

            <group position={[2, -0.2, 0.5]}>
                <Cylinder args={[0.3, 0.4, 1, 16]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#e5e7eb" transparent opacity={0.3} />
                </Cylinder>
                {state.hasPotion && (
                    <Cylinder args={[0.25, 0.35, 0.8, 16]} position={[0, -0.1, 0]}>
                        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.5} />
                    </Cylinder>
                )}
                {state.hasPotion && (
                    <Sparkles count={20} scale={[1, 1.5, 1]} color="#d8b4fe" size={2} />
                )}
                 <Text position={[0, 0.8, 0]} fontSize={0.2} color="#374151">增强药水</Text>
            </group>
        </group>
    );
};

// --- Single 3D Rice Plant (Interactive) ---
interface SingleRiceProps {
  position: [number, number, number];
  status: RiceStatus;
  onClick?: () => void;
  interactive?: boolean;
  scale?: number;
}

const SingleRice: React.FC<SingleRiceProps> = ({ 
  position, 
  status, 
  onClick, 
  interactive = true,
  scale = 1
}) => {
  const [hovered, setHovered] = useState(false);
  const isSick = status === 'sick';
  const group = useRef<THREE.Group>(null);
  
  useCursor(interactive && hovered);

  useFrame((state, delta) => {
    if (!group.current) return;
    const windOffset = position[0] * 0.5 + position[2] * 0.3;
    const sway = Math.sin(state.clock.elapsedTime * 1.5 + windOffset) * 0.05;
    group.current.rotation.z = sway;
    group.current.rotation.x = sway * 0.5;
    
    // Scale animation on hover for feedback without white light
    if (interactive) {
       const targetScale = hovered ? scale * 1.3 : scale;
       group.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const stalkMaterial = isSick ? MATERIALS.sickStalk : MATERIALS.healthyStalk;
  const grainMaterial = isSick ? MATERIALS.sickGrain : MATERIALS.healthyGrain;

  return (
    <group 
      ref={group}
      position={position} 
      scale={scale}
      onClick={(e) => { 
        if(interactive && onClick) {
          e.stopPropagation();
          onClick();
        }
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <group position={[0, 0, 0]}>
         <mesh position={[0, 0.4, 0]} rotation={[0.1, 0, 0]} castShadow material={stalkMaterial}>
           <cylinderGeometry args={[0.03, 0.05, 0.8, 6]} />
         </mesh>
         <mesh position={[0.1, 0.35, 0.05]} rotation={[0, 0, -0.1]} castShadow material={stalkMaterial}>
           <cylinderGeometry args={[0.02, 0.04, 0.7, 6]} />
         </mesh>
         <mesh position={[-0.1, 0.35, -0.05]} rotation={[-0.1, 0, 0.1]} castShadow material={stalkMaterial}>
           <cylinderGeometry args={[0.02, 0.04, 0.7, 6]} />
         </mesh>
      </group>
      <group position={[0, 0.9, 0]}>
         <mesh position={[0, 0, 0]} rotation={[0.2, 0, 0]} material={grainMaterial}>
           <dodecahedronGeometry args={[0.25, 0]} />
         </mesh>
         <mesh position={[0.2, -0.1, 0.05]} rotation={[0, 0, -0.2]} material={grainMaterial}>
           <dodecahedronGeometry args={[0.15, 0]} />
         </mesh>
         <mesh position={[-0.2, -0.15, -0.05]} rotation={[-0.1, 0, 0.2]} material={grainMaterial}>
           <dodecahedronGeometry args={[0.12, 0]} />
         </mesh>
      </group>
      <group position={[0, 0.2, 0]}>
         <mesh rotation={[0.5, 0, 0]} material={stalkMaterial}>
           <coneGeometry args={[0.08, 0.5, 4]} />
         </mesh>
         <mesh rotation={[0.5, 2, 0]} material={stalkMaterial}>
           <coneGeometry args={[0.08, 0.4, 4]} />
         </mesh>
      </group>
      
      {/* Visual Feedback Ring (Colored, not white) */}
      {hovered && interactive && (
         <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <ringGeometry args={[0.4, 0.5, 32]} />
            <meshBasicMaterial color={isSick ? '#fbbf24' : '#4ade80'} transparent opacity={0.6} />
         </mesh>
      )}
    </group>
  );
};

// --- Labeling Station (Closeup) ---
const LabelingStation = ({ currentImage, onLabel }: { currentImage: RiceImage | undefined, onLabel: (l: RiceStatus) => void }) => {
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  if (!currentImage) return null;

  const handleClick = (selectedLabel: RiceStatus) => {
    const isCorrect = selectedLabel === currentImage.status;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    setTimeout(() => {
      onLabel(selectedLabel);
      setFeedback(null);
    }, 800);
  };

  return (
    <group position={[0, 0, 4]}>
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[2, 2.2, 0.5, 32]} />
        <meshStandardMaterial color="#cbd5e1" />
      </mesh>
      <group position={[0, 0, 0]}>
        <SingleRice position={[0, 0, 0]} status={currentImage.status} interactive={false} scale={1.8} />
      </group>
      <group position={[-1.5, 1, 0]}>
        <Float speed={2} floatIntensity={0.5}>
          <group onClick={() => handleClick('sick')}>
            <RoundedBox args={[1, 1, 0.2]} radius={0.1}>
              <meshStandardMaterial color="#ef4444" />
            </RoundedBox>
            <Text position={[0, 0, 0.15]} fontSize={0.2} color="white">生病</Text>
            <mesh position={[0, -0.3, 0.15]}>
               <dodecahedronGeometry args={[0.1]} />
               <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} /> 
            </mesh>
          </group>
        </Float>
      </group>
      <group position={[1.5, 1, 0]}>
        <Float speed={2} floatIntensity={0.5}>
          <group onClick={() => handleClick('healthy')}>
            <RoundedBox args={[1, 1, 0.2]} radius={0.1}>
              <meshStandardMaterial color="#22c55e" />
            </RoundedBox>
            <Text position={[0, 0, 0.15]} fontSize={0.2} color="white">健康</Text>
             <mesh position={[0, -0.3, 0.15]}>
               <dodecahedronGeometry args={[0.1]} />
               <meshStandardMaterial color="#86efac" emissive="#86efac" emissiveIntensity={0.5} /> 
            </mesh>
          </group>
        </Float>
      </group>
      {feedback && (
        <Html position={[0, 2, 0]} center>
          <div className={`text-8xl font-black drop-shadow-lg animate-bounce ${feedback === 'correct' ? 'text-green-500' : 'text-red-600'}`}>
            {feedback === 'correct' ? '✔' : '✖'}
          </div>
          <div className="text-white text-xl font-bold bg-black/50 px-4 py-2 rounded-full mt-4 backdrop-blur-sm whitespace-nowrap">
            {feedback === 'correct' ? '标注正确！' : '标注错误，请观察谷粒颜色'}
          </div>
        </Html>
      )}
      <Text position={[0, 2.8, 0]} fontSize={0.25} color="#334155" anchorX="center">
        观察谷粒颜色：黄色=生病，绿色=健康
      </Text>
    </group>
  );
};

// --- Neural Network Visualizer (Training) ---
const NeuralNetwork = () => {
  const layers = [3, 4, 4, 2];
  const ringRef = useRef<THREE.Mesh>(null);
  const nodes = useMemo(() => {
    const list = [];
    let xOff = -3;
    layers.forEach((count, lIdx) => {
      const yStart = (count - 1) * 0.8 / 2;
      for(let i=0; i<count; i++) {
        list.push(new THREE.Vector3(xOff + lIdx * 2, i * 0.8 - yStart + 2, 0));
      }
    });
    return list;
  }, []);

  const connections = useMemo(() => {
    const lines = [];
    let nodeIdx = 0;
    for(let l=0; l<layers.length-1; l++) {
      const currentLayerCount = layers[l];
      const nextLayerCount = layers[l+1];
      
      for(let i=0; i<currentLayerCount; i++) {
        const source = nodes[nodeIdx + i];
        for(let j=0; j<nextLayerCount; j++) {
           const target = nodes[nodeIdx + currentLayerCount + j];
           lines.push([source, target]);
        }
      }
      nodeIdx += currentLayerCount;
    }
    return lines;
  }, [nodes]);

  const particles = useMemo(() => new Array(30).fill(0).map(() => ({
    pos: new THREE.Vector3(),
    progress: Math.random(),
    speed: 0.01 + Math.random() * 0.03,
    pathIdx: Math.floor(Math.random() * connections.length)
  })), [connections]);

  const particleMesh = useRef<THREE.InstancedMesh>(null);
  const dummy = new THREE.Object3D();

  useFrame((state) => {
    particles.forEach((p, i) => {
      p.progress += p.speed;
      if(p.progress > 1) {
        p.progress = 0;
        p.pathIdx = Math.floor(Math.random() * connections.length);
      }
      const [start, end] = connections[p.pathIdx];
      p.pos.lerpVectors(start, end, p.progress);
      dummy.position.copy(p.pos);
      const scale = 0.1 + Math.sin(state.clock.elapsedTime * 10 + i) * 0.05;
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      particleMesh.current?.setMatrixAt(i, dummy.matrix);
    });
    particleMesh.current!.instanceMatrix.needsUpdate = true;
    if (ringRef.current) {
        ringRef.current.rotation.x = Math.PI / 2;
        ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
        ringRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.2;
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Torus ref={ringRef} args={[4, 0.05, 16, 100]} position={[0, 2, 0]}>
            <meshBasicMaterial color="#60a5fa" transparent opacity={0.3} />
        </Torus>
        {nodes.map((pos, i) => (
            <mesh key={i} position={pos}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color="#60a5fa" emissive="#2563eb" emissiveIntensity={0.8} />
            </mesh>
        ))}
        {connections.map(([start, end], i) => (
            <Line key={i} points={[start, end]} color="#1e293b" transparent opacity={0.1} lineWidth={1} />
        ))}
        <instancedMesh ref={particleMesh} args={[undefined, undefined, 30]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#4ade80" />
        </instancedMesh>
      </Float>
      <Text position={[0, 5, 0]} fontSize={0.5} color="#1e293b" anchorX="center">
        神经网络优化中...
      </Text>
    </group>
  );
};

// --- Results Visualization (Reward) ---
const ResultsChart = ({ accuracy }: { accuracy: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const textRef = useRef<any>(null); 
  const currentAcc = useRef(0);

  useFrame((state, delta) => {
    currentAcc.current = THREE.MathUtils.lerp(currentAcc.current, accuracy, delta * 3);
    const height = 3 * (currentAcc.current / 100);
    
    if (meshRef.current) {
        meshRef.current.scale.y = Math.max(0.01, height);
        meshRef.current.position.y = -1.5 + (height / 2);
    }
    
    if (textRef.current) {
        textRef.current.text = `${Math.round(currentAcc.current)}%`;
        textRef.current.position.y = -1.5 + height + 0.4;
    }
  });

  return (
    <group position={[0, 2, 0]}>
       <Text position={[0, 2.2, 0]} fontSize={0.5} color="#1e293b">模型准确率</Text>
       <mesh position={[0, 0, 0]}>
         <boxGeometry args={[1, 3, 0.5]} />
         <meshStandardMaterial color="#cbd5e1" transparent opacity={0.2} />
         <Line 
            points={[[-0.5, -1.5, 0.26], [0.5, -1.5, 0.26], [0.5, 1.5, 0.26], [-0.5, 1.5, 0.26], [-0.5, -1.5, 0.26]]} 
            color="white" 
            lineWidth={2} 
         />
       </mesh>
       <mesh ref={meshRef} position={[0, -1.5, 0.05]}>
         <boxGeometry args={[0.8, 1, 0.6]} />
         <meshStandardMaterial 
            color={accuracy > 85 ? "#22c55e" : "#eab308"} 
            emissive={accuracy > 85 ? "#15803d" : "#ca8a04"} 
            emissiveIntensity={0.6} 
         />
       </mesh>
       <Text ref={textRef} position={[0, -1.5, 0.4]} fontSize={0.6} color="#1e293b" anchorY="bottom">
         0%
       </Text>
       {accuracy > 80 && (
          <Sparkles count={60} scale={[5, 5, 5]} size={6} speed={0.4} opacity={1} color="#fbbf24" position={[0, 0, 1]} />
       )}
    </group>
  );
};

// --- Intro Interface (3D/HTML Hybrid) ---
const IntroInterface = ({ onNameSubmit }: { onNameSubmit: (name: string) => void }) => {
  const [name, setName] = useState('');

  return (
    <group position={[0, 1, 3]} scale={0.5}> {/* Resized down */}
       <Html center transform>
          <div 
            className="bg-white/95 p-6 rounded-2xl shadow-2xl backdrop-blur-md border border-white/50 text-center w-96"
            onPointerDown={(e) => e.stopPropagation()}
          >
             <h1 className="text-2xl font-black text-blue-600 mb-2">Mind AI 农业实验室</h1>
             <p className="text-gray-600 mb-6 text-sm">给你的 AI 助手起个名字，开始这一天的研究任务。</p>
             <div className="flex flex-col gap-3">
               <input 
                 type="text" 
                 placeholder="AI 名字 (例如: 米粒)" 
                 className="w-full px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 onKeyDown={(e) => e.key === 'Enter' && name && onNameSubmit(name)}
               />
               <button 
                 onClick={() => name && onNameSubmit(name)}
                 className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                 disabled={!name}
               >
                 启动系统
               </button>
             </div>
          </div>
       </Html>
    </group>
  );
};

// --- Main Scene Controller ---
export const GlobalRiceScene = ({ 
  gameState, 
  onNameSubmit, 
  onCollect,
  onLabel
}: { 
  gameState: GameState, 
  onNameSubmit: (n: string) => void,
  onCollect: (s: RiceStatus) => void,
  onLabel: (s: RiceStatus) => void
}) => {
  const { step, aiName, collection, accuracy, currentEvalIndex } = gameState;
  
  // Camera Management
  const CameraController = () => {
    useFrame((state) => {
      const cam = state.camera;
      
      let targetPos = new THREE.Vector3(0, 5, 10);
      let targetLook = new THREE.Vector3(0, 0, 0);

      if (step === 'INTRO') {
        targetPos.set(0, 3, 9);
        targetLook.set(0, 1, 0);
      } else if (step === 'COLLECT') {
        targetPos.set(0, 18, 18);
        targetLook.set(0, 0, 0);
      } else if (step === 'LABEL') {
        targetPos.set(0, 3, 10);
        targetLook.set(0, 1, 0);
      } else if (step === 'TRAIN') {
        targetPos.set(0, 0, 14);
        targetLook.set(0, 2, 0);
      } else if (step === 'TEST' || step === 'REWARD') {
         targetPos.set(0, 3, 12); 
         targetLook.set(0, 2, 0); 
      } else if (step === 'EVALUATE') {
         targetPos.set(0, 2, 8);
         targetLook.set(0, 0.5, 0);
      } else if (step === 'OPTIMIZE') {
         targetPos.set(0, 2, 8);
         targetLook.set(0, 0, 0);
      }

      cam.position.lerp(targetPos, 0.05);
      cam.lookAt(targetLook);
    });
    return null;
  };

  const { interactivePlants, pests, weeds, ladybugs, dragonflies, scarecrowPos } = useMemo(() => {
    const plants = [];
    const pests = [];
    const weeds = [];
    const ladybugs = [];
    const dragonflies = [];
    
    // Distribute interactive plants randomly
    for(let i=0; i<12; i++) {
       const r = Math.sqrt(Math.random() * (12**2 - 3**2) + 3**2); // Random radius between 3 and 12
       const angle = Math.random() * Math.PI * 2;
       
       plants.push({
           id: i,
           pos: [Math.cos(angle) * r, 0, Math.sin(angle) * r] as [number, number, number],
           status: (i % 2 === 0 ? 'healthy' : 'sick') as RiceStatus
       });
    }

    // Distribute Pests
    for(let i=0; i<5; i++) {
        const r = Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        pests.push([Math.cos(angle)*r, 0, Math.sin(angle)*r] as [number, number, number]);
    }

    // Distribute Weeds
    for(let i=0; i<8; i++) {
        const r = Math.random() * 10;
        const angle = Math.random() * Math.PI * 2;
        weeds.push([Math.cos(angle)*r, 0, Math.sin(angle)*r] as [number, number, number]);
    }

    // Distribute Ladybugs
    for(let i=0; i<4; i++) {
        const r = Math.random() * 8 + 2;
        const angle = Math.random() * Math.PI * 2;
        ladybugs.push([Math.cos(angle)*r, 0.1, Math.sin(angle)*r] as [number, number, number]);
    }
    
    // Distribute Dragonflies
    for(let i=0; i<3; i++) {
        const r = Math.random() * 12;
        const angle = Math.random() * Math.PI * 2;
        dragonflies.push([Math.cos(angle)*r, 0, Math.sin(angle)*r] as [number, number, number]);
    }

    // Scarecrow Position
    const scarecrowPos = [5, 0, -5] as [number, number, number];

    return { interactivePlants: plants, pests, weeds, ladybugs, dragonflies, scarecrowPos };
  }, []);
  
  const [collectedIds, setCollectedIds] = useState<number[]>([]);
  const handlePlantClick = (id: number, status: RiceStatus) => {
    if (collectedIds.includes(id)) return;
    setCollectedIds(prev => [...prev, id]);
    onCollect(status);
  };

  // For evaluation step, find the current target item
  const currentEvalItem = useMemo(() => {
      if (step !== 'EVALUATE') return undefined;
      const evalItems = collection.filter(c => c.aiPrediction);
      return evalItems[currentEvalIndex];
  }, [step, collection, currentEvalIndex]);

  return (
    <div className="fixed inset-0 z-0">
      <Canvas shadows dpr={[1, 2]}>
        <color attach="background" args={['#e0f2fe']} />
        <fog attach="fog" args={['#e0f2fe', 10, 45]} />
        <PerspectiveCamera makeDefault fov={50} />
        <CameraController />
        
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 5]} intensity={1.5} castShadow shadow-mapSize={[1024, 1024]} />
        <pointLight position={[0, 5, 0]} intensity={0.5} />
        
        <Sky sunPosition={[100, 20, 100]} turbidity={8} rayleigh={6} />
        <Cloud position={[0, 10, -20]} opacity={0.5} />
        
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <primitive object={MATERIALS.ground} />
        </mesh>
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[100, 100]} />
          <primitive object={MATERIALS.water} />
        </mesh>
        
        <RiceFieldBackground />

        {/* --- SCENE CONTENT SWITCHER --- */}
        
        <AIAvatar name={aiName} state={step} />

        {step === 'INTRO' && <IntroInterface onNameSubmit={onNameSubmit} />}

        {step === 'COLLECT' && (
          <group>
             {/* Plants */}
             {interactivePlants.map((p) => (
               !collectedIds.includes(p.id) && (
                 <SingleRice 
                   key={p.id} 
                   position={p.pos} 
                   status={p.status} 
                   onClick={() => handlePlantClick(p.id, p.status)} 
                 />
               )
             ))}
             {/* Distractors & Organisms */}
             {pests.map((pos, i) => <Pest key={`pest-${i}`} position={pos} />)}
             {weeds.map((pos, i) => <Weed key={`weed-${i}`} position={pos} />)}
             {ladybugs.map((pos, i) => <Ladybug key={`ladybug-${i}`} position={pos} />)}
             {dragonflies.map((pos, i) => <Dragonfly key={`dragonfly-${i}`} position={pos} />)}
             <Scarecrow position={scarecrowPos} />

             <Text position={[0, 8, -5]} fontSize={0.8} color="#1e293b" anchorX="center" anchorY="middle" outlineWidth={0.02} outlineColor="white">
               在农田中寻找并收集稻株（忽略杂草、害虫和稻草人）
             </Text>
          </group>
        )}

        {step === 'LABEL' && (
           <LabelingStation 
             currentImage={collection.find(c => c.userLabel === undefined)} 
             onLabel={onLabel} 
           />
        )}

        {step === 'TRAIN' && <NeuralNetwork />}

        {step === 'TEST' && (
           <ResultsChart accuracy={accuracy} />
        )}

        {step === 'EVALUATE' && (
            <DetectiveStation currentImage={currentEvalItem} />
        )}

        {step === 'OPTIMIZE' && (
            <DoctorStation state={gameState.optimization} />
        )}

        {step === 'REWARD' && (
           <ResultsChart accuracy={accuracy} />
        )}
        
        <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI/2 - 0.1} />
      </Canvas>
    </div>
  );
};

export default GlobalRiceScene;
