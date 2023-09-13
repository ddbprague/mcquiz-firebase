import McQuizMatchModel from "./mcQuizMatchModel";

/**
 * McQuiz Rewards DB.
 *
 */
export default class McQuizRewardModel {
  private readonly baseCollection: string;
  private readonly locale: string;

  /**
   *
   * @param {string} baseCollection
   * @param {string} locale
   */
  constructor(
      baseCollection: string,
      locale: string
  ) {
    this.baseCollection = baseCollection;
    this.locale = locale;
  }


  /**
   * Get reward with match ID.
   *
   * @param {any} matchId Match ID.
   * @return {Promise<DocumentSnapshot<DocumentData>>}
   */
  public async getRewards(
      matchId: string
  ) {
    try {
      const mcQuizMatchModelApp = new McQuizMatchModel(
          this.baseCollection
      );

      const match = await mcQuizMatchModelApp.getMatch(matchId);

      if (!match.exists) {
        return null;
      }

      const data = match.data();
      const rewardLocal = this.locale === "sk"? "rewardsSk" : "rewardsCz";

      return data && data[rewardLocal].get();
    } catch (e) {
      throw new Error("Failed to get reward! ->" + e);
    }
  }


  /**
   * Get reward with match ID and player ID.
   *
   * @param {string} matchId Match ID.
   * @param {string} playerId Player ID.
   * @param {number} playerPosition Player Position.
   * @param {number} playerTotalAnswers Total Answer.
   * @return {Promise<DocumentSnapshot<DocumentData>>}
   */
  public async getRewardWithPlayerId(
      matchId: string,
      playerId: string,
      playerPosition: number,
      playerTotalAnswers: number
  ) {
    if (!playerTotalAnswers) {
      return null;
    }

    try {
      const mcQuizMatchModelApp = new McQuizMatchModel(
          this.baseCollection
      );

      const match = await mcQuizMatchModelApp.getMatch(matchId);
      if (!match.exists) {
        return null;
      }

      const data = match.data();

      const rewardLocal = this.locale === "sk"? "rewardsSk" : "rewardsCz";
      const reward = data && await data[rewardLocal].get();

      if (!reward || !reward.exists) {
        return null;
      }

      const rewardData = reward.data();

      return {
        loyaltyId: rewardData.loyaltyId,
        reward: playerPosition > 100? rewardData.standardReward : rewardData.premiumReward,
      };
    } catch (e) {
      throw new Error("Failed to get reward! ->" + e);
    }
  }
}
