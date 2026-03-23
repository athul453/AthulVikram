import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useRef, useEffect } from "react";
import * as THREE from "three";

function CustomModel() {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF("/Athul3d.glb");
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Play the first animation found
    if (names.length > 0) {
      actions[names[0]]?.reset().fadeIn(0.5).play();
    }
  }, [actions, names]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} scale={3} position={[0, -3.8, 0]} />
    </group>
  );
}

export default function ModelViewer() {
  return (
    <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0, 4], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          <Environment preset="city" />
          
          <CustomModel />
          
          {/* Controls to rotate with mouse swipe */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
          />
          <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.4} far={10} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
