import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import axios from 'axios';

import CubeText from './CubeText';
import Chain from './Chain';

const APIEndPoint = 'localhost:8000';

const getTransactions = async () => {
    const { data } = await axios.get(`http://${APIEndPoint}/api/Blockchain`);
    return data.blockchain;
};

const getLength = async () => {
    const { data } = await axios.get(`http://${APIEndPoint}/api/transactionCount`);
    return data.count;
};

const CubesContainer = () => {
    const mountRef = useRef(null);
    const sceneRef = useRef(new THREE.Scene());
    const cameraRef = useRef(new THREE.OrthographicCamera());
    const rendererRef = useRef(new THREE.WebGLRenderer({ alpha: true }));
    const [transactions, setTransactions] = useState([]);
    const [transactionLength, setTransactionLength] = useState(0);

    const fetchTransactionCount = async () => {
        const data = await getLength();
        setTransactionLength(data);
    };

    fetchTransactionCount();    

    const dataLength = parseInt(transactionLength);
    const cubeSpacing = 2;

    useEffect(() => {

        const fetchTransactions = async () => {
            const data = await getTransactions();
            setTransactions(data.reverse());
        };
        
        fetchTransactions();

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
                    child.rotation.x = time / 2000  ;
                    child.rotation.y = time / 2000;
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
            if (dataLength < 50) {
                return 1 + Math.floor(dataLength / 10) * 0.175;
            } else if (50 < dataLength < 60) {
                return 1 + Math.floor(dataLength / 10) * 0.125;
            } else if (60 < dataLength < 100) {
                return 1 + Math.floor(dataLength / 10) * 0.1;
            }
        };

        const handleKeyDown = (event) => {
            const camera = cameraRef.current;
            const moveDistance = 0.5;

            const minX = 0;
            if (dataLength == 9 || dataLength == 10) {
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
            } else {
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
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [dataLength]);

    const cubePositions = Array.from({ length: dataLength }, (_, idx) => ({
        x: idx * cubeSpacing,
        y: 0,
        z: 0
    }))
    
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    };

    return (
        <div style={{ width: '100%', height: '250px', overflow: 'hidden' }}>
            <div ref={mountRef} style={{ width: `${dataLength * cubeSpacing}px`, height: '100%', position: 'relative' }}>
                {cubePositions.map((pos,idx) => {
                    const transaction = transactions[idx]
                    const transUrl = transaction ? `https://localhost:3000/admin/transaction/details/id/${transaction.data.TransactionID}` : "#";
                    const transID = transaction ? `ID:\n${transaction.data.TransactionID}` : "ID:\nN/A";
                    const transAmt = transaction ? `Amount:\n$${transaction.data.TransactionAmount}` : "Amount:\nN/A";
                    const transStat = transaction ? `Status:\n${transaction.data.TransactionStatus}` : "Status:\nN/A";
                    const transType = transaction ? `Type:\n${transaction.data.TransactionType}` : "Type:\nN/A";
                    const transDate = transaction ? `Date:\n${formatDate(transaction.data.TransactionDate)}` : "Date:\nN/A";
                    
                    return(
                        <CubeText key={idx} position={pos} textFront={transAmt} textBack={'nothing\nhere :)'} textTop={transID} textBot={transDate} textLeft={transStat} textRight={transType} url={transUrl} scene={scene} renderer={renderer} camera={camera}></CubeText>
                    )
                })}
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