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
    return await questionRef.get();
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
    const choicesRef = this.db
        .doc(
            `${this.collectionQuestionsName}/${questionId}/locales/${locale}`
        );
    return await choicesRef.get();
  }
}
