/**
 * McQuiz Dummies Extension
 *
 * @return {{
 * generateRandomName: (function(*): string),
 * generateAnswer: (function(*): object)
 * }}
 */
export function dummiesData() {
  /**
   * Generate a random name
   *
   * @param {number} maxLetters
   * @return {String} Random name
   */
  const generateRandomName = (maxLetters: number) => {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    let name = "";

    for (let i = 0; i < maxLetters; i++) {
      name = name + alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return name;
  };

  const getRandomChoiceKey = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  return {
    generateRandomName,
    getRandomChoiceKey,
  };
}
