import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import CubeText from './CubeText';
import Chain from './Chain';

extend({OrbitControls});

const Controls = () => {
    const { camera, gl } = useThree();
    const controls = useRef();
    useFrame(() => controls.current.update());
    return <orbitControls ref={controls} args={[camera, gl.domElement]}/>;
};

const CubesContainer = ({ dataLength,  blockData }) => {
    const sceneRef = useRef();
    const cameraRef = useRef();
    const rendererRef = useRef();
    const [scene, setScene] = useState(new THREE.Scene());

    useEffect(() => {
        if (cameraRef.current) {
            const aspect = window.innerWidth / window.innerHeight;
            cameraRef.current.left = -aspect * 10;
            cameraRef.current.right = aspect * 10;
            cameraRef.current.top = 10;
            cameraRef.current.bottom = -10;
            cameraRef.current.updateProjectioinMatrix();
            cameraRef.current.position.set(0, 0, 10);
        }
    }, []);

    const blocks = Array.from({ length: dataLength }, (_, i) => {
        const position = { x: i*2, y: 0, z: 0};
        return(
            <CubeText key={`Block ${i}`} position={position} textFront={`Block ${i}`} textBack={`Back ${i}`} textTop={`Top ${i}`} textBot={`Bottom ${i}`} textLeft={`Left ${i}`} textRight={`Right ${i}`} url={blockData[i]?.url || '#'} scene={scene} renderer={rendererRef.current} camera={cameraRef.current} />
        );
    });

    const chains = Array.from({ length: dataLength - 1}, (_, i) => {
        const start = { x: i*2, y: 0, z: 0};
        const end = { x: (i+1) * 2, y: 0, z: 0};
        return <Chain key={`Chain ${i}`} start={start} end={end} scene={scene} />;
    });

    return (
        <Canvas orthographic camera = {{  left: -window.innerWidth / 2, right: window.innerWidth / 2, top: window.innerHeight / 2, bottom: -window.innerHeight / 2, near: -1000, far: 1000, position: [0, 0, 10] }}
        onCreated={({gl, scene, camera}) => {
            rendererRef.current = gl;
            sceneRef.current = scene;
            cameraRef.current = camera;
            setScene(scene);
        }}
        style={{ width: `${dataLength * 200}px`, heigh: '100vh' }}> // Dynamic canvas width based on the number of blocks
         <Controls />
         <ambientLight />
         <pointLight position={[10, 10, 10]} />
         {blocks}
         {chains}
        </Canvas>
    );
};

export default CubesContainer;