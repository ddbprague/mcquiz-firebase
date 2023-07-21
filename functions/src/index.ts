import * as admin from "firebase-admin";
import {McQuizMatchApp} from "./extentions/mcQuizMatch";
import {McQuizDummies} from "./extentions/mcQuizDummies";
import {McQuizPlayerAnswerApp} from "./extentions/mcQuizPlayerAnswer";

import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import McQuizPlayersModel from "./extentions/model/mcQuizPlayersModel";
import McQuizMatchModel from "./extentions/model/mcQuizMatchModel";

admin.initializeApp();

/**
 * Note: Cloud Function V2.
 *
 */
export const matchrunner =
    onSchedule(
        {
          region: "europe-west1",
          schedule: "* * * * *",
          timeoutSeconds: 900,
          memory: "1GiB",
        },
        async () => {
          // Consistent timestamp minus 90 seconds
          const mcQuizMatchAppDevelopment = new McQuizMatchApp(
              90,
              "development"
          );

          const mcQuizMatchAppPreview = new McQuizMatchApp(
              90,
              "preview"
          );

          const mcQuizMatchAppProduction = new McQuizMatchApp(
              90,
              "production"
          );

          // Fire the app!
          await Promise.all([
            mcQuizMatchAppDevelopment.init(),
            mcQuizMatchAppPreview.init(),
            mcQuizMatchAppProduction.init(),
          ]);
        }
    );

/**
 * Note: Cloud Function V2.
 *
 */
export const createPlayer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
          const cKey = "O42PksS42Df18sSDEezer--8e/=AAdl";

          const {
            key,
            baseCollection,
            playerId,
            playerNickname,
            playerAvatar,
            mcdonaldsId,
            playerFirstName,
            playerLastName,
            playerEmail,
            playerDeviceId,
            playerDeviceToken,
            update,
            locale,
          } = request.data;

          if (cKey === key) {
            if (!baseCollection) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing baseCollection!"
              );
            }
            if (!playerId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerId!"
              );
            }
            if (!playerNickname) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerNickname!"
              );
            }
            if (!playerAvatar) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerAvatar!"
              );
            }
            if (!mcdonaldsId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing mcdonaldsId!"
              );
            }
            if (!playerFirstName) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerFirstName!"
              );
            }
            if (!playerLastName) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerLastName!"
              );
            }
            if (!playerEmail) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerEmail!"
              );
            }
            if (!playerDeviceId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerDeviceId!"
              );
            }
            if (!playerDeviceToken) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerDeviceToken!"
              );
            }
            if (!update) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing update!"
              );
            }
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizPlayersModelApp = new McQuizPlayersModel(
                  baseCollection.toString(),
                  locale.toString(),
              );

              await mcQuizPlayersModelApp.createNewPlayer(
                  playerId,
                  playerNickname,
                  playerAvatar,
                  mcdonaldsId,
                  playerFirstName,
                  playerLastName,
                  playerEmail,
                  playerDeviceId,
                  playerDeviceToken,
                  update
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to create / update player! ->" + e
              );
            }

            return {
              success: true,
              message: "Player created!",
            };
          } else {
            throw new HttpsError(
                "failed-precondition", "Error!"
            );
          }
        }
    );

/**
 * Note: Cloud Function V2.
 *
 */
export const matchSubscribePlayer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
          const cKey = "O42PksS42Df18sSDEezer--8e/=AAdl";

          const {
            key,
            baseCollection,
            matchId,
            playerId,
            playerNickname,
            matchPlayerAvatar,
            locale,
          } = request.data;

          if (cKey === key) {
            if (!baseCollection) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing baseCollection!"
              );
            }
            if (!matchId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchId!"
              );
            }
            if (!playerId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerId!"
              );
            }
            if (!playerNickname) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerNickname!"
              );
            }
            if (!matchPlayerAvatar) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchPlayerAvatar!"
              );
            }
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizMatchModelApp = new McQuizMatchModel(
                  baseCollection.toString(),
              );

              await mcQuizMatchModelApp.matchSubscribePlayer(
                  matchId,
                  playerId,
                  playerNickname,
                  matchPlayerAvatar,
                  locale
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to subscribe player to game! ->" + e
              );
            }

            return {
              success: true,
              message: "Player subscribed!",
            };
          } else {
            throw new HttpsError(
                "failed-precondition", "Error!"
            );
          }
        }
    );

/**
 * Note: Cloud Function V2.
 *
 */
export const matchUnSubscribePlayer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
          const cKey = "O42PksS42Df18sSDEezer--8e/=AAdl";

          const {
            key,
            baseCollection,
            matchId,
            playerId,
            locale,
          } = request.data;

          if (cKey === key) {
            if (!baseCollection) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing baseCollection!"
              );
            }
            if (!matchId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchId!"
              );
            }
            if (!playerId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerId!"
              );
            }
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizMatchModelApp = new McQuizMatchModel(
                  baseCollection.toString(),
              );

              await mcQuizMatchModelApp.matchUnSubscribePlayer(
                  matchId,
                  playerId,
                  locale
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to unsubscribe player to game! ->" + e
              );
            }

            return {
              success: true,
              message: "Player unsubscribed!",
            };
          } else {
            throw new HttpsError(
                "failed-precondition", "Error!"
            );
          }
        }
    );


/**
 * Note: Cloud Function V2.
 *
 */
export const saveplayeranswer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
          const cKey = "O42PksS42Df18sSDE985AAdl";

          const {
            env,
            key,
            locale,
            playerId,
            playerName,
            matchId,
            questionKey,
            choiceKey,
          } = request.data;


          if (cKey === key) {
            if (!env) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }
            if (!playerId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerId!"
              );
            }
            if (!playerName) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerName!"
              );
            }
            if (!matchId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchId!"
              );
            }
            if (!questionKey) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing questionKey!"
              );
            }
            if (!choiceKey) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing choiceKey!"
              );
            }

            // All good, start to process player answer
            const firstAnswerScore = 50;
            const correctAnswerScore = 300;
            const wrongAnswerScore = 10;

            try {
              const McQuizMatchModel = new McQuizPlayerAnswerApp(
                  env.toString(),
                  locale.toString(),
                  playerId.toString(),
                  playerName.toString(),
                  matchId.toString(),
                  questionKey.toString(),
                  choiceKey.toString(),
                  firstAnswerScore,
                  correctAnswerScore,
                  wrongAnswerScore
              );

              await McQuizMatchModel.init();
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to save player answer! ->" + e
              );
            }

            return {
              success: true,
              message: "Player score saved!",
              elements: {
                locale,
                playerId,
                playerName,
                matchId,
                questionKey,
                choiceKey,
              },
            };
          } else {
            throw new HttpsError(
                "failed-precondition", "Error!"
            );
          }
        }
    );

/**
 * Note: Cloud Function V2.
 *
 */
export const gameemulatorcz =
    onRequest(
        {
          region: "europe-west1",
          timeoutSeconds: 300,
          memory: "2GiB",
        },
        async (req, res) => {
          const mcQuizMatchApp = new McQuizMatchApp(
              90,
              "development",
              true
          );

          // Fire the app!
          await mcQuizMatchApp.init();

          res.json({result: "End of the game!"});
        }
    );


/**
 * Note: Cloud Function V2.
 *
 */
export const createdummies =
    onRequest(
        {
          region: "europe-west1",
          timeoutSeconds: 120,
          memory: "4GiB",
        },
        async (req, res) => {
          const maxNewPlayers = 15;
          const firstAnswerScore = 50;
          const correctAnswerScore = 300;
          const wrongAnswerScore = 10;

          const dummies = new McQuizDummies(
              maxNewPlayers,
              firstAnswerScore,
              correctAnswerScore,
              wrongAnswerScore
          );

          // Create dummies
          await dummies.create();


          res.json({result: maxNewPlayers + " Dummies added!"});
        }
    );
