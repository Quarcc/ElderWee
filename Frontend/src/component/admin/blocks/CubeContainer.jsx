import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import CubeText from './CubeText';
import Chain from './Chain';

const CubesContainer = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.OrthographicCamera());
    const rendererRef = useRef(new THREE.WebGLRenderer({ alpha: true }));

    useEffect(() => {
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const renderer = rendererRef.current;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        const fixed = 10;
        const cubeSpacing = 2;
        const sceneWidth = fixed * cubeSpacing;
        
        const adjustCameraAndView = () =>{ 
            const aspectRatio = window.innerWidth / window.innerHeight;
            const viewWidth = sceneWidth + cubeSpacing;
            const viewHeight = viewWidth / aspectRatio;

            camera.left = -viewWidth / 15;
            camera.right = viewWidth;
            camera.top = viewHeight / 8;
            camera.bottom = -viewHeight;
            camera.near = 0.1;
            camera.far = 1000;
            camera.position.z = 100;
            camera.updateProjectionMatrix();
            
            renderer.render(scene, camera);
        }
        
        window.addEventListener('resize', adjustCameraAndView);

        adjustCameraAndView();

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
            window.removeEventListener('resize', adjustCameraAndView);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);


    const dataLength = 20;
    const cubeSpacing = 2;

    const cubePositions = Array.from({ length: dataLength }, (_, idx) => ({
        x: idx * cubeSpacing,
        y: 0,
        z: 0
    }))
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    return (
        <div style={{width: '100%', height: '100%', overflow: 'auto' }}>
            <div ref={mountRef} style={{ width: `${dataLength * cubeSpacing}px`, height: '100%', position: 'relative' }}>
                {cubePositions.map((pos,idx) => (
                    <CubeText key={idx} position={pos} textFront={`Cube ${idx + 1}`} textBack={`Back`} textTop={`Top`} textBot={`Bottom`} textLeft={`Left`} textRight={`Right`} url={`https://localhost:3000/${idx+1}`} scene={scene} renderer={renderer} camera={camera}></CubeText>
                ))}
                {cubePositions.map((pos, idx) => (
                    idx < cubePositions.length - 1 && (
                        <Chain key={`chain-${idx}`} start={pos} end={cubePositions[idx + 1]} scene={scene}></Chain>
                    )
                ))}
            </div>
        </div>
        
    );
};

export default CubesContainer;