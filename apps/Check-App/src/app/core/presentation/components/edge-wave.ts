// * Genera el trazo del borde para una amplitud dada (0 = línea recta).
export type EdgePath = (amplitude: number) => string;

// * Borde vertical (sidebar): 4 curvas en un viewBox de 40x100 con la línea en x=20.
// `amplitude` desplaza los puntos de control alternando lado, lo que forma la onda.
export const verticalEdge: EdgePath = (amplitude) => {
    const out = 20 + amplitude;
    const back = 20 - amplitude;
    return `M20 0 C${out} 8 ${out} 17 20 25 C${back} 33 ${back} 42 20 50 C${out} 58 ${out} 67 20 75 C${back} 83 ${back} 92 20 100`;
};

// * Borde horizontal (barra inferior): la misma onda girada, en un viewBox de 100x20 con la línea en y=10.
export const horizontalEdge: EdgePath = (amplitude) => {
    const out = 10 + amplitude;
    const back = 10 - amplitude;
    return `M0 10 C8 ${out} 17 ${out} 25 10 C33 ${back} 42 ${back} 50 10 C58 ${out} 67 ${out} 75 10 C83 ${back} 92 ${back} 100 10`;
};

// * Cada número es un fotograma de la onda: amplitud en px, alternando signo para que ondule y se amortigüe.
export const edgeWave = (path: EdgePath, amplitudes: number[]) => ({
    values: amplitudes.map(path).join(';'),
    keyTimes: amplitudes.map((_, i) => i / (amplitudes.length - 1)).join(';'),
    keySplines: amplitudes.slice(1).map(() => '0.45 0 0.55 1').join(';'),
});
