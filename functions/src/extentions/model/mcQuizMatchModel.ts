import * as admin from "firebase-admin";
import {FieldValue, Timestamp} from "firebase-admin/firestore";

/**
 * McQuiz Matches DB.
 *
 */
export default class McQuizMatchModel {
  private readonly db: FirebaseFirestore.Firestore;
  private readonly collectionMatchesName: string;
  private readonly collectionPlayersName: string;
  private readonly collectionQuestionsName: string;

  /**
   *
   * @param {string} baseCollection Base collection.
   */
  constructor(
      baseCollection: string
  ) {
    this.db = admin.firestore();

    this.collectionMatchesName = `${baseCollection}_matches`;
    this.collectionPlayersName = `${baseCollection}_players`;
    this.collectionQuestionsName = `${baseCollection}_questions`;
  }


  /**
   * Subscribe player in match
   *
   * @param {string} matchId
   * @param {string} playerId
   * @param {string} locale
   *
   * @return {boolean}
   */
  public async matchSubscribePlayer(
      matchId: string,
      playerId: string,
      locale: string
  ) {
    const playerRef = this.db.doc(
        `${this.collectionPlayersName}_${locale}/${playerId}`
    );

    const data = {
      playerRef,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      addedOn: Timestamp.now(),
    };

    try {
      const matchPlayerRef = this.db.doc(
          `${this.collectionMatchesName}/${matchId}/locales/${locale}/players/${playerId}`
      );

      const matchPlayer = await matchPlayerRef.get();

      if (!matchPlayer.exists) await matchPlayerRef.set(data);

      return true;
    } catch (e) {
      throw new Error("Failed to subscribe player to match! ->" + e);
    }
  }


  /**
   * Unsubscribe player from match
   *
   * @param {string} matchId
   * @param {string} playerId
   * @param {string} locale
   *
   * @return {boolean}
   */
  public async matchUnSubscribePlayer(
      matchId: string,
      playerId: string,
      locale: string
  ) {
    try {
      await this.db
          .collection(
              `${this.collectionMatchesName}/${matchId}/locales/${locale}/players`
          )
          .doc(
              `${playerId}`
          )
          .delete();
    } catch (e) {
      throw new Error("Failed to unsubscribe player to match! ->" + e);
    }
  }


  /**
   * Save player answer.
   * Note: to avoid player answering multiple time,
   * we keep 'update' instead of 'set'.
   *
   * @param {string} playerId Player ID.
   * @param {string} playerName Player Name.
   * @param {string} matchId Match ID.
   * @param {string} questionKey Question ID.
   * @param {string} choiceKey Answer ID.
   * @param {string} locale Language used by player.
   *
   * return {boolean}
   */
  public async createPlayerAnswer(
      playerId: string,
      playerName: string,
      matchId: string,
      questionKey: string,
      choiceKey: string,
      locale: string,
  ) {
    const generatedAnswerId = playerId + "-" + questionKey;
    const matchAnswerRef = this.db.doc(
        `${this.collectionMatchesName}/${matchId}/locales/${locale}/answers/${generatedAnswerId}`
    );
    const matchPlayerRef = this.db.doc(
        `${this.collectionPlayersName}_${locale}/${playerId}`
    );
    const matchQuestionRef = this.db.doc(
        `${this.collectionQuestionsName}/${questionKey}`
    );

    const data = {
      playerId: playerId,
      playerName: playerName,
      playerRef: matchPlayerRef,
      questionKey: questionKey,
      questionRef: matchQuestionRef,
      selectedChoiceKey: choiceKey,
      addedOn: Timestamp.now(),
    };

    try {
      await matchAnswerRef.create(data);

      return true;
    } catch (e) {
      throw new Error("Failed to create player answer! ->" + e);
    }
  }


  /**
   * Return the match.
   *
   * @param {number} matchId Match ID.
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   */
  public async getMatch(
      matchId: string,
  ) {
    // Consistent timestamp minus ${secondsAdded} seconds
    try {
      const matchRef = this.db.doc(
          `${this.collectionMatchesName}/${matchId}`
      );

      return await matchRef.get();
    } catch (e) {
      throw new Error("Failed to get match! ->" + e);
    }
  }


  /**
   * Return the next match within the seconds added.
   *
   * @param {number} secondsAdded Second before the match should start.
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   */
  public async getNextMatch(
      secondsAdded: number,
  ) {
    // Consistent timestamp minus ${secondsAdded} seconds
    const datePlus = new Date(Date.now() + secondsAdded * 1000);
    const nowPlus = admin.firestore.Timestamp.fromDate(datePlus);

    try {
      const query = this.db.collection(this.collectionMatchesName)
          .where("startingAt", "<", nowPlus)
          .where("status", "==", "scheduled");

      return await query.get();
    } catch (e) {
      throw new Error("Failed to get next match! ->" + e);
    }
  }


  /**
   * Get all match (for local debug).
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   */
  public async getAllMatch() {
    try {
      const query = this.db.collection(this.collectionMatchesName);

      return await query.get();
    } catch (e) {
      throw new Error("Failed to get all matches! ->" + e);
    }
  }


  /**
   * Get match players.
   *
   * @param {string} matchId Match ID.
   * @param {string} locale Language used by player.
   * @param {string} fieldPath Order Field.
   * @param {"desc" | "asc"} directionStr Order Direction.
   * @param {number} limit Result Limitation.
   *
   */
  public async getMatchPlayers(
      matchId: string,
      locale: string,
      fieldPath: string,
      directionStr: "desc" | "asc",
      limit?: number,
  ) {
    try {
      let matchPlayerRef = this.db.collection(
          `${this.collectionMatchesName}/${matchId}/locales/${locale}/players`
      ).orderBy(fieldPath, directionStr).limit(100);

      if (limit) {
        matchPlayerRef = matchPlayerRef.limit(limit);
      }

      return await matchPlayerRef.get();
    } catch (e) {
      throw new Error("Failed to get match players! ->" + e);
    }
  }


  /**
   * Get question answers statistics.
   *
   * @param {string} matchId Match ID.
   * @param {string} questionKey Question Key.
   * @param {string} locale Language used by player.
   *
   */
  public async getMatchQuestionAnswersStatistics(
      matchId: string,
      questionKey: string,
      locale: string,
  ) {
    try {
      const matchQuestionAnswersStatisticsRef = this.db.doc(
          `${this.collectionMatchesName}/${matchId}/locales/${locale}/questionAnswersStatistics/${questionKey}`
      );

      return await matchQuestionAnswersStatisticsRef.get();
    } catch (e) {
      throw new Error("Failed to get question answers statistics! ->" + e);
    }
  }


  /**
   * Submit player coupon activation
   *
   * @param {string} playerId
   * @param {string} matchId
   * @param {string} rewardName
   * @param {string} rewardLoyaltyId
   * @param {string} rewardId
   * @param {string} locale
   *
   * @return {boolean}
   */
  public async submitPlayerCouponActivation(
      playerId: string,
      matchId: string,
      rewardName: string,
      rewardLoyaltyId: string,
      rewardId: string,
      locale: string,
  ) {
    const data = {
      reward: {
        rewardName,
        rewardLoyaltyId,
        rewardId,
        addedOn: Timestamp.now(),
      },
    };

    const matchPlayerRef = this.db.doc(
        `${this.collectionMatchesName}/${matchId}/locales/${locale}/players/${playerId}`
    );

    try {
      await matchPlayerRef.update(data);

      return true;
    } catch (e) {
      throw new Error("Failed to activate coupon for player! ->" + e);
    }
  }


  /**
   * Submit player rating & message
   *
   * @param {string} playerId
   * @param {string} matchId
   * @param {number} ratingScore
   * @param {string} ratingComment
   * @param {string} locale
   *
   * @return {boolean}
   */
  public async submitPlayerRating(
      playerId: string,
      matchId: string,
      ratingScore: number,
      ratingComment: string,
      locale: string,
  ) {
    const dataMatchPlayer = {
      ratingScore,
      ratingComment,
    };

    /* Update Match Player */
    const matchPlayerRef = this.db.doc(
        `${this.collectionMatchesName}/${matchId}/locales/${locale}/players/${playerId}`
    );

    /* Update Match */
    const matchRef = this.db.doc(`${this.collectionMatchesName}/${matchId}`);
    const matchDoc = await matchRef.get();

    let ratingPlayers;
    let ratingTotalScore;

    if (!matchDoc.exists) {
      throw new Error(`This match doesn't exist! -> ${matchId}`);
    }

    const match = matchDoc.data();

    if (match && match.rating && match.rating.ratingPlayers && match.rating.ratingTotalScore) {
      if (playerId in match.rating.ratingPlayers) {
        ratingTotalScore = match.rating.ratingTotalScore - match.rating.ratingPlayers[playerId] + ratingScore;
        match.rating.ratingPlayers[playerId] = ratingScore;

        ratingPlayers = match.rating.ratingPlayers;
      } else {
        ratingTotalScore = match.rating.ratingTotalScore + ratingScore;
        match.rating.ratingPlayers[playerId] = ratingScore;

        ratingPlayers = match.rating.ratingPlayers;
      }
    } else {
      ratingPlayers = {[playerId]: ratingScore};
      ratingTotalScore = ratingScore;
    }

    const dataMatch = {
      rating: {
        ratingPlayers,
        ratingTotalScore,
      },
    };

    try {
      await matchPlayerRef.update(dataMatchPlayer);
      await matchRef.update(dataMatch);

      return true;
    } catch (e) {
      throw new Error("Failed to submit player rating! ->" + e);
    }
  }


  /**
   * Update the status of the match snapshot.
   *
   * @param {FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>}snapshot
   * @param {string} data data to update.
   *
   * @return {boolean}

   */
  public async updateStatus(
      snapshot:
        FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
      data: object,
  ) {
    try {
      await snapshot.ref.update(data);

      return true;
    } catch (e) {
      throw new Error("Failed to update status! ->" + e);
    }
  }


  /**
   * Update answer statistics for a question.
   * Count how many players choose this answer.
   *
   * @param {string} matchId Question ID.
   * @param {string} questionKey Question ID.
   * @param {string} choiceKey Choice Key
   * @param {string} locale Language used by player
   *
   * @return {boolean}
   */
  public async updateQuestionAnswerStatistics(
      matchId: string,
      questionKey: string,
      choiceKey: string,
      locale: string,
  ) {
    const data = {[choiceKey]: FieldValue.increment(1)};

    const matchQuestionAnswersStatRef = this.db
        .doc(
            `${this.collectionMatchesName}/${matchId}/locales/${locale}/questionAnswersStatistics/${questionKey}`
        );

    try {
      const matchQuestionAnswersStat = await matchQuestionAnswersStatRef.get();

      if (matchQuestionAnswersStat.exists) {
        await matchQuestionAnswersStatRef.update(data);
      } else {
        await matchQuestionAnswersStatRef.create(data);
      }

      return true;
    } catch (e) {
      throw new Error("Failed to update question answer statistics! ->" + e);
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
   * @param {string} locale Language used by player.
   *
   * @return {boolean}
   */
  public async updatePlayerMatchScore(
      matchId: string,
      playerId: string,
      playerScoreData: {
        score: number,
        correctAnswers: number,
        wrongAnswers: number,
      },
      locale: string,
  ) {
    const matchPlayerRef = this.db.doc(
        `${this.collectionMatchesName}/${matchId}/locales/${locale}/players/${playerId}`
    );

    const data = {
      score: FieldValue.increment(
          Number(playerScoreData.score.toFixed(4))
      ),
      correctAnswers: FieldValue.increment(
          playerScoreData.correctAnswers
      ),
      wrongAnswers: FieldValue.increment(
          playerScoreData.wrongAnswers
      ),
      updatedOn: Timestamp.now(),
    };

    try {
      await matchPlayerRef.update(data);
      return true;
    } catch (e) {
      throw new Error("Failed to save player match statistics! ->" + e);
    }
  }


  /**
   * Count how many players already answers given question.
   *
   * @param {string} matchId Match ID.
   * @param {number} questionKey Question Key.
   * @param {number} locale Language used by the player.
   *
   * @return {number}
   */
  public async countPlayersAnswerQuestion(
      matchId: string,
      questionKey: string,
      locale: string,

  ) {
    const queryMatchQuestionAnswersDoc = this.db
        .collection(
            `${this.collectionMatchesName}/${matchId}/locales/${locale}/answers`
        )
        .where("questionKey", "==", questionKey)
        .count();

    const queryMatchQuestionAnswersCount =
      await queryMatchQuestionAnswersDoc.get();

    return queryMatchQuestionAnswersCount.data().count;
  }
}
