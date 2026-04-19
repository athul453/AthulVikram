import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, KeyboardControls, useKeyboardControls, useAnimations, Html } from "@react-three/drei";
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

// We pass an optional onLoaded callback into the custom model so we can notify the overarching loading screen when the WebGL geometry has officially materialized into visual existence!
function CustomModel({ onLoaded }: { onLoaded?: () => void }) {
  const { scene: rawScene, animations } = useGLTF("/wbe ntitled.glb");
  const scene = useMemo(() => SkeletonUtils.clone(rawScene), [rawScene]);
  const [, getKeys] = useKeyboardControls();
  const carRbRef = useRef<any>(null);
  const orbitRef = useRef<any>(null);
  
  // 45-degree Home Page Restored perfectly!
  // Lowered Y to -2.0 so the car nicely sits under the typography!
  const position = [1.5, -2.0, 0];
  const rotation = [0, -Math.PI / 4, 0];
  const scale = 150;

  // Guarantee the heavy 67MB initial WebGL paint finishes before clearing standard HTML UI loaders!
  useEffect(() => {
    if (onLoaded) onLoaded();
  }, [onLoaded]);

  // Since we detach elements from the scene to use inside RigidBodies,
  // we must rebuild the animation mixer directly on the separated Armature (human) node!
  const [envNodes, humanNodes, carNodes, headBone] = useMemo(() => {
    const car: THREE.Object3D[] = [];
    const human: THREE.Object3D[] = [];
    let head: THREE.Object3D | null = null;
    const env: THREE.Object3D[] = [];

    scene.children.forEach(child => {
      const n = child.name.toLowerCase();
      // Group both the Skeleton/Rig and the Skinned Meshes for the Car together
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
        // Specifically grab the true Head bone and ignore the non-deforming top nub!
        if (child.isBone && bn.includes('head') && !bn.includes('top') && !bn.includes('end')) {
          head = child;
        }
      });
    });

    return [env, human, car, head];
  }, [scene]);

  // Use a global root group ref to serve as the master AnimationMixer root
  const rootGroupRef = useRef<THREE.Group>(null);

  // Handle Animations globally from the root group which surrounds all detached objects
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useLayoutEffect(() => {
    // Only initialize the mixer and play tracks AFTER the react layout mounts the items inside rootGroupRef
    if (rootGroupRef.current && animations.length > 0) {
      if (!mixerRef.current) {
        mixerRef.current = new THREE.AnimationMixer(rootGroupRef.current);
      }
      
      animations.forEach((clip) => {
        try {
          // Play all tracks locally bound inside this master group!
          mixerRef.current!.clipAction(clip).play();
        } catch (e) {}
      });
      // Force evaluate the 0th frame immediately to prevent T-pose flash natively
      mixerRef.current.update(0);

      // SYNCHRONOUSLY evaluate Head Bone world matrix and bind the Speech Bubble position 
      // BEFORE paint! This absolutely eliminates the split-second HTML mounting delay!
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

  // Ref for power code physics (acceleration and steering)
  const speed = useRef(0);
  const steering = useRef(0);
  
  // UI Prompt & Camera Lock References
  const tooltipRef = useRef<any>(null);
  const tooltipClosed = useRef(false);
  const isHoming = useRef(false); // Flag strictly used to auto-pilot the camera back to homepage, then reliquish control to visitor!
  const restCarPos = useRef<{ x: number, y: number, z: number } | null>(null); // Dynamic capture state of exact physics rest pose!
  const restCarRot = useRef<{ w: number, x: number, y: number, z: number } | null>(null);
  const [faded, setFaded] = useState(false);
  const [bubbleReady, setBubbleReady] = useState(false);

  // Intentionally sequence the Speech Bubble to pop in beautifully AFTER the 1.5s global diorama fade-in finishes!
  useEffect(() => {
    const t = setTimeout(() => setBubbleReady(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Search exclusively for anything resembling a wheel or tire exactly once
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
    
    // Prevent double-transforming by only animating bones if present, otherwise meshes.
    return hasBones ? list.filter(l => l.node.isBone) : list.filter(l => l.node.isMesh || l.node.type === 'Group');
  }, [scene]);

  // Listen for cancel event to snap back to the initial homepage view!
  useEffect(() => {
    const handleCancel = () => {
      tooltipClosed.current = false;
      setFaded(false);
      
      // We perfectly securely restore the identical resting coordinates that the car achieved dynamically before we drove!
      const preciseHomePos = { x: 1.5, y: -2.0, z: 0 };
      const preciseHomeRot = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -Math.PI / 4, 0));
      
      if (carRbRef.current) {
        carRbRef.current.setTranslation(restCarPos.current || preciseHomePos, true);
        carRbRef.current.setRotation(restCarRot.current || { x: preciseHomeRot.x, y: preciseHomeRot.y, z: preciseHomeRot.z, w: preciseHomeRot.w }, true);
        carRbRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true);
        carRbRef.current.setAngvel({ x: 0, y: 0, z: 0 }, true);
        speed.current = 0;
        steering.current = 0;
        
        // Critically, we must also zero out all visual wheel spun-offsets so they don't stay twisted!
        wheels.forEach((w) => {
          w.spinAccumulator = 0;
          w.node.quaternion.copy(w.initialQuat);
        });
      }
      
      // Enact a 2-second cinematic auto-pilot to glide the camera majestically back into framing, then UNLOCK!
      isHoming.current = true;
      setTimeout(() => {
        isHoming.current = false;
      }, 2000);
    };
    
    document.addEventListener('cancelDriving', handleCancel);
    return () => document.removeEventListener('cancelDriving', handleCancel);
  }, [wheels]);

  const v = new THREE.Vector3();
  const q = new THREE.Quaternion();

  useFrame((state, delta) => {
    // 1. Unified Animation Update
    if (mixerRef.current) mixerRef.current.update(delta);

    // Dynamic Head Tracking
    if (headBone && carRbRef.current && rootGroupRef.current) {
      const pos = carRbRef.current.translation();
      
      // Crucial IK step: Force update the skeleton's world matrices after the animation updates it!
      rootGroupRef.current.updateMatrixWorld(true);

      // Look smoothly at the car's approximate roof height
      headBone.lookAt(pos.x, pos.y + 0.8, pos.z);

      // Track the UI Speech Bubble to the physical head coordinates perfectly!
      if (tooltipRef.current && !tooltipClosed.current) {
        const headPos = new THREE.Vector3();
        headPos.setFromMatrixPosition(headBone.matrixWorld);
        tooltipRef.current.position.set(headPos.x, headPos.y + 0.6, headPos.z);
      }
    }

    // 2. Powerful Car Driving Logic
    if (carRbRef.current && carNodes.length > 0) {
      const { forward, backward, left, right } = getKeys();

      // Cleanly vanish the Speech Bubble once they press W or S to drive and trigger the Controls Guide!
      if ((forward || backward) && !tooltipClosed.current) {
        // Absolutely incredibly important constraint: We snapshot the exact immutable physics posture directly before they start driving!
        // We MUST manually deep clone the WASM vectors because Rapier mutates the live references!
        if (carRbRef.current && !restCarPos.current) {
           const t = carRbRef.current.translation();
           const r = carRbRef.current.rotation();
           restCarPos.current = { x: t.x, y: t.y, z: t.z };
           restCarRot.current = { w: r.w, x: r.x, y: r.y, z: r.z };
        }
        
        tooltipClosed.current = true;
        setFaded(true); // Trigger a smooth CSS fade out
        document.dispatchEvent(new Event('showDashboard'));
      }

      const maxSpeed = 30;
      const accel = 20;
      const decel = 15;

      // Acceleration logic: Forward is positive speed for easier math
      if (forward) {
        speed.current += accel * delta; 
      } else if (backward) {
        speed.current -= accel * delta; 
      } else {
        // Friction / Deceleration
        if (speed.current > 0) speed.current = Math.max(0, speed.current - decel * delta);
        if (speed.current < 0) speed.current = Math.min(0, speed.current + decel * delta);
      }
      speed.current = Math.max(-maxSpeed, Math.min(maxSpeed, speed.current));

      const currentVel = carRbRef.current.linvel();

      // Smoother Cinematic Steering Logic using Lerp interpolation!
      const maxSteer = Math.PI / 5; // Slightly deeper turn angle
      let targetSteer = 0;
      if (left) targetSteer = -maxSteer;
      if (right) targetSteer = maxSteer;
      
      // Smoothly wind / unwind the steering wheel over time
      steering.current = THREE.MathUtils.lerp(steering.current, targetSteer, 6 * delta);

      // Apply forward velocity based on car's orientation (X-axis Forward)
      const rot = carRbRef.current.rotation();
      q.set(rot.x, rot.y, rot.z, rot.w);
      v.set(-speed.current, 0, 0).applyQuaternion(q);
      
      carRbRef.current.setLinvel({ x: v.x, y: currentVel.y, z: v.z }, true);

      // Apply natural angular velocity! Turn arc is a pure equation: Speed * SteeringAngle
      // This mathematically guarantees perfectly smooth arcs, eliminating the jagged drifting jumps!
      const angularViscosity = speed.current * steering.current * 0.12;
      carRbRef.current.setAngvel({ x: 0, y: angularViscosity, z: 0 }, true);

      // Wheel Spin and Steer Animations
      const wheelSpinDelta = -speed.current * delta * 1.5; 

      wheels.forEach((w) => {
        w.spinAccumulator += wheelSpinDelta;

        // Reset to original zero-spin orientation from GLTF
        w.node.quaternion.copy(w.initialQuat);

        // Apply Steering FIRST to preserve pivot axis! (Z is the vertical pivot for these wheels)
        if (w.isFront) {
          w.node.rotateZ(steering.current);
        }

        // Apply Spin SECOND
        w.node.rotateX(w.spinAccumulator);
      });
      
      // Dynamic Active Camera Control (Interactive Gameplay enabled globally!)
      const pos = carRbRef.current.translation();
      if (orbitRef.current) {
        if (tooltipClosed.current) {
          // DRIVING MODE: Dynamic Side-Scrolling Tracking with FULL MOUSE CONTROL!
          // We lock the target natively to the car, but let the visitor drag their mouse 360 degrees around to view it dynamically!
          const targetOffset = new THREE.Vector3(0, 0.5, 0);
          targetOffset.applyQuaternion(q).add(pos);
          
          orbitRef.current.target.lerp(targetOffset, 5 * delta);
        } else if (isHoming.current) {
          // HOME PAGE AUTO-PILOT RETURN:
          // For exactly 2 seconds after hitting "Cancel", we dynamically puppet the cursor back to the perfect actual 0-center layout!
          orbitRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 3 * delta);
          state.camera.position.lerp(new THREE.Vector3(0, 1.6, -6.5), 3 * delta);
          
          // CRITICAL FIX: Synchronize internal OrbitControls spherical matrices perfectly so damping momentum doesn't override it!
          orbitRef.current.update();
        } else {
           // HOMEPAGE: Completely rigidly locked as per user request!
           // Absolute mathematical clamp enforcing 100.00% pixel-perfect matching on Exit!
           const baseTarget = new THREE.Vector3(0, 0, 0);
           orbitRef.current.target.copy(baseTarget);
           state.camera.position.copy(new THREE.Vector3(0, 1.6, -6.5));
           orbitRef.current.update(); // Forces the internal engine to adopt the exact exact frame geometry!
        }
      }
    }
  });

  return (
    <>
      {/* FULLY UNLOCKED STRICTLY ONLY DURING DRIVING MODE! */}
      <OrbitControls ref={orbitRef} makeDefault enabled={faded} enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 + 0.15} />
      <group ref={rootGroupRef} scale={scale} position={position as any} rotation={rotation as any} dispose={null}>
      {/* 
        Invisible Flat Floor Physics Collider! 
        This perfectly smooth 1000x1000 plane stops the car flawlessly at Y=0.
        By setting colliders={false} on the body and providing a manual CuboidCollider, it stays 100% invisible.
      */}
      <RigidBody type="fixed" colliders={false} friction={1.5} restitution={0.2}>
        <CuboidCollider position={[0, -0.5, 0]} args={[500, 0.5, 500]} />
      </RigidBody>

      {/* Static Environmental Visuals (Physics removed to prevent bumpy trimesh driving!) */}
      {envNodes.length > 0 && (
        <group>
          {envNodes.map((node, i) => (
            <primitive key={`env-${i}`} object={node} />
          ))}
        </group>
      )}

      {/* Human Mesh */}
      {humanNodes.length > 0 && humanNodes.map((node, i) => <primitive key={`human-${i}`} object={node} />)}

      {/* Car Mesh wrapped in Dynamic Body */}
      {carNodes.length > 0 && (
        <RigidBody ref={carRbRef} type="dynamic" colliders="cuboid" mass={100} linearDamping={2} angularDamping={2} enabledRotations={[false, true, false]}>
          {carNodes.map((node, i) => (
            <primitive key={`car-${i}`} object={node} />
          ))}
        </RigidBody>
      )}
      </group>

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
      setDashboardVisible(true);
      // Exactly 1 second guide as requested
      setTimeout(() => {
        setDashboardVisible(false);
      }, 1000);
    };
    
    const handleCancel = () => {
      setDashboardVisible(false);
    };
    
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
        
        {/* Right Side Game Controls Overlay - Extremely miniaturized for cleanliness */}
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
