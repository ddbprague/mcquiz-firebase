/**
 * Waiting.
 * @param {number} ms Time in MS.
 * @return {Promise} Sleep.
 * */
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

