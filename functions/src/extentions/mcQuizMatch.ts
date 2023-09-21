import McQuizMatchModel from "./model/mcQuizMatchModel";
import {sleep} from "../helper/sleep";
import {Timestamp, FieldValue, DocumentData} from "firebase-admin/firestore";
import McQuizQuestionModel from "./model/mcQuizQuestionModel";
import {firestore} from "firebase-admin";
import DocumentReference = firestore.DocumentReference;

/**
 * McQuiz Match Extension.
 *
 */
export class McQuizMatchApp {
  private readonly matchModel: McQuizMatchModel;
  private readonly questionModel: McQuizQuestionModel;

  private readonly secondsAdded: number;
  private readonly minutesLobbyOpened: number;
  private readonly debugMode: boolean;

  /**
   *
   * @param {number} secondsAdded Second before the match should start.
   * @param {number} minutesLobbyOpened Minute lobby is opened.
   * @param {string} env
   * @param {boolean} debugMode
   */
  constructor(
      secondsAdded: number,
      minutesLobbyOpened: number,
      env: string,
      debugMode= false
  ) {
    this.matchModel = new McQuizMatchModel(env);
    this.questionModel = new McQuizQuestionModel(env);

    this.secondsAdded = secondsAdded;
    this.minutesLobbyOpened = minutesLobbyOpened;
    this.debugMode = debugMode;
  }

  /**
   * Initialisation of the app.
   *
   */
  async init() {
    console.log("Start task");
    const tasks =
    !this.debugMode? await this.matchModel.getNextMatch(
        this.secondsAdded, this.minutesLobbyOpened
    ) :
    await this.matchModel.getAllMatch();

    await Promise.all(tasks.docs.map(async (snapshotMatch) => {
      console.log("-== Proceed Match ==-");
      await this.processMatch(snapshotMatch);
      console.log("-== Match Over ==-");
    }));

    console.log("-== Tasks Over ==-");
  }

  /**
   * Process data match.
   * If one match is on the waiting list.
   *
   * @param {QueryDocumentSnapshot<DocumentData>} snapshotMatch Match snapshot.
   */
  private async processMatch(
      snapshotMatch:
      FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>
  ) {
    // Update status to ready to avoid game being launched 2 times
    await this.matchModel.updateStatus(snapshotMatch, {
      "status": "ready",
      "isLocked": true,
    });

    // Get Match data
    const data = snapshotMatch.data();

    // Prepare questions for the match
    const totalQuestions = data.questions.length;
    const questions = [];

    for (const questionRef of data.questions) {
      const questionData = await this.prepareQuestionData(questionRef);
      questions.push(questionData);
    }

    // Calculate remaining time before starting
    const {seconds, nanoseconds} = data.startingAt;
    const lobbyStartingAt = new Date(new Timestamp(parseInt(seconds), parseInt(nanoseconds)).toMillis());
    const now = new Date();
    const matchStartingAt =
      new Date(new Date(lobbyStartingAt).setMinutes(lobbyStartingAt.getMinutes() + this.minutesLobbyOpened));
    const timeRemainingMs = matchStartingAt.getTime() - now.getTime();
    const resultTimeLimit = data.resultTimeLimit * 1000;

    // Sleep until the game start
    if (timeRemainingMs > 0) await sleep(timeRemainingMs);

    // --> Alright, starting the game!
    await this.proceedGame(
        snapshotMatch,
        questions,
        resultTimeLimit,
        totalQuestions
    );
  }

  /**
   * Actions during the game.
   *
   * @param {QueryDocumentSnapshot<DocumentData>} snapshotMatch
   * @param {DocumentData[]} questions Questions for this match.
   * @param {number} resultTimeLimit Limit of time for results of this match.
   * @param {number} totalQuestions Total question for this match.
   */
  private async proceedGame(
      snapshotMatch: FirebaseFirestore.QueryDocumentSnapshot,
      questions: DocumentData[],
      resultTimeLimit: number,
      totalQuestions: number,
  ) {
    await this.matchModel.updateStatus(
        snapshotMatch,
        {
          status: "playing",
          synchroData: {
            isStarted: true,
            currentQuestionNumber: 1,
            isResult: false,
            matchOver: false,
          },
        }
    );

    // Loop into questions
    for (const [index, question] of questions.entries()) {
      // Start question

      const questionNumber = index + 1;

      // Waiting the end of the question time
      await sleep(question.timeLimit * 1000);

      // Update isResult
      await this.matchModel.updateStatus(
          snapshotMatch,
          {
            "synchroData.isResult": true,
          }
      );

      // Waiting the end of the result time
      await sleep(resultTimeLimit);

      if (totalQuestions === questionNumber) {
        // Match over, update status and synchroData

        // Score finished, send final status.
        await this.matchModel.updateStatus(
            snapshotMatch,
            {
              "status": "completed",
              "synchroData.matchOver": true,
              "isLocked": false,
            }
        );
      } else {
        // Switch to next question
        await this.matchModel.updateStatus(
            snapshotMatch,
            {
              "synchroData.currentQuestionNumber": FieldValue.increment(1),
              "synchroData.isResult": false,
            }
        );
      }
    }

    return true;
  }

  /**
   * Prepare questions data.
   *
   * @param {DocumentReference<DocumentData>} questionRef Question ref.
   * @return {Array}
   */
  private async prepareQuestionData(
      questionRef: DocumentReference<DocumentData>,
  ) {
    const question = await this.questionModel.getQuestion(questionRef);
    const questionData = question.data();

    if (!questionData) return [];

    return questionData;
  }
}
