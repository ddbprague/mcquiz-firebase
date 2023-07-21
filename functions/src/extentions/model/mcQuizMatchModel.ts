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
   * @param {string} env
   */
  constructor(
      env: string
  ) {
    this.db = admin.firestore();

    this.collectionMatchesName = `${env}_matches`;
    this.collectionPlayersName = `${env}_players`;
    this.collectionQuestionsName = `${env}_questions`;
  }

  /**
   * Subscribe player in match
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   * QuerySnapshot<DocumentData>.
   * @param {string} matchId
   * @param {string} playerId
   * @param {string} playerNickname
   * @param {string} matchPlayerAvatar
   * @param {string} locale
   */
  public async matchSubscribePlayer(
      matchId: string,
      playerId: string,
      playerNickname: string,
      matchPlayerAvatar: string,
      locale: string
  ) {
    const playerRef = this.db.doc(
        `${this.collectionPlayersName}_local/${playerId}`
    );

    const data = {
      playerRef,
      playerId,
      playerNickname,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      matchPlayerAvatar,
      addedOn: Timestamp.now(),
    };

    const matchPlayerRef = this.db.doc(
        `${this.collectionMatchesName}/${matchId}/locales/${locale}/players/${playerId}`
    );

    try {
      const matchPlayer = await matchPlayerRef.get();

      if (!matchPlayer.exists) await matchPlayerRef.set(data);
    } catch (e) {
      throw new Error("Failed to subscribe player to match! ->" + e);
    }

    return true;
  }

  /**
   * Unsubscribe player from match
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   * QuerySnapshot<DocumentData>.
   * @param {string} matchId
   * @param {string} playerId
   * @param {string} locale
   */
  public async matchUnSubscribePlayer(
      matchId: string,
      playerId: string,
      locale: string
  ) {
    const matchPlayerRef = this.db.doc(
        `${this.collectionMatchesName}/${matchId}/locales/${locale}/players/${playerId}`
    );

    try {
      await matchPlayerRef.delete();

      return true;
    } catch (e) {
      throw new Error("Failed to subscribe player to match! ->" + e);
    }
  }

  /**
   * Return the next match within the seconds added.
   *
   * @param {number} secondsAdded Second before the match should start.
   * @return {Promise<QuerySnapshot<DocumentData>>}
   * QuerySnapshot<DocumentData>.
   */
  public async getNextMatch(
      secondsAdded: number,
  ) {
    // Consistent timestamp minus ${secondsAdded} seconds
    const datePlus = new Date(Date.now() + secondsAdded * 1000);
    const nowPlus = admin.firestore.Timestamp.fromDate(datePlus);

    const query = this.db.collection(this.collectionMatchesName)
        .where("startingAt", "<", nowPlus)
        .where("status", "==", "scheduled");

    return await query.get();
  }

  /**
   * Return all match (for local debug).
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   * QuerySnapshot<DocumentData>.
   */
  public async getAllMatch() {
    const query = this.db.collection(this.collectionMatchesName);

    return await query.get();
  }

  /**
   * Save player answer.
   *
   * @param {string} playerId Player ID.
   * @param {string} playerName Player Name.
   * @param {string} matchId Match ID.
   * @param {string} questionKey Question ID.
   * @param {string} choiceKey Answer ID.
   * @param {string} locale Language used by player.
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
    } catch (e) {
      throw new Error("Failed to create player answer! ->" + e);
    }
  }

  /**
   * Update the status of the match snapshot.
   *
   * @param {QueryDocumentSnapshot<DocumentData>} snapshot
   * Snapshot of the match.
   * @param {string} data data to update.
   * @return {Promise<WriteResult>}
   * Promise<WriteResult>.
   */
  public async updateStatus(
      snapshot:
        FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData>,
      data: object,
  ) {
    return await snapshot.ref.update(data);
  }

  /**
   * Update answer statistics for a question.
   * Count how many players choose this answer.
   *
   * @param {string} matchId Question ID.
   * @param {string} questionKey Question Id
   * @param {string} choiceKey Choice Key
   * @param {string} locale Language used by player
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
   * data to update.
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
   * @return {number}
   * Number of answers for this question.
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
