import fs from 'fs';
import * as THREE from 'three';
// We need to use a glTF loader in Node. To do this simply, we could just read the buffer if it's GLB, 
// but it's easier to just use standard three.js utilities if we have a loader, or we can just read the JSON chunk of the GLB directly!
const filePath = './public/wbe ntitled.glb';

try {
  const buffer = fs.readFileSync(filePath);
  
  // Parse GLB
  const magic = buffer.toString('utf8', 0, 4);
  if (magic !== 'glTF') throw new Error('Not a GLB file');
  
  const version = buffer.readUInt32LE(4);
  const length = buffer.readUInt32LE(8);
  
  const jsonChunkLength = buffer.readUInt32LE(12);
  const jsonChunkType = buffer.toString('utf8', 16, 20);
  
  if (jsonChunkType !== 'JSON') throw new Error('First chunk is not JSON');
  
  const jsonChunkData = buffer.slice(20, 20 + jsonChunkLength);
  const gltf = JSON.parse(jsonChunkData.toString('utf8'));
  
  console.log("----- GLB Animations -----");
  if (gltf.animations) {
    gltf.animations.forEach((anim, i) => {
      console.log(`Animation ${i}: ${anim.name}`);
    });
  } else {
    console.log("No animations array found.");
  }

  console.log("\n----- GLB Nodes (Looking for Doors) -----");
  const doors = [];
  if (gltf.nodes) {
    gltf.nodes.forEach(node => {
      if (node.name && node.name.toLowerCase().includes('door')) {
        doors.push(node.name);
      }
    });
  }
  console.log(doors.length > 0 ? doors : "No door nodes found.");

} catch (e) {
  console.error("Failed to parse GLB", e);
}
