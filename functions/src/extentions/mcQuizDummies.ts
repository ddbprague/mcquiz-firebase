import McQuizMatchModel from "./model/mcQuizMatchModel";
import McQuizPlayersModel from "./model/mcQuizPlayersModel";
import McQuizQuestionModel from "./model/mcQuizQuestionModel";
import {McQuizPlayerAnswerApp} from "./mcQuizPlayerAnswer";
import {dummiesData} from "./inc/mcQuizDummiesData";
import {HttpsError} from "firebase-functions/v2/https";
import {DocumentData} from "firebase-admin/lib/firestore";
import {firestore} from "firebase-admin";
import DocumentReference = firestore.DocumentReference;

/**
 * McQuiz Dummies Extension.
 *
 */
export class McQuizDummies {
  private readonly matchModel: McQuizMatchModel;
  private readonly playersModel: McQuizPlayersModel;
  private readonly questionModel: McQuizQuestionModel;
  private matchData: FirebaseFirestore.DocumentData | undefined;
  private readonly maxNewPlayers: number;
  private readonly firstAnswerScore: number;
  private readonly correctAnswerScore: number;
  private readonly wrongAnswerScore: number;
  private readonly matchId: string;

  /**
   * @param {number} maxNewPlayers Max players created
   * @param {number} firstAnswerScore Bonus points for the first answer.
   * @param {number} correctAnswerScore Points for correct answer.
   * @param {number} wrongAnswerScore Points for wrong answer.
   */
  constructor(
      maxNewPlayers: number,
      firstAnswerScore: number,
      correctAnswerScore: number,
      wrongAnswerScore: number,
  ) {
    this.matchModel = new McQuizMatchModel("development");
    this.playersModel = new McQuizPlayersModel("development", "cz");
    this.questionModel = new McQuizQuestionModel("development");
    this.maxNewPlayers = maxNewPlayers;
    this.firstAnswerScore = firstAnswerScore;
    this.correctAnswerScore = correctAnswerScore;
    this.wrongAnswerScore = wrongAnswerScore;
    this.matchId = "Szqo689CJeCoLqXsatN8";
  }

  /**
   * Create new player.
   *
   */
  async create() {
    console.log("Start!");
    const match = await this.matchModel.getMatch(this.matchId);

    if (!match.exists) {
      throw new HttpsError(
          "failed-precondition", "Match id does not exist!"
      );
    }

    this.matchData = match.data();

    for (let i = 1; i <= this.maxNewPlayers; i++) {
      console.log("Create player STARTED #", i);
      await this.createNewPlayer();
      console.log("Create player FINISHED #", i);
    }

    console.log("Done!");
  }

  /**
   * Create new dummy player document in players and players document in match.
   *
   */
  async createNewPlayer() {
    const playerId = dummiesData().generateRandomName(20);
    const playerNickname = dummiesData().generateRandomName(5);

    // Create player
    await this.playersModel.createNewPlayer(
        playerId,
        playerNickname,
        "bakery",
        "0010001",
        "Dum",
        "My",
        `${playerNickname}@dummy.com`,
        "938495883",
        "qsmldoej88çslj",
        "false"
    );

    console.log("New player created ---> ", playerId);

    await this.matchModel.matchSubscribePlayer(
        this.matchId,
        playerId,
        "cz"
    );

    // Create answers for this player
    await this.createNewAnswers(playerId, playerNickname);
  }

  /**
   * Create new dummy answers in answers document in match.
   *
   * @param {string} playerId Player ID
   * @param {string} playerNickname  Player name
   */
  async createNewAnswers(
      playerId: string,
      playerNickname: string,
  ) {
    await Promise.all(
        this.matchData && this.matchData.questions.map(async (question: DocumentReference<DocumentData>) => {
          const questionRef = await this.questionModel.getQuestion(question);

          if (!questionRef.exists) {
            throw new Error("Question doesn't exist!");
          }

          const questionChoicesRef = await this.questionModel.getQuestionChoices(questionRef.id, "cz");

          if (!questionChoicesRef.exists) {
            throw new Error("Question choices doesn't exist!");
          }

          const questionChoicesData = questionChoicesRef.data();
          const questionChoicesCount = questionChoicesData?.choices.length;
          const selectedChoiceKey =
          questionChoicesData?.choices[dummiesData().getRandomChoiceKey(questionChoicesCount)]._key;

          try {
            const McQuizMatchModel =
            new McQuizPlayerAnswerApp(
                "development",
                "cz",
                playerId,
                playerNickname,
                this.matchId,
                questionRef.id,
                selectedChoiceKey,
                this.firstAnswerScore,
                this.correctAnswerScore,
                this.wrongAnswerScore
            );

            await McQuizMatchModel.init();
          } catch (e) {
            throw new HttpsError(
                "internal", "Failed to save player answer! ->" + e
            );
          }
        })
    );
  }
}
