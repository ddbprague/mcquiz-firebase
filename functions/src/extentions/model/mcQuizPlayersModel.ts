import * as admin from "firebase-admin";
import {FieldValue, Timestamp} from "firebase-admin/firestore";
import {CreatePlayerData} from "./type";

/**
 * McQuiz Matches DB.
 *
 */
export default class McQuizPlayersModel {
  private readonly db: FirebaseFirestore.Firestore;
  private readonly collectionPlayersName: string;

  /**
   * @param {string} baseCollection Base collection.
   * @param {string} locale
   */
  constructor(
      baseCollection: string,
      locale: string,
  ) {
    this.db = admin.firestore();
    this.collectionPlayersName = `${baseCollection}_players_${locale}`;
  }


  /**
   *  Create new player.
   *
   * @param {string} playerId Player ID.
   * @param {string} playerNickname Player nickname.
   * @param {string} playerAvatar Player avatar name
   * @param {string} mcdonaldsId McDonalds App player ID.
   * @param {string} playerFirstName McDonalds App player first name.
   * @param {string} playerLastName McDonalds App player last name.
   * @param {string} playerEmail McDonalds App player email.
   * @param {string} playerDeviceId McDonalds App player device id.
   * @param {string} playerDeviceToken McDonalds App player device token.
   * @param {string} update Is an update.
   *
   * @return {boolean}
   */
  public async createNewPlayer(
      playerId: string,
      playerNickname: string,
      playerAvatar: string,
      mcdonaldsId: string,
      playerFirstName: string,
      playerLastName: string,
      playerEmail: string,
      playerDeviceId: string,
      playerDeviceToken: string,
      update: string,
  ) {
    const now = Timestamp.now();

    const data: CreatePlayerData = {
      mcdonaldsId: mcdonaldsId,
      nickname: playerNickname,
      avatar: playerAvatar,
      firstName: playerFirstName,
      lastName: playerLastName,
      email: playerEmail,
      deviceId: playerDeviceId,
      deviceToken: playerDeviceToken,
      totalQuestions: 0,
      totalCorrectAnswers: 0,
      totalWrongAnswers: 0,
      updatedOn: now,
      addedOn: now,
    };

    try {
      const playerRef = this.db.doc(
          `${this.collectionPlayersName}/${playerId}`
      );

      if (update === "true") {
        delete data.addedOn;
        await playerRef.update(data);
      } else {
        await playerRef.set(data);
      }

      return true;
    } catch (e) {
      throw new Error("Failed to create new player! ->" + e);
    }
  }


  /**
   *  Get player.
   *
   * @param {string} playerId Player ID.
   *
   * @return {boolean}
   */
  public async getPlayer(
      playerId: string,
  ) {
    try {
      const playerRef = this.db.doc(
          `${this.collectionPlayersName}/${playerId}`
      );

      return playerRef.get();
    } catch (e) {
      throw new Error("Failed to get player! ->" + e);
    }
  }


  /**
   *  Get all players.
   *
   * @param {string} fieldPath Order Field.
   * @param {"desc" | "asc"} directionStr Order Direction.
   * @param {number} limit Result Limitation.
   *
   * @return {boolean}
   */
  public async getPlayers(
      fieldPath: string,
      directionStr: "desc" | "asc",
      limit?: number,
  ) {
    try {
      let playersCollection = this.db.collection(
          `${this.collectionPlayersName}`
      )
          .orderBy(fieldPath, directionStr);

      if (limit) {
        playersCollection = playersCollection.limit(limit);
      }

      return playersCollection.get();
    } catch (e) {
      throw new Error("Failed to get players! ->" + e);
    }
  }


  /**
   *  Update avatar.
   *
   * @param {string} playerId Player ID.
   * @param {string} playerAvatar Player nickname.
   *
   * @return {boolean}
   */
  public async updateAvatar(
      playerId: string,
      playerAvatar: string,
  ) {
    const now = Timestamp.now();

    const data: CreatePlayerData = {
      avatar: playerAvatar,
      updatedOn: now,
    };

    const playerRef = this.db.doc(
        `${this.collectionPlayersName}/${playerId}`
    );

    try {
      await playerRef.update(data);

      return true;
    } catch (e) {
      throw new Error("Failed to update player avatar! ->" + e);
    }
  }


  /**
   *  Update nickname.
   *
   * @param {string} playerId Player ID.
   * @param {string} playerNickname Player nickname.
   *
   * @return {boolean}
   */
  public async updateNickname(
      playerId: string,
      playerNickname: string,
  ) {
    const now = Timestamp.now();

    const data: CreatePlayerData = {
      nickname: playerNickname,
      updatedOn: now,
    };

    try {
      const playerRef = this.db.doc(
          `${this.collectionPlayersName}/${playerId}`
      );

      await playerRef.update(data);

      return true;
    } catch (e) {
      throw new Error("Failed to update player nickname! ->" + e);
    }
  }


  /**
   * Update player statistics.
   *
   * @param {string} matchId Question ID.
   * @param {string} playerId Player ID
   * @param {{
   * score: number,
   * correctAnswers: number,
   * wrongAnswers: number,
   * }} playerScoreData Score data of the player.
   *
   * @return {boolean}
   */
  public async updatePlayerStatistics(
      matchId: string,
      playerId: string,
      playerScoreData: {
        score: number,
        correctAnswers: number,
        wrongAnswers: number,
      },
  ) {
    const data = {
      totalScore: FieldValue.increment(
          Number(playerScoreData.score.toFixed(4))
      ),
      totalQuestions: FieldValue.increment(1),
      totalCorrectAnswers: FieldValue.increment(playerScoreData.correctAnswers),
      totalWrongAnswers: FieldValue.increment(playerScoreData.wrongAnswers),
      gamesPlayed: FieldValue.arrayUnion(this.db.doc("matches/" + matchId)),
      lastGame: this.db.doc("matches/" + matchId),
      updatedOn: Timestamp.now(),
    };

    try {
      const playerStatisticsRef = this.db
          .doc(
              `${this.collectionPlayersName}/${playerId}`
          );

      await playerStatisticsRef.update(data);

      return true;
    } catch (e) {
      throw new Error("Failed to save player general statistics! ->" + e);
    }
  }
}
