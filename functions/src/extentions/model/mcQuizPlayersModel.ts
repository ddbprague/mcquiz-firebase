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
   * @param {string} env
   * @param {string} locale
   */
  constructor(
      env: string,
      locale: string,
  ) {
    this.db = admin.firestore();
    this.collectionPlayersName = `${env}_players_${locale}`;
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
   * @return {Promise<boolean>}
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

    const playerRef = this.db.doc(
        `${this.collectionPlayersName}/${playerId}`
    );

    if (update === "true") {
      delete data.addedOn;
      return playerRef.update(data);
    } else {
      return playerRef.set(data);
    }
  }

  /**
   * Update player score.
   *
   * @param {string} matchId Question ID.
   * @param {string} playerId Player ID
   * @param {{
   * score: number,
   * correctAnswers: number,
   * wrongAnswers: number,
   * }
   * } playerScoreData Score data of the player.
   * data to update.
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

    const playerStatisticsRef = this.db
        .doc(
            `${this.collectionPlayersName}/${playerId}`
        );

    try {
      await playerStatisticsRef.update(data);
    } catch (e) {
      throw new Error("Failed to save player general statistics! ->" + e);
    }
  }
}