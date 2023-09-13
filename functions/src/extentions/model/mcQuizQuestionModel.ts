import * as admin from "firebase-admin";
import {firestore} from "firebase-admin";
import DocumentReference = firestore.DocumentReference;
import {DocumentData} from "firebase-admin/firestore";

/**
 * McQuiz Questions DB.
 *
 */
export default class McQuizQuestionModel {
  private db: FirebaseFirestore.Firestore;
  private readonly collectionQuestionsName: string;

  /**
   *
   * @param {string} env
   */
  constructor(
      env: string
  ) {
    this.db = admin.firestore();

    this.collectionQuestionsName = `${env}_questions`;
  }


  /**
   * Get question with questionRef.
   *
   * @param {any} questionRef Question Reference
   * @return {Promise<DocumentSnapshot<DocumentData>>}
   * DocumentSnapshot<DocumentData>.
   */
  public async getQuestion(
      questionRef: DocumentReference<DocumentData>
  ) {
    try {
      return await questionRef.get();
    } catch (e) {
      throw new Error("Failed to get question! ->" + e);
    }
  }


  /**
   * Get question with ID.
   *
   * @param {string} questionId
   *
   * @return {Promise<QuerySnapshot<DocumentData>>}
   * QuerySnapshot<DocumentData>.
   */
  public async getQuestionWithId(
      questionId: string,
  ) {
    try {
      const questionRef = this.db
          .doc(
              `${this.collectionQuestionsName}/${questionId}`
          );

      return await questionRef.get();
    } catch (e) {
      throw new Error("Failed to get question! ->" + e);
    }
  }


  /**
   * Get choices with question ID.
   *
   * @param {string} questionId Question ID.
   * @param {string} locale Language of the player.
   * @return {Promise<QuerySnapshot<DocumentData>>}
   * QuerySnapshot<DocumentData>.
   */
  public async getQuestionChoices(
      questionId: string,
      locale: string,
  ) {
    try {
      const choicesRef = this.db
          .doc(
              `${this.collectionQuestionsName}/${questionId}/locales/${locale}`
          );

      return await choicesRef.get();
    } catch (e) {
      throw new Error("Failed to get question choices! ->" + e);
    }
  }
}
