const possibleColors = ['red', 'green', 'blue', 'cyan', 'yellowgreen', 'magenta', 'purple', 'teal', 'violet'];

/** Generates random hex colors. */
export const getRandomColor = (): string => {
  return possibleColors[Math.floor(Math.random() * possibleColors.length)];
};
