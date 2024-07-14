import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import RoundedBlock from './roundedblock';
import Text from './text';

const CubeText = ({ position, textFront, textBack, textTop, textBot, textLeft, textRight, url, scene, renderer, camera }) =>{
    const cubeRef = useRef(null);

    useEffect(() => {
        // Creating the cube
        const geometry = RoundedBlock(1, 1, 1, 0.1, 10);
        let materialColor = 0x0080FF;
        if (textLeft.includes("Pending")) {
            materialColor = 0xFF0000;
        };
        const material = new THREE.MeshMatcapMaterial({ color: materialColor });
        const cube = new THREE.Mesh(geometry, material);

        cube.position.set(position.x, position.y, position.z);
        cubeRef.current = cube;
        scene.add(cube);

        // Adding text
        const addText = async (text, position, rotation) => {
            const textMesh = await Text(text, { size: 0.12, depth: 0.02, color: 0xFFFFFF });
            textMesh.position.set(position.x, position.y, position.z);
            textMesh.rotation.set(rotation.x, rotation.y, rotation.z);
            cube.add(textMesh);
        };

        // Front face
        addText(textFront, { x: 0, y: 0, z: 0.55 }, { x: 0, y: 0, z: 0 });
        // Back face
        addText(textBack, { x: 0, y: 0, z: -0.55 }, { x: 0, y: Math.PI, z: 0 });
        // Top face
        addText(textTop, { x: 0, y: 0.55, z: 0 }, { x: -Math.PI / 2, y: 0, z: 0 });
        // Bottom face
        addText(textBot, { x: 0, y: -0.55, z: 0 }, { x: Math.PI / 2, y: 0, z: 0 });
        // Left face
        addText(textLeft, { x: -0.55, y: 0, z: 0 }, { x: 0, y: -Math.PI / 2, z: 0 });
        // Right face
        addText(textRight, { x: 0.55, y: 0, z: 0 }, { x: 0, y: Math.PI / 2, z: 0 });

        const handleCubeClick = () => {
            window.location.href = url; // Redirect to the specific url
        };

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        const onMouseMove = (event) => {
            event.preventDefault();

            // Calculate mouse position in normalized device coordinates
            const rect = renderer.domElement.getBoundingClientRect();
            mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(cubeRef.current);

            if(intersects.length > 0) {
                cubeRef.current.cursor = 'pointer';
            }
            else{
                cubeRef.current.cursor = 'auto';
            }
        };

        const onClick = (event) => {
            raycaster.setFromCamera(mouse, camera);

            const intersects = raycaster.intersectObject(cubeRef.current);

            if(intersects.length > 0) {
                handleCubeClick();
            }; 
        };

        window.addEventListener('mousemove', onMouseMove, false);
        window.addEventListener('click', onClick, false);

        return() => {
            scene.remove(cube);
            window.removeEventListener('mousemove', onMouseMove, false);
            window.removeEventListener('click', onClick, false);
        };
    }, [position, textFront, textBack, textTop, textBot, textLeft, textRight, url, scene, renderer, camera]);

    return null;
};

export default CubeText;
