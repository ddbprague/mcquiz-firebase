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

  private readonly playersStatistics: any[];
  private totalPlayers: number;
  private position: number;

  private readonly nickname: string;
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
    this.position = 1;
    this.nickname = this.matchId ? "playerNickname" : "nickname";
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

    console.log(this.playersStatistics);
    console.log(this.totalPlayers);

    return {
      playersStatistics: this.playersStatistics,
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
    let playerIncluded = false;

    const playersSnapshot =
    this.matchId?
    await this.matchModel.getMatchPlayers(this.matchId, this.locale, "score", "desc") :
    await this.playersModel.getPlayers("totalScore", "desc");

    // 1- Prepare first 10 players
    await Promise.all(
        playersSnapshot.docs.map(async (playerDoc) => {
          const isPlayer = playerDoc.id === this.playerId;

          await this.prepareData(playerDoc, isPlayer);

          playerIncluded = playerIncluded ? playerIncluded : isPlayer;
          this.totalPlayers++;
        })
    );
  }

  /**
   * Prepare players statistics data
   *
   * @param {FirebaseFirestore.DocumentData} playerDoc Document.
   * @param {boolean} isPlayer Is the player.
   *
   */
  private async prepareData(
      playerDoc: FirebaseFirestore.DocumentData,
      isPlayer: boolean,
  ) {
    console.log("-= prepareData =-");


    if (this.position <= 10 || isPlayer) {
      const playerData = playerDoc.data();

      const avatar = this.matchId? await this.getPlayerAvatar(playerDoc.id) : playerData.avatar;

      const totalCorrectAnswers = playerData[this.correctAnswersPath];
      const totalWrongAnswers = playerData[this.wrongAnswersPath];

      this.playersStatistics.push(
          {
            isPlayer,
            nickname: playerData[this.nickname],
            avatar,
            position: this.position,
            score: playerData[this.scorePath].toFixed(0),
            totalAnswers: this.matchId ? totalCorrectAnswers + totalWrongAnswers : playerData.totalQuestions,
            totalCorrectAnswers: playerData[this.correctAnswersPath],
            totalWrongAnswers: playerData[this.wrongAnswersPath],
            gamesPlayed: playerData.gamesPlayed.length,
          }
      );
    }

    this.position++;
  }

  /**
   * Get player avatar;
   *
   * @param {string} playerId Player Id.
   *
   */
  private async getPlayerAvatar(
      playerId: string
  ) {
    console.log("-= getPlayerAvatar =-");

    const player = await this.playersModel.getPlayer(
        playerId.toString(),
    );

    const playerData = player && player.exists? player.data() : null;

    return playerData && playerData.avatar? playerData.avatar : "big-mac";
  }
}
