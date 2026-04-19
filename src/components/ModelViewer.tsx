import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, KeyboardControls, useKeyboardControls, useAnimations, Html, Text } from "@react-three/drei";
import { Suspense, useRef, useEffect, useMemo, useState, useLayoutEffect } from "react";
import * as THREE from "three";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { SkeletonUtils } from "three-stdlib";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

function TrackGenerator({ active }: { active: boolean }) {
  if (!active) return null;

  const { curve, finishPos, finishRot, arrows, roadPlanes } = useMemo(() => {
    // 1. Path Calculation - S-Curve seamlessly extending from initial rotation
    const dir = new THREE.Vector3(-1, 0, 0);
    dir.applyEuler(new THREE.Euler(0, -Math.PI / 4, 0)).normalize();
    const right = new THREE.Vector3().copy(dir).applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

    const start = new THREE.Vector3(1.5, 0, 0).add(dir.clone().multiplyScalar(-10)); // Force the S-Curve to originate organically behind the vehicle so it natively rests dynamically on the first surface!
    const p1 = start.clone().add(dir.clone().multiplyScalar(50));
    const p2 = p1.clone().add(right.clone().multiplyScalar(40)).add(dir.clone().multiplyScalar(50));
    const p3 = p2.clone().add(right.clone().multiplyScalar(15)).add(dir.clone().multiplyScalar(80));
    const p4 = p3.clone().sub(right.clone().multiplyScalar(50)).add(dir.clone().multiplyScalar(60));
    const end = p4.clone().add(dir.clone().multiplyScalar(100));

    const path = new THREE.CatmullRomCurve3([start, p1, p2, p3, p4, end]);

    // 2. Unbreakable Boardwalk Pavement Generation
    // ExtrudeGeometry organically twists flat surfaces over splines due to intrinsic Frenet Frame limits.
    // By mathematically iterating discrete planks, we guarantee a flawless 100% flat concrete road ribbon!
    const planks = [];
    for (let i = 0; i <= 1; i += 0.003) { // High density overlapping segments
      const pos = path.getPointAt(i);
      const tan = path.getTangentAt(i);
      const angle = Math.atan2(tan.x, tan.z);
      // Sink the rigid path down precisely -2.05. Because the meshes are 0.1m thick, the actual resulting physical top driving surface ends up matching exactly `Y = -2.0`, which directly corresponds identically to the absolute mathematical baseline where the car inherently rests its tires natively seamlessly!
      planks.push({ position: [pos.x, -2.05, pos.z], heading: angle });
    }

    // 3. Holographic Waypoint Calculations
    const arrowData = [];
    for (let i = 0.05; i < 0.95; i += 0.05) {
      const pos = path.getPointAt(i);
      const tan = path.getTangentAt(i);
      const angle = Math.atan2(tan.x, tan.z); 
      arrowData.push({ position: pos, heading: angle });
    }

    // 4. Finish Line Alignment
    const fPos = path.getPointAt(1);
    const fTan = path.getTangentAt(1);
    const fAngle = Math.atan2(fTan.x, fTan.z);

    return { curve: path, finishPos: fPos, finishRot: fAngle, arrows: arrowData, roadPlanes: planks };
  }, []);

  return (
    <group>
      {/* The Physical Geometric Boardwalk Mesh flawlessly mapping purely rigid physics bounds tracking precisely along the parametric planks! */}
      {roadPlanes.map((pad, i) => (
         <RigidBody key={`pad-${i}`} position={pad.position as any} rotation={[0, pad.heading, 0]} type="fixed" friction={1.5} restitution={0.2}>
           <mesh receiveShadow>
             <boxGeometry args={[20, 0.1, 4]} />
             <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
           </mesh>
         </RigidBody>
      ))}

      {/* Floating Holographic Cyber Waypoints guiding clearly in the air */}
      {arrows.map((arr, i) => (
        <group key={i} position={[arr.position.x, 3.5, arr.position.z]} rotation={[0, arr.heading + Math.PI, 0]}>
          <Text
            fontSize={8}
            color="#ffffff"
            emissive="#c026d3"
            emissiveIntensity={2}
            opacity={0.8}
            depthTest={false}
            font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf"
            characters="^^^"
            anchorX="center"
            anchorY="middle"
          >
            {`^ ^ ^`}
          </Text>
        </group>
      ))}

      {/* Epic Finish Arch */}
      <group position={[finishPos.x, -2.0, finishPos.z]} rotation={[0, finishRot, 0]}>
        <mesh position={[-15, 8, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 16]} />
          <meshStandardMaterial emissive="#c026d3" color="#c026d3" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh position={[15, 8, 0]} castShadow>
          <cylinderGeometry args={[1, 1, 16]} />
          <meshStandardMaterial emissive="#c026d3" color="#c026d3" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh position={[0, 16, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[1, 1, 32]} />
          <meshStandardMaterial emissive="#c026d3" color="#c026d3" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <Text
          position={[0, 19, -1.0]}
          rotation={[0, Math.PI, 0]} // Face squarely to the incoming vehicle
          fontSize={8}
          color="#ffffff"
          font="https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf"
          anchorX="center"
          anchorY="middle"
        >
          FINISH
        </Text>
      </group>
    </group>
  );
}

function CustomModel({ onLoaded }: { onLoaded?: () => void }) {
  const { scene: rawScene, animations } = useGLTF("/wbe ntitled.glb") as any;
  const scene = useMemo(() => SkeletonUtils.clone(rawScene), [rawScene]);
  const rootGroupRef = useRef<THREE.Group>(null);
  const { actions } = useAnimations(animations, rootGroupRef);
  const [cameraMode, setCameraMode] = useState<'chase' | 'orbit'>('chase');
  const [exploreActive, setExploreActive] = useState(false);
  const [, getKeys] = useKeyboardControls();
  const carRbRef = useRef<any>(null);
  const orbitRef = useRef<any>(null);
  
  const position = [1.5, -2.0, 0];
  const rotation = [0, -Math.PI / 4, 0];
  const scale = 150;

  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  const [envNodes, humanNodes, carNodes, headBone] = useMemo(() => {
    const car: THREE.Object3D[] = [];
    const human: THREE.Object3D[] = [];
    let head: THREE.Object3D | null = null;
    const env: THREE.Object3D[] = [];

    scene.children.forEach(child => {
      const n = child.name.toLowerCase();
      if (n.includes('car') || n.includes('lamborghini') || n.includes('drift') || n.includes('suspension')) {
        car.push(child);
      } else if (n.includes('armature') || n.includes('avaturn') || n.includes('mixamorig')) {
        human.push(child);
      } else {
        env.push(child);
      }
    });

    human.forEach(h => {
      h.traverse((child: any) => {
        const bn = child.name.toLowerCase();
        if (child.isBone && bn.includes('head') && !bn.includes('top') && !bn.includes('end')) {
          head = child;
        }
      });
    });

    return [env, human, car, head];
  }, [scene]);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  useLayoutEffect(() => {
    if (rootGroupRef.current && animations.length > 0) {
      if (!mixerRef.current) {
        mixerRef.current = new THREE.AnimationMixer(rootGroupRef.current);
      }
      animations.forEach((clip) => {
        try {
          const action = mixerRef.current!.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
        } catch (e) {}
      });
      mixerRef.current.update(0);
      if (headBone && tooltipRef.current) {
        rootGroupRef.current.updateMatrixWorld(true);
        const initialHeadPos = new THREE.Vector3();
        initialHeadPos.setFromMatrixPosition(headBone.matrixWorld);
        tooltipRef.current.position.set(initialHeadPos.x, initialHeadPos.y + 0.6, initialHeadPos.z);
      }
    }
    return () => {
      if (mixerRef.current) mixerRef.current.stopAllAction();
    };
  }, [animations, humanNodes, carNodes]);

  const speed = useRef(0);
  const steering = useRef(0);
  const tooltipRef = useRef<any>(null);
  const tooltipClosed = useRef(false);
  const isHoming = useRef(false);
  const lockDriveInput = useRef(false);
  const lastCarPos = useRef<THREE.Vector3 | null>(null);
  const restCarPos = useRef<{ x: number, y: number, z: number } | null>(null);
  const restCarRot = useRef<{ w: number, x: number, y: number, z: number } | null>(null);
  const [faded, setFaded] = useState(false);
  const [bubbleReady, setBubbleReady] = useState(false);
  const [trackActive, setTrackActive] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBubbleReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const wheels = useMemo(() => {
    const list: any[] = [];
    let hasBones = false;
    scene.traverse((child: any) => {
      const n = child.name.toLowerCase();
      if ((n.includes('wheel') || n.includes('tyre') || n.includes('tire')) && !n.includes('mch-') && !n.includes('shp-')) {
        if (child.isBone) hasBones = true;
        list.push({ 
          node: child, 
          isFront: n.includes('ft') || n.includes('front'),
          spinAccumulator: 0,
          initialQuat: child.quaternion.clone()
        });
      }
    });
    return hasBones ? list.filter(l => l.node.isBone) : list.filter(l => l.node.isMesh || l.node.type === 'Group');
  }, [scene]);

  useEffect(() => {
    const handleCancel = () => {
      tooltipClosed.current = false;
      setFaded(false);
      setTrackActive(false);
      const preciseHomePos = { x: 1.5, y: -2.0, z: 0 };
      const preciseHomeRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 4, 0));
      if (carRbRef.current) {
        carRbRef.current.setTranslation(restCarPos.current || preciseHomePos, true);
        carRbRef.current.setRotation(restCarRot.current || { x: preciseHomeRot.x, y: preciseHomeRot.y, z: preciseHomeRot.z, w: preciseHomeRot.w }, true);
        carRbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        carRbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        speed.current = 0;
        steering.current = 0;
        wheels.forEach((w) => {
          w.spinAccumulator = 0;
          w.node.quaternion.copy(w.initialQuat);
        });
      }
      isHoming.current = true;
      setTimeout(() => { isHoming.current = false; }, 2000);
    };
    const handleSwitch = (e: any) => { setCameraMode(e.detail); };
    
    // Free Explore Handlers
    const handleStartExplore = () => setExploreActive(true);
    const handleCancelExplore = () => {
      setExploreActive(false);
      isHoming.current = true;
      setTimeout(() => { isHoming.current = false; }, 2000);
    };
    
    document.addEventListener('cancelDriving', handleCancel);
    document.addEventListener('switchCamera', handleSwitch);
    document.addEventListener('startExplore', handleStartExplore);
    document.addEventListener('cancelExplore', handleCancelExplore);
    return () => {
      document.removeEventListener('cancelDriving', handleCancel);
      document.removeEventListener('switchCamera', handleSwitch);
      document.removeEventListener('startExplore', handleStartExplore);
      document.removeEventListener('cancelExplore', handleCancelExplore);
    };
  }, [wheels]);

  const v = new THREE.Vector3();
  const q = new THREE.Quaternion();

  useFrame((state, delta) => {
    if (mixerRef.current) mixerRef.current.update(delta);
    if (headBone && carRbRef.current && rootGroupRef.current) {
      const pos = carRbRef.current.translation();
      rootGroupRef.current.updateMatrixWorld(true);
      headBone.lookAt(pos.x, pos.y + 0.8, pos.z);
      if (tooltipRef.current && !tooltipClosed.current) {
        const headPos = new THREE.Vector3();
        headPos.setFromMatrixPosition(headBone.matrixWorld);
        tooltipRef.current.position.set(headPos.x, headPos.y + 0.6, headPos.z);
      }
    }

    if (carRbRef.current && carNodes.length > 0) {
      if (trackActive && carRbRef.current.translation().y < -3 && !lockDriveInput.current) {
        lockDriveInput.current = true;
        document.dispatchEvent(new Event('triggerGameOver'));
        speed.current = 0;
        setTimeout(() => {
          if (carRbRef.current) {
            carRbRef.current.setTranslation({ x: 1.5, y: -2.0, z: 0 }, true);
            carRbRef.current.setRotation({ w: 0.92387953, x: 0, y: -0.38268343, z: 0 }, true);
            carRbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
            carRbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
          }
        }, 100);
        setTimeout(() => { lockDriveInput.current = false; }, 3000);
      }

      const { forward, backward, left, right } = getKeys();
      if ((forward || backward) && !tooltipClosed.current && !lockDriveInput.current) {
        if (carRbRef.current && !restCarPos.current) {
           const t = carRbRef.current.translation();
           const r = carRbRef.current.rotation();
           restCarPos.current = { x: t.x, y: t.y, z: t.z };
           restCarRot.current = { w: r.w, x: r.x, y: r.y, z: r.z };
        }
        tooltipClosed.current = true;
        setFaded(true);
        setTrackActive(true);
        document.dispatchEvent(new Event('showDashboard'));
      }

      // Car limits inherently updated
      const accel = 40; 
      const decel = 30;
      const maxSpeed = 100;
      if (forward) speed.current = Math.min(speed.current + accel * delta, maxSpeed); 
      else if (backward) speed.current = Math.max(speed.current - accel * delta, -maxSpeed / 2); 
      else {
        if (speed.current > 0) speed.current = Math.max(0, speed.current - decel * delta);
        if (speed.current < 0) speed.current = Math.min(0, speed.current + decel * delta);
      }
      speed.current = Math.max(-maxSpeed, Math.min(maxSpeed, speed.current));
      const currentVel = carRbRef.current.linvel();
      const maxSteer = Math.PI / 5;
      let targetSteer = 0;
      if (left) targetSteer = -maxSteer;
      if (right) targetSteer = maxSteer;
      steering.current = THREE.MathUtils.lerp(steering.current, targetSteer, 6 * delta);
      const rot = carRbRef.current.rotation();
      q.set(rot.x, rot.y, rot.z, rot.w);
      v.set(-speed.current, 0, 0).applyQuaternion(q);
      carRbRef.current.setLinvel({ x: v.x, y: currentVel.y, z: v.z }, true);
      const angularViscosity = speed.current * steering.current * 0.12;
      carRbRef.current.setAngvel({ x: 0, y: angularViscosity, z: 0 }, true);
      const wheelSpinDelta = -speed.current * delta * 1.5; 
      wheels.forEach((w) => {
        w.spinAccumulator += wheelSpinDelta;
        w.node.quaternion.copy(w.initialQuat);
        if (w.isFront) w.node.rotateZ(steering.current);
        w.node.rotateX(w.spinAccumulator);
      });
      
      if (lockDriveInput.current) {
        carRbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        return;
      }
      
      const pos = carRbRef.current.translation();
      if (orbitRef.current) {
        if (trackActive && !tooltipClosed.current) {
           orbitRef.current.target.copy(pos as any);
        } else if (trackActive) {
          if (!lastCarPos.current) lastCarPos.current = new THREE.Vector3(pos.x, pos.y, pos.z);
          const baseForward = new THREE.Vector3(-1, 0, 0);
          const worldForward = baseForward.applyQuaternion(q).normalize();
          if (cameraMode === 'chase') {
             // Extremely tight wide camera flawlessly shadowing identically right behind the lambo!
             const camOffset = worldForward.clone().multiplyScalar(-3.5).add(new THREE.Vector3(0, 1.2, 0));
             const idealPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(camOffset);
             state.camera.position.lerp(idealPos, 0.15); 
             
             // Track identically ahead of the center chassis realistically!
             const targetPos = new THREE.Vector3(pos.x, pos.y, pos.z).add(worldForward.clone().multiplyScalar(1.0).add(new THREE.Vector3(0, 0.5, 0)));
             orbitRef.current.target.lerp(targetPos, 0.25);
          } else if (cameraMode === 'orbit') {
             const currentFrameLocation = new THREE.Vector3(pos.x, pos.y, pos.z);
             const displacementDelta = new THREE.Vector3().subVectors(currentFrameLocation, lastCarPos.current);
             state.camera.position.add(displacementDelta);
             orbitRef.current.target.copy(currentFrameLocation);
          }
          lastCarPos.current.copy(new THREE.Vector3(pos.x, pos.y, pos.z));
          orbitRef.current.update();
        } else if (isHoming.current) {
          // Use fluid spherical continuous gliding specifically uniquely to mask transitions effectively natively!
          orbitRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 4 * delta);
          state.camera.position.lerp(new THREE.Vector3(0, 1.6, -6.5), 4 * delta);
          orbitRef.current.update();
        } else if (exploreActive) {
           // FREE MODE Override: Zero tracking inherently applied. OrbitControls inherently handles absolute mathematical navigation correctly natively!
        } else {
           const baseTarget = new THREE.Vector3(0, 0, 0);
           orbitRef.current.target.copy(baseTarget);
           state.camera.position.copy(new THREE.Vector3(0, 1.6, -6.5));
           orbitRef.current.update();
        }
      }
    }
  });

  return (
    <>
      <OrbitControls ref={orbitRef} makeDefault enabled={faded} enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 + 0.15} />
      <group ref={rootGroupRef} scale={scale} position={position as any} rotation={rotation as any} dispose={null}>
      {!trackActive && (
        <RigidBody type="fixed" colliders={false} friction={1.5} restitution={0.2}>
          <CuboidCollider position={[0, -0.5, 0]} args={[500, 0.5, 500]} />
        </RigidBody>
      )}
      {envNodes.length > 0 && (
        <group>
          {envNodes.map((node, i) => (
            <primitive key={`env-${i}`} object={node} />
          ))}
        </group>
      )}
      {humanNodes.length > 0 && humanNodes.map((node, i) => <primitive key={`human-${i}`} object={node} />)}
      {carNodes.length > 0 && (
        <RigidBody ref={carRbRef} type="dynamic" colliders="cuboid" mass={100} linearDamping={2} angularDamping={2} enabledRotations={[false, true, false]}>
          {carNodes.map((node, i) => (
            <primitive key={`car-${i}`} object={node} />
          ))}
        </RigidBody>
      )}
      </group>
      <TrackGenerator active={trackActive} />
      <group ref={tooltipRef}>
        <Html center zIndexRange={[100, 0]}>
          <div className={`transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-purple-900/90 text-white border border-fuchsia-400 px-3 py-1.5 rounded-xl shadow-[0_0_10px_rgba(192,38,211,0.3)] font-medium text-[10px] whitespace-nowrap pointer-events-none flex items-center gap-1.5 ${faded ? 'opacity-0 scale-50' : bubbleReady ? 'opacity-100 scale-100 animate-bounce' : 'opacity-0 scale-50 translate-y-4'}`}>
            <span className="text-xs">💬</span> Hey there! Press W to drive!
          </div>
        </Html>
      </group>
    </>
  );
}

export default function ModelViewer({ onLoaded }: { onLoaded?: () => void }) {
  const [dashboardVisible, setDashboardVisible] = useState(false);
  useEffect(() => {
    const handleShow = () => {
      setTimeout(() => setDashboardVisible(true), 1500);
      setTimeout(() => { setDashboardVisible(false); }, 5500);
    };
    const handleCancel = () => { setDashboardVisible(false); };
    document.addEventListener('showDashboard', handleShow);
    document.addEventListener('cancelDriving', handleCancel);
    return () => {
      document.removeEventListener('showDashboard', handleShow);
      document.removeEventListener('cancelDriving', handleCancel);
    };
  }, []);

  return (
    <KeyboardControls map={keyboardMap}>
      <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
        <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-2xl pointer-events-none z-50 text-white flex flex-col gap-3 transition-opacity duration-1000 ease-in-out ${dashboardVisible ? 'opacity-100' : 'opacity-0'}`}>
          <h3 className="text-sm font-black text-purple-400 tracking-widest mb-1 border-b border-purple-400/30 pb-1 uppercase text-center">Controls</h3>
          <div className="flex items-center gap-4">
            <div className="bg-white/10 border border-white/20 rounded-lg shadow w-8 h-8 flex items-center justify-center font-black text-xs">W</div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-purple-200">Accelerate</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 border border-white/20 rounded-lg shadow w-8 h-8 flex items-center justify-center font-black text-xs">S</div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-purple-200">Brake / Rev</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 border border-white/20 rounded-lg shadow w-8 h-8 flex items-center justify-center font-black text-xs">A</div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-purple-200">Steer Left</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/10 border border-white/20 rounded-lg shadow w-8 h-8 flex items-center justify-center font-black text-xs">D</div>
            <div className="flex flex-col">
              <span className="font-bold text-xs text-purple-200">Steer Right</span>
            </div>
          </div>
        </div>

        {/* Elevated Perspective Camera: Lowered and brought much closer to match the screenshot's exact framing and cinematic tight FOV! */}
        <Canvas shadows dpr={[1, 1.5]} gl={{ powerPreference: "high-performance" }} camera={{ position: [0, 1.6, -6.5], fov: 35 }}>
          <Suspense fallback={null}>
            {/* Increased ambient light so the laptop and LED screens are clearly visible! */}
            <ambientLight intensity={0.4} />
            
            {/* Cinematic Lighting Setup */}
            {/* Soft Front Light: Shines directly on the FRONT of the LED screens and character */}
            <directionalLight position={[0, 4, -5]} intensity={1.5} castShadow />
            
            {/* Left Side Light (Red) - Power Lowered for a subtle vibe */}
            <directionalLight position={[10, 0, 0]} color="#ff0044" intensity={2} />
            
            {/* Right Side Light (Blue) - Power Lowered for a subtle vibe */}
            <directionalLight position={[-10, 0, 0]} color="#0066ff" intensity={2} />
            
            {/* Backlight / Rim Light behind the desk - Softened */}
            <directionalLight position={[0, 5, 8]} color="#ffffff" intensity={3} castShadow />

            {/* Subtler environment map */}
            <Environment preset="city" background={false} />
            
            <Physics>
              <CustomModel onLoaded={onLoaded} />
            </Physics>
            
            <ContactShadows resolution={256} scale={10} blur={2.5} opacity={0.5} far={10} color="#000000" />
          </Suspense>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}

// Global optimization: starts downloading the 67MB asset immediately!
useGLTF.preload("/wbe ntitled.glb");
