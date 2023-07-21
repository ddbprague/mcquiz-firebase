import {firestore} from "firebase-admin";
import * as _ from "lodash";
import DocumentReference = firestore.DocumentReference;
import DocumentData = firestore.DocumentData;
import {Timestamp} from "firebase-admin/firestore";

/**
 *  Player score calculator.
 *  Return the calculated score for
 *  on player.
 *
 * @param {string} choiceKey Player chosen choice key.
 * @param {FirebaseFirestore.DocumentData} questionChoicesData
 * Question Choices data.
 * @param {number} playerBeforeCount Nb of Players who already answer.
 * @param {number} firstAnswerScore Score for first place.
 * @param {number} correctAnswerScore Normal score for good answer.
 * @param {number} wrongAnswerScore NNormal score wrong answer.
 * @return {{
 * _id: string,
 * name: string,
 * score: number,
 * correctAnswers: number,
 * wrongAnswers: number
 * }} Calculated player score.
 */
export const scoreForPlayer = (
    choiceKey: string,
    questionChoicesData: FirebaseFirestore.DocumentData,
    playerBeforeCount: number,
    firstAnswerScore: number,
    correctAnswerScore: number,
    wrongAnswerScore: number
) => {
  const playerScore = {
    score: 0,
    correctAnswers: 0,
    wrongAnswers: 1,
  };

  if (
    choiceKey === (
      questionChoicesData.choices.find(
          (choice: { isCorrect: boolean }) => choice.isCorrect
      ) || {}
    )._key
  ) {
    playerScore.correctAnswers = 1;
    playerScore.wrongAnswers = 0;
    playerScore.score = calculateCorrectScore(
        playerBeforeCount, correctAnswerScore, firstAnswerScore
    );
  } else {
    playerScore.score = calculateWrongScore(
        playerBeforeCount, wrongAnswerScore
    );
  }

  return playerScore;
};

/**
 *  Score by player calculator.
 *
 *
 * @param {{
 *       questionKey: string,
 *       choices: {
 *         _key: string,
 *         isCorrect: boolean
 *       }[]
 *     }[]} questions
 * Array of questions with choices.
 * @param {{
 *       playerId: string,
 *       playerName: string,
 *       playerRef: DocumentReference<firestore.DocumentData>,
 *       questionKey: string,
 *       selectedChoiceKey: string,
 *       questionsRef: DocumentReference<DocumentData>,
 *       addedOn: Timestamp
 *    }[]} answers
 * Array of Answers.
 * @param {number} firstAnswerScore Score for first place.
 * @param {number} correctAnswerScore  Normal score for good answer.
 * @param {number} wrongAnswerScore  Normal score wrong answer.
 * @return {{
 * _id: string,
 * name: string,
 * score: number,
 * wrongAnswers: number,
 * correctAnswers: number
 * }[]}
 * Calculated scores for each player.
 */
export const scoresByPlayer = (
    questions: {
      questionKey: string,
      choices: {
        _key: string,
        isCorrect: boolean
      }[]
    }[],
    answers: {
      playerId: string,
      playerName: string,
      playerRef: DocumentReference<firestore.DocumentData>,
      questionKey: string,
      selectedChoiceKey: string,
      questionRef: DocumentReference<DocumentData>,
      addedOn: Timestamp
    }[],
    firstAnswerScore: number,
    correctAnswerScore: number,
    wrongAnswerScore: number,
) => {
  // Get all players by answers
  const players = _.uniqBy(answers, "playerId")
      .map(({playerId, playerName}) => ({
        _id: playerId,
        name: playerName,
      }));

  if (players.length === 0) {
    return [];
  }

  const questionsCount = questions.length;

  // Prime the return array
  const playersWithScores = players.map(({name, _id}) => ({
    _id,
    name,
    // position: 0,
    score: 0,
    correctAnswers: 0,
    wrongAnswers: questionsCount,
  }));

  // begin with all answers to this questions
  questions.forEach((question) => {
    answers &&
    answers
    // 1 - only correct answers to this question remain
        .filter(
            (answer) => answer.questionKey === question.questionKey
        )
    // 3 - loop into selected answers
        .forEach(
            (
                answer,
                index: number
            ) => {
              // 4 - Find the correct player for this answer
              const correctPlayer = playersWithScores.find(
                  (player) => player._id === answer.playerId
              );

              // 5 - Prepare score
              if (correctPlayer) {
                const questionChoices = question.choices;

                // Mutate player score based on placing
                if (
                  answer.selectedChoiceKey === (
                    questionChoices.find(
                        (choice) => choice.isCorrect
                    ) || {}
                  )._key
                ) {
                  // boom
                  correctPlayer.score =
                    correctPlayer.score + calculateCorrectScore(
                        index + 1, correctAnswerScore, firstAnswerScore
                    );
                  correctPlayer.correctAnswers =
                    correctPlayer.correctAnswers + 1;
                  correctPlayer.wrongAnswers =
                    correctPlayer.wrongAnswers - 1;
                } else {
                  correctPlayer.score =
                    correctPlayer.score + calculateWrongScore(
                        index + 1, wrongAnswerScore
                    );
                }
              }
            }
        );
  });

  return playersWithScores;
};


/**
 *  Calculate the score for player with
 *  correct answer.
 *
 * @param {number} placing Position of this player.
 * @param {number} correctAnswerScore Score if correct answer.
 * @param {number}  firstAnswerScore Score if first place.
 * @return {number} Score for this player.
 */
const calculateCorrectScore = (
    placing: number,
    correctAnswerScore: number,
    firstAnswerScore: number
) => {
  return correctAnswerScore + firstAnswerScore / placing;
};


/**
 *  Calculate the score for player with wrong answer.
 *
 * @param {number} placing Position of this player.
 * @param {number} wrongAnswerScore Score if correct answer.
 * @return {number} Score for this player.
 */
const calculateWrongScore = (
    placing: number,
    wrongAnswerScore: number
) => {
  return wrongAnswerScore / placing;
};

