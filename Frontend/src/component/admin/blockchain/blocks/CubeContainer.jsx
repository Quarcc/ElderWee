import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import CubeText from './CubeText';
import Chain from './Chain';

const CubesContainer = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.OrthographicCamera());
    const rendererRef = useRef(new THREE.WebGLRenderer({ alpha: true }));

    const dataLength = 9;
    const cubeSpacing = 2;

    useEffect(() => {
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        const renderer = rendererRef.current;

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setClearColor(0x000000, 0);
        mountRef.current.appendChild(renderer.domElement);

        const fixed = 8;
        const cubeSpacing = 2;
        const sceneWidth = fixed * cubeSpacing;

        const adjustCameraAndView = () =>{ 
            const aspectRatio = window.innerWidth / window.innerHeight;
            const viewWidth = sceneWidth + cubeSpacing;
            const viewHeight = viewWidth / aspectRatio;

            camera.left = -viewWidth / 20;
            camera.right = viewWidth;
            camera.top = viewHeight / 8;
            camera.bottom = -viewHeight;
            camera.near = 0.1;
            camera.far = 1000;
            camera.position.z = 100;
            camera.updateProjectionMatrix();

            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.render(scene, camera);
        }

        const animate = (time) => {
            requestAnimationFrame(animate);
            scene.traverse((child) => {
                if(child.isMesh && child.geometry.type === 'ExtrudeGeometry'){
                    child.rotation.x = time / 1500;
                    child.rotation.y = time / 1500;
                }
            });
            renderer.render(scene, camera);
        };

        window.addEventListener('resize', adjustCameraAndView);
        adjustCameraAndView();
        animate();

        return () => {
            window.removeEventListener('resize', adjustCameraAndView);
            mountRef.current.removeChild(renderer.domElement);
        };
    }, []);

    useEffect(() => {
        const calculateMultiple = (dataLength) => {
            if (dataLength < 50){
                return 1 + Math.floor(dataLength / 10) * 0.175;
            }
            else if (50 < dataLength < 60){
                return 1 + Math.floor(dataLength / 10) * 0.125;
            }
            else if (60 < dataLength < 100){
                return 1 + Math.floor(dataLength / 10) * 0.1;
            }
            
        }

        const handleKeyDown = (event) => {
            const camera = cameraRef.current;
            const moveDistance = 0.5;

            const minX = 0;
            if (dataLength == 9 || dataLength == 10){
                const maxX = 5;
                switch (event.key) {
                case 'ArrowLeft':
                    camera.position.x = Math.max(minX, camera.position.x - moveDistance);
                    break;
                case 'ArrowRight':
                    camera.position.x = Math.min(maxX, camera.position.x + moveDistance);
                    break;
                default:
                    break;
                }
            }
            else{
                const maxX = dataLength * calculateMultiple(dataLength);

                switch (event.key) {
                    case 'ArrowLeft':
                        camera.position.x = Math.max(minX, camera.position.x - moveDistance);
                        break;
                    case 'ArrowRight':
                        camera.position.x = Math.min(maxX, camera.position.x + moveDistance);
                        break;
                    default:
                        break;
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };

    }, []);

    const cubePositions = Array.from({ length: dataLength }, (_, idx) => ({
        x: idx * cubeSpacing,
        y: 0,
        z: 0
    }))
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    return (
        <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: `${dataLength * cubeSpacing}px`, height: '100%', position: 'relative' }}>
                {cubePositions.map((pos,idx) => (
                    <CubeText key={idx} position={pos} textFront={`Cube ${idx + 1}`} textBack={'Back'} textTop={'Top'} textBot={'Bottom'} textLeft={'Left'} textRight={'Right'} url={`https://localhost:3000/${idx+1}`} scene={scene} renderer={renderer} camera={camera}></CubeText>
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