/**
 * Algorithm and values from "The Algorithmic Beauty of Plants" by Przemyslaw Prusinkiewicz and Aristid Lindenmayer
 */

import * as THREE from 'Three';
import { vec3, mat4 } from './gl-matrix';
import { MatrixStack } from './matrixStack';
import { Geometry, Face3 } from 'Three/examples/jsm/deprecated/Geometry';

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function TreeModels() {
    const models = [];
    models.push(new TreeGeometry(94.74,
        132.63,
        18.95,
        1.109,
        1.932,
        1.0,
        0.02,
        5,
        6));

    models.push(new TreeGeometry(137.5,
        137.5,
        25.95,
        1.009,
        1.732,
        1.0,
        0.02,
        5,
        6));

    models.push(new TreeGeometry(112.5,
        157.5,
        22.5,
        1.009,
        1.732,
        1.0,
        0.02,
        5,
        6));

    models.push(new TreeGeometry(180.0,
        252.0,
        36.0,
        1.007,
        1.9,
        1.0,
        0.02,
        5,
        6));

    return models;
}

function TreeGeometry(divergenceAngle1,
    divergenceAngle2,
    branchingAngle,
    elongationRate,
    thickenningRate,
    defLen,
    defRadius,
    maxIter,
    radialSegments) {
    this.treeLSystem = new TreeLSystem(divergenceAngle1,
        divergenceAngle2,
        branchingAngle,
        elongationRate,
        thickenningRate,
        defLen,
        defRadius,
        maxIter);

    const radial = radialSegments;
    const geometry = new Geometry();
    let verticesNum = 0;

    this.treeLSystem.root.traverse(node => {
        if (node.parent !== null) {
            const branchDirection = vec3.create();
            vec3.direction(node.parent.position, node.position, branchDirection);
            const r = vec3.create([node.radius, 0.0, 0.0]);
            const n = vec3.create([1.0, 0.0, 0.0]);

            const v = vec3.create();
            vec3.subtract(node.position, node.parent.position, v);
            const texHeight = vec3.length(v) / (node.radius * 6.28);

            node.firstIndex = verticesNum;

            for (var i = 0; i < radial; i += 1) {
                const matrix = mat4.create();
                mat4.identity(matrix);
                mat4.rotate(matrix, degToRad(i * 360.0 / radial), branchDirection);
                const p = vec3.create();
                mat4.multiplyVec3(matrix, r, p);
                const nn = vec3.create();
                mat4.multiplyVec3(matrix, n, nn);
                geometry.vertices.push(new THREE.Vector3(node.position[0] + p[0],
                    node.position[1] + p[1],
                    node.position[2] + p[2]));

                geometry.faces.push(new Face3(node.parent.firstIndex + i,
                    node.firstIndex + i,
                    node.parent.firstIndex + (i + 1) % radial));

                geometry.faces.push(new Face3(node.parent.firstIndex + (i + 1) % radial,
                    node.firstIndex + i,
                    node.firstIndex + (i + 1) % radial));

                const uva = new THREE.Vector2(i * (1 / radial), node.parent.texOffset);
                const uvb = new THREE.Vector2((i + 1) * (1 / radial), node.parent.texOffset);
                const uvc = new THREE.Vector2(i * (1 / radial), node.parent.texOffset + texHeight);
                const uvd = new THREE.Vector2((i + 1) * (1 / radial), node.parent.texOffset + texHeight);

                geometry.faceVertexUvs[0].push([uva, uvc, uvb]);
                geometry.faceVertexUvs[0].push([uvb.clone(), uvc.clone(), uvd]);
            }

            verticesNum += radial;

            node.texOffset = node.parent.texOffset + texHeight;
            node.texOffset -= Math.floor(node.texOffset);
        } else {
            for (var i = 0; i < radial; i += 1) {
                const x = Math.cos(degToRad(i * 360.0 / radial));
                const z = Math.sin(degToRad(i * 360.0 / radial));
                geometry.vertices.push(new THREE.Vector3(node.position[0] + node.radius * x,
                    node.position[1],
                    node.position[2] + node.radius * z));
            }

            verticesNum += radial;
            node.firstIndex = 0;
            node.texOffset = 0.0;
        }
    });

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    this.geometry = geometry.toBufferGeometry();
}

class TreeNode {
    constructor(position, radius) {
        this.parent = null;
        this.position = position;
        this.radius = radius;
        this.children = [];
    }
    addChild(node) {
        this.children.push(node);
        node.parent = this;
    }
    traverse(action) {
        action(this);
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].traverse(action);
        }
    }
}

class TreeLSystem {
    constructor(divergenceAngle1, divergenceAngle2, branchingAngle, elongationRate, thickenningRate, defLen, defRadius, maxIter) {
        this.divergenceAngle1 = divergenceAngle1;
        this.divergenceAngle2 = divergenceAngle2;
        this.branchingAngle = branchingAngle;
        this.elongationRate = elongationRate;
        this.thickenningRate = thickenningRate;
        this.defLen = defLen;
        this.defRadius = defRadius;

        this.maxIter = maxIter;

        this.matrix = new MatrixStack();
        mat4.identity(this.matrix.top);

        this.root = new TreeNode([0, 0, 0], this.radius(0));

        //Trunk
        const newNode = new TreeNode(this.F(this.len(0) * 3), this.radius(0));
        this.root.addChild(newNode);

        this.A(0, newNode);
    }
    len(numIter) {
        let l = this.defLen;
        while (numIter < this.maxIter) {
            l *= this.elongationRate;
            numIter++;
        }
        return l
    }
    radius(numIter) {
        let r = this.defRadius;
        while (numIter < this.maxIter) {
            r *= this.thickenningRate;
            numIter++;
        }
        return r
    }
    F(len) {
        const zeroVec = [0.0, 0.0, 0.0];
        const nextPointPos = vec3.create();
        mat4.translate(this.matrix.top, [0.0, len, 0.0]);

        mat4.multiplyVec3(this.matrix.top, zeroVec, nextPointPos);

        return nextPointPos;
    }
    X(angle) {
        mat4.rotate(this.matrix.top, degToRad(angle), [1, 0, 0]);
    }
    Y(angle) {
        mat4.rotate(this.matrix.top, degToRad(angle), [0, 1, 0]);
    }
    A(numIter, node) {
        if (numIter >= this.maxIter) {
            return;
        }

        const node1 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter));
        node.addChild(node1);

        this.matrix.push();
        this.X(this.branchingAngle);
        const node2 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter + 1));
        node1.addChild(node2);
        this.A(numIter + 1, node2);
        this.matrix.pop();

        this.Y(this.divergenceAngle1);

        this.matrix.push();
        this.X(this.branchingAngle);
        const node3 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter + 1));
        node1.addChild(node3);
        this.A(numIter + 1, node3);
        this.matrix.pop();

        this.Y(this.divergenceAngle2);

        this.matrix.push();
        this.X(this.branchingAngle);
        const node4 = new TreeNode(this.F(this.len(numIter)), this.radius(numIter + 1));
        node1.addChild(node4);
        this.A(numIter + 1, node4);
        this.matrix.pop();
    }
}

export {
    TreeModels
}
