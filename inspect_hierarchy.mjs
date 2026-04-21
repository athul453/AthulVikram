import { NodeIO } from '@gltf-transform/core';

async function main() {
    const io = new NodeIO();
    try {
        const document = await io.read('public/optimized_safe.glb');
        const root = document.getRoot();
        
        console.log("=== Structure ===");
        const mainNodes = root.listScenes()[0].listChildren();
        for(let node of mainNodes) {
           console.log(`Root Node: ${node.getName()}`);
           for(let child of node.listChildren()) {
               console.log(`  - Child: ${child.getName()}`);
           }
        }
    } catch(e) {
        console.error(e);
    }
}
main();
