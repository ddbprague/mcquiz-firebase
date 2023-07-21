import * as admin from "firebase-admin";
import {McQuizPlayerAnswerApp} from "./mcQuizPlayerAnswer";
import {Timestamp} from "firebase-admin/firestore";
import {dummiesData} from "./inc/mcQuizDummiesData";
import {HttpsError} from "firebase-functions/v2/https";

/**
 * McQuiz Dummies Extension.
 *
 */
export class McQuizDummies {
  private readonly db: FirebaseFirestore.Firestore;
  private readonly maxNewPlayers: number;
  private readonly firstAnswerScore: number;
  private readonly correctAnswerScore: number;
  private readonly wrongAnswerScore: number;
  private readonly matchId: string;

  /**
   * @param {number} maxNewPlayers Max players created
   * @param {number} firstAnswerScore Bonus points for the first answer.
   * @param {number} correctAnswerScore Points for correct answer.
   * @param {number} wrongAnswerScore Points for wrong answer.
   */
  constructor(
      maxNewPlayers: number,
      firstAnswerScore: number,
      correctAnswerScore: number,
      wrongAnswerScore: number,
  ) {
    this.db = admin.firestore();
    this.maxNewPlayers = maxNewPlayers;
    this.firstAnswerScore = firstAnswerScore;
    this.correctAnswerScore = correctAnswerScore;
    this.wrongAnswerScore = wrongAnswerScore;
    this.matchId = "z3ooD7EJhjclwP9nj0JX";
  }

  /**
   * Create new player.
   *
   */
  async create() {
    console.log("Start!");
    for (let i = 1; i <= this.maxNewPlayers; i++) {
      console.log("Create player STARTED #", i);
      await this.createNewPlayer();
      console.log("Create player FINISHED #", i);
    }

    console.log("Done!");
  }

  /**
   * Create new dummy player document in players and players document in match.
   *
   */
  async createNewPlayer() {
    const playerName = dummiesData().generateRandomName(5);

    // Create player
    const player = await this.db
        .collection("development_players_cz")
        .add( {
          nickname: playerName,
          avatar: "bakery",
          firstName: "Dum",
          lastName: "My",
          email: playerName + "@dummy.com",
          mcdonaldsId: "0010001",
          deviceId: "938495883",
          deviceToken: "qsmldoej88çslj",
          addedOn: Timestamp.now(),
        });
    console.log("New player created ---> ", player.id);

    // Create player in Match
    const matchPlayerDoc = this.db.doc(
        "development_matches/" + this.matchId +"/locales/cz/players/" + player.id
    );
    await matchPlayerDoc.create({
      playerRef: player,
      playerId: player.id,
      playerNickname: playerName,
      addedOn: Timestamp.now(),
    });

    // Create answers for this player
    await this.createNewAnswers(player.id, playerName, player);
  }

  /**
   * Create new dummy answers in answers document in match.
   *
   * @param {string} playerId Player ID
   * @param {string} playerName  Player name
   * @param {DocumentReference<DocumentData>} playerRef Player Ref
   */
  async createNewAnswers(
      playerId: string,
      playerName: string,
      playerRef:
        admin.firestore.DocumentReference<admin.firestore.DocumentData>
  ) {
    const maxQuestions = 3;

    for (let i = 0; i < maxQuestions; i++) {
      const answer = dummiesData().generateAnswer(
          i,
          playerId,
          playerName,
          playerRef,
          this.db
      );

      try {
        const McQuizMatchModel =
          new McQuizPlayerAnswerApp(
              "development",
              "cz",
              answer.playerId,
              answer.playerName,
              this.matchId,
              answer.questionKey,
              answer.selectedChoiceKey,
              this.firstAnswerScore,
              this.correctAnswerScore,
              this.wrongAnswerScore
          );


        await McQuizMatchModel.init();
      } catch (e) {
        throw new HttpsError(
            "internal", "Failed to save player answer! ->" + e
        );
      }
    }
  }
}
