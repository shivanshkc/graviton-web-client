// This needs to be adjusted as per the FPS.
export const gravitationalConstant = 100;

// fps is the number of times the game updates in a second.
// Somehow, the simulation is more accurate with higher FPS.
export const fps = 10000;
// deltaTime is the delay between two consecutive frames.
// So, clearly, it is the inverse of FPS.
// It is multiplied by 1000 to convert to milliseconds.
export const deltaTime = 1000 / fps;

export const defaultDotDiameter = 10;
export const maxDotDiameter = 100;

export const defaultDotMass = 1;

// When a dot is being created, its mass and size increase with this factor every frame.
export const defaultIncrementRatio = 0.03;
