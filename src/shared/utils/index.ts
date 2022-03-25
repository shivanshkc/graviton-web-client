/**
 * @description tc is a try-catch wrapper.
 * @param promise The promise which is to be try-catch-ed.
 */
export const tc = async <T>(promise: Promise<T>): Promise<[undefined, T] | [Error, undefined]> => {
  try {
    return [undefined, await promise];
  } catch (err) {
    return [err as Error, undefined];
  }
};

/**
 * @description sleep returns a promise that resolves after the provided ms.
 *
 * @param ms - The sleep period.
 */
export const sleep = async (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
