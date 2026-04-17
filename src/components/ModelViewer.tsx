import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, KeyboardControls, useKeyboardControls, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { Physics, RigidBody, CuboidCollider } from "@react-three/rapier";
import { useControls } from "leva";

const keyboardMap = [
  { name: "forward", keys: ["ArrowUp", "KeyW"] },
  { name: "backward", keys: ["ArrowDown", "KeyS"] },
  { name: "left", keys: ["ArrowLeft", "KeyA"] },
  { name: "right", keys: ["ArrowRight", "KeyD"] },
];

function CustomModel() {
  const { scene, animations } = useGLTF("/athul wbe with car Untitled.glb");
  const [, getKeys] = useKeyboardControls();
  const carRbRef = useRef<any>(null);
  const orbitRef = useRef<any>(null);

  // We need to restore original Scale and Position
  const { position, rotation, scale } = useControls({
    position: [0, -1, 0],
    rotation: [0, 0, 0],
    scale: 150,
  });

  // Since we detach elements from the scene to use inside RigidBodies,
  // we must rebuild the animation mixer directly on the separated Armature (human) node!
  const [envNodes, humanNode, carNode] = useMemo(() => {
    let car = null;
    let human = null;
    const env: THREE.Object3D[] = [];

    scene.children.forEach(child => {
      if (child.name === 'Car Rig.001' || child.name.includes("Car")) {
        car = child;
      } else if (child.name === 'Armature' || child.name.includes("avaturn")) {
        human = child;
      } else {
        env.push(child);
      }
    });

    return [env, human, car];
  }, [scene]);

  // Handle Animations specifically on the detached Human Node
  const mixer = useMemo(() => {
    return humanNode ? new THREE.AnimationMixer(humanNode) : null;
  }, [humanNode]);

  useEffect(() => {
    if (mixer && animations.length > 0) {
      animations.forEach((clip) => {
        try {
          mixer.clipAction(clip).play();
        } catch (e) {
          console.warn("Clip could not be played on humanNode", e);
        }
      });
      mixer.timeScale = 1;
    }
    return () => {
      if (mixer) mixer.stopAllAction();
    };
  }, [mixer, animations]);

  // Ref for power code physics (acceleration and steering)
  const speed = useRef(0);
  const steering = useRef(0);

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

  const v = new THREE.Vector3();
  const q = new THREE.Quaternion();

  useFrame((state, delta) => {
    // 1. Human Animation Update
    if (mixer) {
      mixer.update(delta);
    }

    // 2. Powerful Car Driving Logic
    if (carRbRef.current && carNode) {
      const { forward, backward, left, right } = getKeys();

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

      // Steering Logic (Fixed inversion to map correctly with the new X-axis driving!)
      const maxSteer = Math.PI / 6; // Turn sharpness
      const steerSpeed = 3;
      if (left) {
        // Turning Left locally from -X translates to negative angular velocity!
        steering.current = Math.max(-maxSteer, steering.current - steerSpeed * delta);
      } else if (right) {
        // Turning Right is positive angular velocity
        steering.current = Math.min(maxSteer, steering.current + steerSpeed * delta);
      } else {
        // Return steering to center
        steering.current *= 0.8;
      }

      // Apply forward velocity based on car's orientation (X-axis Forward)
      const rot = carRbRef.current.rotation();
      q.set(rot.x, rot.y, rot.z, rot.w);
      v.set(-speed.current, 0, 0).applyQuaternion(q);
      
      const currentVel = carRbRef.current.linvel();
      carRbRef.current.setLinvel({ x: v.x, y: currentVel.y, z: v.z }, true);

      // Apply angular velocity to turn the car itself! (only significantly when moving)
      const movingFactor = Math.min(1, Math.abs(speed.current) / 10);
      if (movingFactor > 0.05) {
        const turnDir = speed.current > 0 ? 1 : -1; // Standard steering physics
        carRbRef.current.setAngvel({ x: 0, y: steering.current * turnDir * 2.5 * movingFactor, z: 0 }, true);
      } else {
        const angVel = carRbRef.current.angvel();
        carRbRef.current.setAngvel({ x: angVel.x * 0.9, y: angVel.y * 0.9, z: angVel.z * 0.9 }, true);
      }

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
      
      // Dynamic Follow / Tracking Camera (Orbit Controls Integration)
      const pos = carRbRef.current.translation();
      if (orbitRef.current) {
        const newTarget = new THREE.Vector3(pos.x, pos.y + 0.5, pos.z);
        // Calculate the translation difference since last frame
        const targetDelta = newTarget.clone().sub(orbitRef.current.target);
        
        // Update both the target and camera position to lock orbit onto the moving car
        orbitRef.current.target.copy(newTarget);
        state.camera.position.add(targetDelta);
      }
    }
  });

  return (
    <>
      <OrbitControls ref={orbitRef} makeDefault enableDamping dampingFactor={0.05} />
      <group scale={scale} position={position as any} rotation={rotation as any} dispose={null}>
      {/* Static Collider Environment */}
      {envNodes.length > 0 && (
        <RigidBody type="fixed" colliders="trimesh">
          {envNodes.map((node, i) => (
            <primitive key={`env-${i}`} object={node} />
          ))}
        </RigidBody>
      )}

      {/* Human Mesh */}
      {humanNode && <primitive object={humanNode} />}

      {/* Car Mesh wrapped in Dynamic Body */}
      {carNode && (
        <RigidBody ref={carRbRef} type="dynamic" colliders="cuboid" mass={100} linearDamping={2} angularDamping={2} enabledRotations={[false, true, false]}>
          <primitive object={carNode} />
        </RigidBody>
      )}
    </group>
    </>
  );
}

export default function ModelViewer() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
        <Canvas shadows camera={{ position: [0, 2.5, 8.5], fov: 50 }}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <Environment preset="city" />
            
            <Physics>
              <CustomModel />
            </Physics>
            
            <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.4} far={10} color="#000000" />
          </Suspense>
        </Canvas>
      </div>
    </KeyboardControls>
  );
}
