import McQuizMatchModel from "./mcQuizMatchModel";

/**
 * McQuiz Questions DB.
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
  public async getReward(
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
   * @param {any} matchId Match ID.
   * @param {any} playerId Player ID.
   * @return {Promise<DocumentSnapshot<DocumentData>>}
   */
  public async getRewardWithPlayerId(
      matchId: string,
      playerId: string
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
      const reward = data && await data[rewardLocal].get();

      if (!reward || !reward.exists) {
        return null;
      }

      const matchPlayers = await mcQuizMatchModelApp.getMatchPlayers(matchId, this.locale, "score", "asc");

      let countPlayerPosition = 0;
      let shouldSkip = false;
      matchPlayers.forEach((document) => {
        const data = document.data();
        if (shouldSkip) {
          return;
        }
        if (data.playerId === playerId) {
          shouldSkip = true;
        }

        countPlayerPosition++;
      });

      const rewardData = reward.data();

      return {
        loyaltyId: rewardData.loyaltyId,
        reward: countPlayerPosition > 10? rewardData.standardReward : rewardData.premiumReward,
      };
    } catch (e) {
      throw new Error("Failed to get reward! ->" + e);
    }
  }
}
