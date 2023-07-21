/**
 * Waiting.
 * @param {number} ms Time in MS.
 * @return {Promise} Sleep.
 * */
export function sleep(ms: number) {
  console.log("Waiting " + ms + " ms");
  return new Promise((resolve) => setTimeout(resolve, ms));
}

