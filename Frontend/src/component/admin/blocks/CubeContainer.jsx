import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import CubeText from './CubeText';
import Chain from './Chain';

const CubesContainer = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000));
    const rendererRef = useRef(new THREE.WebGLRenderer());

    useEffect(() => {
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const renderer = rendererRef.current;

        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        camera.position.z = 5;

        const animate = () => {
            requestAnimationFrame(animate);
            scene.traverse((child) => {
                if(child.isMesh && child.geometry.type === 'ExtrudeGeometry'){
                    child.rotation.x += 0.005;
                    child.rotation.y += 0.005;
                }
            });
            renderer.render(scene, camera);
        };

        animate();

        return () => {
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    const dataLength = 3;

    const cubePositions = Array.from({ length: dataLength }, (_, idx) => ({
        x: idx * 2,
        y: 0,
        z: 0
    }))
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    return (
        <div ref={mountRef}>
            {cubePositions.map((pos,idx) => (
                <CubeText key={idx} position={pos} textFront={`Cube ${idx + 1}`} textBack={`Back`} textTop={`Top`} textBot={`Bottom`} textLeft={`Left`} textRight={`Right`} url={`https://localhost:3000/${idx+1}`} scene={scene} renderer={renderer} camera={camera}></CubeText>
            ))}
            <Chain start={cubePositions[0]} end={cubePositions[dataLength - 1]} scene={scene}></Chain>
        </div>
    );
};

export default CubesContainer;