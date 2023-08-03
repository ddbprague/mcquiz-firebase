import McQuizMatchModel from "./model/mcQuizMatchModel";
import McQuizPlayersModel from "./model/mcQuizPlayersModel";

/**
 * McQuiz Match Extension
 *
 */
export class McQuizPlayersStatisticsApp {
  private readonly matchModel: McQuizMatchModel;
  private readonly playersModel: McQuizPlayersModel;

  private readonly locale: string;
  private readonly playerId: string;
  private readonly matchId: string;

  private playersStatistics: any[];
  private totalPlayers: number;

  private readonly scorePath: string;
  private readonly correctAnswersPath: string;
  private readonly wrongAnswersPath: string;

  /**
   *
   * @param {string} baseCollection Base collection.
   * @param {string} locale Language.
   * @param {string} playerId Id of the Player.
   * @param {string} matchId Id  of the Match.
   */
  constructor(
      baseCollection: string,
      locale: string,
      playerId: string,
      matchId: string,
  ) {
    this.matchModel = new McQuizMatchModel(baseCollection);
    this.playersModel = new McQuizPlayersModel(baseCollection, locale);

    this.locale = locale;
    this.playerId = playerId;
    this.matchId = matchId;

    this.playersStatistics = [];
    this.totalPlayers = 0;
    this.scorePath = this.matchId ? "score" : "totalScore";
    this.correctAnswersPath = this.matchId ? "correctAnswers" : "totalCorrectAnswers";
    this.wrongAnswersPath = this.matchId ? "wrongAnswers" : "totalWrongAnswers";
  }

  /**
   * initialisation of the app
   *
   * @return {boolean}
   */
  async init() {
    console.log("-== Start Players Statistics ==-");

    await this.processPlayersStatistics();

    console.log("-== Tasks Over ==-");

    return {
      playersStatistics: this.playersStatistics.filter((element) => element !== undefined),
      totalPlayers: this.totalPlayers,
    };
  }

  /**
   * Prepare and return players statistics
   *
   */
  private async processPlayersStatistics(
  ) {
    console.log("-= processPlayerStatistics =-");
    const playersSnapshot =
    this.matchId?
    await this.matchModel.getMatchPlayers(this.matchId, this.locale, "score", "desc") :
    await this.playersModel.getPlayers("totalScore", "desc");

    this.totalPlayers = playersSnapshot.docs.length;


    let position = 0;

    // 1- Prepare first 10 players
    this.playersStatistics = await Promise.all(
        playersSnapshot.docs.map(async (playerDoc) => {
          const isPlayer = playerDoc.id === this.playerId;

          console.log("start player", this.totalPlayers, playerDoc.id);

          position++;

          const playerStatistics = await this.prepareData(playerDoc, isPlayer, position);

          console.log("stop player", this.totalPlayers, playerDoc.id);

          return playerStatistics;
        })
    );
  }

  /**
   * Prepare players statistics data
   *
   * @param {FirebaseFirestore.DocumentData} playerDoc Document.
   * @param {boolean} isPlayer Is the player.
   * @param {number} position
   *
   */
  private async prepareData(
      playerDoc: FirebaseFirestore.DocumentData,
      isPlayer: boolean,
      position: number
  ) {
    console.log("-= prepareData =-");

    if (position <= 10 || isPlayer) {
      const playerData = playerDoc.data();

      console.log(playerData.score);

      const playerInfoData = this.matchId? await this.getPlayerInfoData(playerDoc.id) : null;

      if (this.matchId && !playerInfoData) {
        return;
      }

      const avatar = this.matchId? playerInfoData?.avatar : playerData?.avatar;
      const totalCorrectAnswers = playerData[this.correctAnswersPath];
      const totalWrongAnswers = playerData[this.wrongAnswersPath];

      console.log(position, playerData[this.scorePath]);

      return {
        isPlayer,
        nickname: this.matchId? playerInfoData?.nickname: playerData?.nickname,
        avatar: avatar? avatar : "big-mac",
        position: position,
        score: playerData[this.scorePath],
        totalAnswers: this.matchId ? totalCorrectAnswers + totalWrongAnswers : playerData.totalQuestions,
        totalCorrectAnswers: playerData[this.correctAnswersPath],
        totalWrongAnswers: playerData[this.wrongAnswersPath],
      };
    }

    return;
  }

  /**
   * Get player avatar;
   *
   * @param {string} playerId Player Id.
   *
   */
  private async getPlayerInfoData(
      playerId: string
  ) {
    console.log("-= getPlayerInfo =-");

    const player = await this.playersModel.getPlayer(
        playerId.toString(),
    );

    return player && player.exists? player.data() : null;
  }
}
