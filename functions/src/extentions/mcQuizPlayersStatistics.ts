import McQuizMatchModel from "./model/mcQuizMatchModel";
import McQuizPlayersModel from "./model/mcQuizPlayersModel";
import McQuizRewardModel from "./model/mcQuizRewardModel";

/**
 * McQuiz Match Extension
 *
 */
export class McQuizPlayersStatisticsApp {
  private readonly matchModel: McQuizMatchModel;
  private readonly playersModel: McQuizPlayersModel;
  private readonly rewardModel: McQuizRewardModel;

  private readonly locale: string;
  private readonly playerId: string;
  private readonly matchId: string;
  private readonly withReward: boolean;

  private playersStatistics: any[];
  private totalPlayers: number;
  private playerPosition: number;
  private playerTotalAnswers: number;

  private readonly scorePath: string;
  private readonly correctAnswersPath: string;
  private readonly wrongAnswersPath: string;

  /**
   *
   * @param {string} baseCollection Base collection.
   * @param {string} locale Language.
   * @param {string} playerId Id of the Player.
   * @param {string} matchId Id  of the Match.
   * @param {boolean} withReward Must include player reward.
   */
  constructor(
      baseCollection: string,
      locale: string,
      playerId: string,
      matchId: string,
      withReward: boolean,
  ) {
    this.matchModel = new McQuizMatchModel(baseCollection);
    this.playersModel = new McQuizPlayersModel(baseCollection, locale);
    this.rewardModel = new McQuizRewardModel(baseCollection, locale);

    this.locale = locale;
    this.playerId = playerId;
    this.matchId = matchId;
    this.withReward = withReward;

    this.playersStatistics = [];
    this.totalPlayers = 0;
    this.playerPosition = 0;
    this.playerTotalAnswers = 0;
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
    await this.processPlayersStatistics();

    const playerReward = this.withReward?
     await this.rewardModel.getRewardWithPlayerId(
         this.matchId,
         this.playerId,
         this.playerPosition,
         this.playerTotalAnswers,
     ) : null;

    return {
      playersStatistics: this.playersStatistics.filter((element) => element !== undefined),
      totalPlayers: this.totalPlayers,
      playerReward,
    };
  }

  /**
   * Prepare and return players statistics
   *
   */
  private async processPlayersStatistics(
  ) {
    const playersSnapshot =
      this.matchId?
        await this.matchModel.getMatchPlayers(this.matchId, this.locale, "score", "desc") :
        await this.playersModel.getPlayers("totalScore", "desc");

    this.totalPlayers = playersSnapshot.size;

    let position = 0;
    this.playerPosition = playersSnapshot.size;

    if (this.matchId && !playersSnapshot.size) {
      const playerStatistics = await this.prepareDummyData(this.playerId);
      this.playersStatistics.push(playerStatistics);
    } else {
      let playerInStatistic = false;
      this.playersStatistics = await Promise.all(
          playersSnapshot.docs.map(async (playerDoc) => {
            const isPlayer = playerDoc.id === this.playerId;
            playerInStatistic = playerInStatistic?? isPlayer;
            position++;

            return await this.prepareData(playerDoc, isPlayer, position);
          })
      );
    }
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
    if (position <= 10 || isPlayer) {
      const playerData = playerDoc.data();
      const playerInfoData = this.matchId? await this.getPlayerInfoData(playerDoc.id) : null;

      if (this.matchId && !playerInfoData) {
        return;
      }

      const avatar = this.matchId? playerInfoData?.avatar : playerData?.avatar;
      const totalCorrectAnswers = playerData[this.correctAnswersPath];
      const totalWrongAnswers = playerData[this.wrongAnswersPath];

      if (this.matchId && isPlayer) {
        this.playerTotalAnswers = this.matchId? totalCorrectAnswers + totalWrongAnswers : playerData.totalQuestions;
      }

      if (isPlayer) {
        this.playerPosition = position;
      }

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
   * Prepare player statistics dummy data if no result at all.
   *
   * @param {string} playerId Player ID.
   *
   */
  private async prepareDummyData(
      playerId: string,
  ) {
    const playerInfoData = this.matchId? await this.getPlayerInfoData(playerId) : null;

    if (this.matchId && !playerInfoData) {
      return;
    }

    return {
      isPlayer: true,
      nickname: playerInfoData?.nickname,
      avatar: playerInfoData?.avatar? playerInfoData.avatar : "big-mac",
      position: null,
      score: 0,
      totalAnswers: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
    };
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
    const player = await this.playersModel.getPlayer(
        playerId.toString(),
    );

    return player && player.exists? player.data() : null;
  }
}
