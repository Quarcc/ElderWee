import React, { useEffect } from 'react';
import * as THREE from 'three';

const Chain = ({ start, end, scene }) => {
    useEffect(() => {
        const startVector = new THREE.Vector3(start.x, start.y, start.z);
        const endVector = new THREE.Vector3(end.x, end.y, end.z);

        const direction = new THREE.Vector3().subVectors(endVector, startVector);
        const length = direction.length();
        const midPoint = new THREE.Vector3().addVectors(startVector, endVector).divideScalar(2);

        const geometry = new THREE.CylinderGeometry(0.05, 0.05, length, 12);
        const material = new THREE.MeshMatcapMaterial({color: 0xFFFFFF});
        const cylinder = new THREE.Mesh(geometry, material);

        cylinder.position.copy(midPoint);

        // Align cylinder with the direction
        cylinder.quaternion.setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction.clone().normalize()
        );

        scene.add(cylinder);

        return () => {
            scene.remove(cylinder);
        };
    }, [start, end, scene]);

    return null;
}

export default Chain;