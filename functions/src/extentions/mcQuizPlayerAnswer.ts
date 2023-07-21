import McQuizMatchModel from "./model/mcQuizMatchModel";
import McQuizQuestionModel from "./model/mcQuizQuestionModel";
import McQuizPlayersModel from "./model/mcQuizPlayersModel";
import {scoreForPlayer} from "./inc/mcQuizScoresCalculator";

/**
 * McQuiz Match Extension
 *
 */
export class McQuizPlayerAnswerApp {
  private readonly matchModel: McQuizMatchModel;
  private readonly questionModel: McQuizQuestionModel;
  private readonly playersModel: McQuizPlayersModel;

  private readonly locale: string;
  private readonly playerId: string;
  private readonly playerName: string;
  private readonly matchId: string;
  private readonly questionKey: string;
  private readonly choiceKey: string;
  private readonly firstAnswerScore: number;
  private readonly correctAnswerScore: number;
  private readonly wrongAnswerScore: number;

  /**
   *
   * @param {string} env Environment
   * @param {string} locale Language
   * @param {string} playerId Id of the Player
   * @param {string} playerName Name of the Player
   * @param {string} matchId Id  of the Match
   * @param {string} questionKey Id / Key  of the Question
   * @param {string} choiceKey Id / Key of the questionChoice
   * @param {number} firstAnswerScore Bonus points for the first answer
   * @param {number} correctAnswerScore Points for correct answer
   * @param {number} wrongAnswerScore Points for wrong answer
   */
  constructor(
      env: string,
      locale: string,
      playerId: string,
      playerName: string,
      matchId: string,
      questionKey: string,
      choiceKey: string,
      firstAnswerScore: number,
      correctAnswerScore: number,
      wrongAnswerScore: number,
  ) {
    this.matchModel = new McQuizMatchModel(env);
    this.questionModel = new McQuizQuestionModel(env);
    this.playersModel = new McQuizPlayersModel(env, locale);

    this.locale = locale;
    this.playerId = playerId;
    this.playerName = playerName;
    this.matchId = matchId;
    this.questionKey = questionKey;
    this.choiceKey = choiceKey;
    this.firstAnswerScore = firstAnswerScore;
    this.correctAnswerScore = correctAnswerScore;
    this.wrongAnswerScore = wrongAnswerScore;
  }

  /**
   * initialisation of the app
   *
   * @return {boolean}
   */
  async init() {
    console.log("-== Start Player Answer ==-");

    // 1 -- Create player answer
    await this.matchModel.createPlayerAnswer(
        this.playerId,
        this.playerName,
        this.matchId,
        this.questionKey,
        this.choiceKey,
        this.locale,
    );

    // 2 -- Update answer stat for this question
    await this.matchModel.updateQuestionAnswerStatistics(
        this.matchId,
        this.questionKey,
        this.choiceKey,
        this.locale
    );

    // 3 -- Calculate score for player
    await this.processPlayerScore();

    console.log("-== Tasks Over ==-");
    return true;
  }

  /**
   * Prepare and save player score
   *
   */
  private async processPlayerScore(
  ) {
    console.log("-= processPlayerScore =-");

    // 1 -- Get number of players who answer before
    const playerBeforeCount =
      await this.matchModel.countPlayersAnswerQuestion(
          this.matchId,
          this.questionKey,
          this.locale
      );
    const questionChoices =
      await this.questionModel.getQuestionChoices(
          this.questionKey,
          this.locale
      );
    const questionChoicesData = questionChoices.data();

    if (questionChoicesData) {
      const score = scoreForPlayer(
          this.choiceKey,
          questionChoicesData,
          playerBeforeCount,
          this.firstAnswerScore,
          this.correctAnswerScore,
          this.wrongAnswerScore,
      );

      await this.matchModel.updatePlayerMatchScore(
          this.matchId,
          this.playerId,
          score,
          this.locale
      );

      await this.playersModel.updatePlayerStatistics(
          this.matchId,
          this.playerId,
          score
      );
    }
  }
}
