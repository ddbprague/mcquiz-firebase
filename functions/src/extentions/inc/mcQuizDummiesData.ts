import {firestore} from "firebase-admin";
import {Timestamp} from "firebase-admin/firestore";

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

  /**
   * Create the answer
   *
   * @param {number} questionNumber
   * @param {string} playerId
   * @param {string} playerName
   * @param {DocumentReference} playerRef
   * @param {Firestore} db
   *
   * @return {{
   *   playerId: string,
   *   playerName: string,
   *   playerRef: string,
   *   questionKey: string,
   *   selectedChoiceKey: string,
   *   questionsRef: string,
   * }}
   */
  const generateAnswer = (
      questionNumber: number,
      playerId: string,
      playerName: string,
      playerRef: firestore.DocumentReference,
      db: firestore.Firestore,
  ) => {
    const currentQuestion = questions()[questionNumber];

    return {
      playerId,
      playerName,
      playerRef,
      questionKey: currentQuestion.questionKey,
      selectedChoiceKey: currentQuestion.choices[getRandomChoiceKey(4)]._key,
      questionRef: db.doc("questions/" + currentQuestion.questionKey),
      addedOn: Timestamp.now(),
    };
  };

  const questions = () => {
    return [
      {
        questionKey: "wxxx1ELrNlfT0iIkWLSa",
        choices: [
          {
            _key: "lasenry4ksxvn1kfhj",
            isCorrect: true,

          },
          {
            _key: "lasenry4x1kg4a6alte",
            isCorrect: false,

          },
          {
            _key: "lasenry4tm5kl2pe0vj",
            isCorrect: false,

          },
          {
            _key: "lasenry4k8ktyhty8kq",
            isCorrect: false,

          },
        ],
      },
      {
        questionKey: "gRCzEXmKNuMBFgYrXdRw",
        choices: [
          {
            _key: "lasefmzgv6ifamk9e9",
            isCorrect: true,

          },
          {
            _key: "lasefmzgtzwgbyex3zs",
            isCorrect: false,

          },
          {
            _key: "lasefmzgelrin7uo0km",
            isCorrect: false,

          },
          {
            _key: "lasefmzgkzoh6d8pizd",
            isCorrect: false,

          },
        ],
      },
      {
        questionKey: "740aR3O5W2sDYyZvVoH1",
        choices: [
          {
            _key: "lasbq76s62c71oxz6to",
            isCorrect: true,

          },
          {
            _key: "lasbq76sd72yq0syqh",
            isCorrect: false,

          },
          {
            _key: "lasbq76sq8bse16yenq",
            isCorrect: false,

          },
          {
            _key: "lasbq76srwmamvjljls",
            isCorrect: false,

          },
        ],
      },
    ];
  };

  const getRandomChoiceKey = (max: number) => {
    return Math.floor(Math.random() * max);
  };

  return {
    generateRandomName,
    generateAnswer,
    questions,
  };
}
