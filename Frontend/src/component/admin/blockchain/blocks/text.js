import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader';
import { TextGeometry }  from 'three/examples/jsm/geometries/TextGeometry';

const Text = (text, options) => {
    return new Promise((resolve, reject) => {
        const loader = new FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', (font) => {
            const textGeometry = new TextGeometry(text, {
                font: font,
                size: options.size || 0.1, // Adjust font size
                depth: options.depth || 0.1,
                curveSegments: options.curveSegments || 12,
                bevelEnabled: options.bevelEnabled || false, //  true for outlines
                bevelThickness: options.bevelThickness || 0.1, // thickness of outlines
                bevelSize: options.bevelSize || 0.02, // size of outline
                bevelOffset: options.bevelOffset || 0,
                bevelSegments: options.bevelSegments || 5,
            });
            textGeometry.center();
            const textMaterial = new THREE.MeshBasicMaterial({ color: options.color || 0xFFFFFF});
            const textMesh = new THREE.Mesh(textGeometry, textMaterial);
            resolve(textMesh);
        })
    })
}

export default Text;