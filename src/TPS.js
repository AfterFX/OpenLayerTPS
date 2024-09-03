// src/TPS.js
export function createKMatrix(points) {
    const n = points.length;
    const K = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const r2 = Math.pow(points[i][0] - points[j][0], 2) + Math.pow(points[i][1] - points[j][1], 2);
                K[i][j] = r2 * Math.log(r2 + 1e-10);
            }
        }
    }
    return K;
}

export function createPMatrix(points) {
    const n = points.length;
    const P = Array.from({ length: n }, () => [1, 0, 0]);
    for (let i = 0; i < n; i++) {
        P[i][1] = points[i][0];
        P[i][2] = points[i][1];
    }
    return P;
}

export function createLMatrix(K, P) {
    const n = K.length;
    const L = Array.from({ length: n + 3 }, () => Array(n + 3).fill(0));

    // Top left is K
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            L[i][j] = K[i][j];
        }
    }

    // Top right is P
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < 3; j++) {
            L[i][n + j] = P[i][j];
        }
    }

    // Bottom left is P^T
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < n; j++) {
            L[n + i][j] = P[j][i];
        }
    }

    return L;
}

export function solveSystem(L, V) {
    const n = L.length;
    const augmentedMatrix = L.map((row, i) => row.concat(V[i]));
    for (let i = 0; i < n; i++) {
        let maxRow = i;
        for (let k = i + 1; k < n; k++) {
            if (Math.abs(augmentedMatrix[k][i]) > Math.abs(augmentedMatrix[maxRow][i])) {
                maxRow = k;
            }
        }
        [augmentedMatrix[i], augmentedMatrix[maxRow]] = [augmentedMatrix[maxRow], augmentedMatrix[i]];

        for (let k = i + 1; k < n; k++) {
            const factor = augmentedMatrix[k][i] / augmentedMatrix[i][i];
            for (let j = i; j < n + 1; j++) {
                augmentedMatrix[k][j] -= factor * augmentedMatrix[i][j];
            }
        }
    }

    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        x[i] = augmentedMatrix[i][n] / augmentedMatrix[i][i];
        for (let k = i - 1; k >= 0; k--) {
            augmentedMatrix[k][n] -= augmentedMatrix[k][i] * x[i];
        }
    }
    return x;
}

export function computeTPSCoefficients(sourcePoints, targetPoints) {
    const K = createKMatrix(sourcePoints);
    const P = createPMatrix(sourcePoints);
    const L = createLMatrix(K, P);

    const Vx = targetPoints.map(p => p[0]).concat([0, 0, 0]);
    const Vy = targetPoints.map(p => p[1]).concat([0, 0, 0]);

    const coefficientsX = solveSystem(L, Vx);
    const coefficientsY = solveSystem(L, Vy);

    return [coefficientsX, coefficientsY];
}

export function applyTPSTransformation(coeffs, sourcePoints, targetPoint) {
    const n = sourcePoints.length;
    let [coeffsX, coeffsY] = coeffs;

    let x = coeffsX[n] + coeffsX[n + 1] * targetPoint[0] + coeffsX[n + 2] * targetPoint[1];
    let y = coeffsY[n] + coeffsY[n + 1] * targetPoint[0] + coeffsY[n + 2] * targetPoint[1];

    for (let i = 0; i < n; i++) {
        const r2 = Math.pow(targetPoint[0] - sourcePoints[i][0], 2) + Math.pow(targetPoint[1] - sourcePoints[i][1], 2);
        const U = r2 * Math.log(r2 + 1e-10);
        x += coeffsX[i] * U;
        y += coeffsY[i] * U;
    }

    return [x, y];
}
