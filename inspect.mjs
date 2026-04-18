import { NodeIO } from '@gltf-transform/core';

async function main() {
    const io = new NodeIO();
    try {
        const document = await io.read('public/wbe ntitled.glb');
        const root = document.getRoot();
        
        console.log("=== Node Names ===");
        const nodes = root.listNodes();
        nodes.forEach((n, i) => {
            console.log(`Node: "${n.getName()}"`);
        });

        console.log("=== Mesh Names ===");
        const meshes = root.listMeshes();
        meshes.forEach((n, i) => {
            console.log(`Mesh: "${n.getName()}"`);
        });
        console.log("=== Animation Names ===");
        const animations = root.listAnimations();
        animations.forEach((a, i) => {
            console.log(`Animation: "${a.getName()}"`);
        });
    } catch(e) {
        console.error(e);
    }
}
main();
