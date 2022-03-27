/**
 * twoDigitFormat converts single digit numbers such as 3 to "03".
 * If the number contains more than two digits (or characters), such as 12, 2.5, it does nothing.
 */
export const twoDigitFormat = (input: number): string => {
  const inputStr = input.toString(10);
  return inputStr.length === 1 ? `0${inputStr}` : inputStr;
};

/** Generates random colors. */
export const getRandomColor = (): string => {
  // This number will be one of the R, G, B values.
  // It is the component that makes the overall color light.
  const randomLight = randIntBetween(125, 255);
  // The other two components are any random numbers between 0, 255.
  // We are shuffling the array here to make the color even more random.
  const colors = shuffleArray([randomLight, randIntBetween(0, 255), randIntBetween(0, 255)]);
  // Generating a random RGB color.
  return `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
};

/** Provides a random integer between given start and end. Both start and end are inclusive. */
const randIntBetween = (startInclusive: number, endInclusive: number): number => {
  return Math.round(startInclusive + Math.random() * (endInclusive - startInclusive));
};

/** Shuffles the provided array and returns it. */
const shuffleArray = <T>(arr: T[]): T[] => {
  return arr.sort(() => (Math.random() > 0.5 ? 1 : -1));
};
