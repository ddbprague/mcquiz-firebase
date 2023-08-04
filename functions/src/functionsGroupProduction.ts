import {McQuizMatchApp} from "./extentions/mcQuizMatch";
import {McQuizPlayerAnswerApp} from "./extentions/mcQuizPlayerAnswer";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import McQuizPlayersModel from "./extentions/model/mcQuizPlayersModel";
import McQuizMatchModel from "./extentions/model/mcQuizMatchModel";
import McQuizRewardModel from "./extentions/model/mcQuizRewardModel";
import {McQuizPlayersStatisticsApp} from "./extentions/mcQuizPlayersStatistics";


/**
 * Note: Cloud Function V2.
 *
 */
export const matchRunner =
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
                  playerId.toString(),
                  playerNickname.toString(),
                  playerAvatar.toString(),
                  mcdonaldsId.toString(),
                  playerFirstName.toString(),
                  playerLastName.toString(),
                  playerEmail.toString(),
                  playerDeviceId.toString(),
                  playerDeviceToken.toString(),
                  update.toString()
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
export const getPlayer =
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

              const player = await mcQuizPlayersModelApp.getPlayer(
                  playerId.toString(),
              );

              const playerData = player && player.exists? player.data() : null;

              return {
                success: true,
                player: !playerData? null : {
                  "nickname": playerData.nickname,
                  "mcdonaldsId": playerData.mcdonaldsId,
                  "firstName": playerData.firstName,
                  "lastName": playerData.lastName,
                  "email": playerData.email,
                  "deviceId": playerData.deviceId,
                  "deviceToken": playerData.deviceToken,
                  "avatar": playerData.avatar,
                },
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to get player! ->" + e
              );
            }
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
export const getPlayersStatistics =
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
            matchId,
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
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizPlayersModelApp = new McQuizPlayersStatisticsApp(
                  baseCollection.toString(),
                  locale.toString(),
                  playerId.toString(),
                        matchId? matchId.toString() : null,
              );

              const statistics = await mcQuizPlayersModelApp.init();

              return {
                success: true,
                statistics,
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to get players statistics! ->" + e
              );
            }
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
export const matchGetRewardInfo =
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
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizMatchModelApp = new McQuizRewardModel(
                  baseCollection.toString(),
                  locale.toString(),
              );

              const reward = await mcQuizMatchModelApp.getReward(
                  matchId,
              );

              if (!reward || !reward.exists) {
                return {
                  success: false,
                  message: "No reward with this ref",
                };
              }

              const data = reward.data();

              return {
                success: true,
                rewards: {
                  standard: {
                    name: data.standardReward.rewardName,
                    image: data.standardReward.rewardImage,
                  },
                  premiumReward: {
                    name: data.premiumReward.rewardName,
                    image: data.premiumReward.rewardImage,
                  },
                },
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to det reward info! ->" + e
              );
            }
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
export const matchGetPlayerRewardInfo =
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
              const mcQuizMatchModelApp = new McQuizRewardModel(
                  baseCollection.toString(),
                  locale.toString(),
              );

              const reward = await mcQuizMatchModelApp.getRewardWithPlayerId(
                  matchId,
                  playerId,
              );

              if (!reward) {
                return {
                  success: false,
                  message: "No reward with this ref",
                };
              }

              console.log(reward);

              return {
                success: true,
                reward,
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to det reward info! ->" + e
              );
            }
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

              await mcQuizMatchModelApp.matchSubscribePlayer(
                  matchId.toString(),
                  playerId.toString(),
                  locale.toString()
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
                  matchId.toString(),
                  playerId.toString(),
                  locale.toString()
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
export const matchSubmitPlayerAnswer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
          const cKey = "O42PksS42Df18sSDEezer--8e/=AAdl";

          const {
            key,
            baseCollection,
            locale,
            playerId,
            playerName,
            matchId,
            questionKey,
            selectedChoiceKey,
          } = request.data;


          if (cKey === key) {
            if (!baseCollection) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing baseCollection!"
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
            if (!selectedChoiceKey) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing selectedChoiceKey!"
              );
            }

            // All good, start to process player answer
            const firstAnswerScore = 50;
            const correctAnswerScore = 300;
            const wrongAnswerScore = 10;

            try {
              const McQuizMatchModel = new McQuizPlayerAnswerApp(
                  baseCollection.toString(),
                  locale.toString(),
                  playerId.toString(),
                  playerName.toString(),
                  matchId.toString(),
                  questionKey.toString(),
                  selectedChoiceKey.toString(),
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
              message: "Player answer saved!",
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
export const matchSubmitPlayerCouponActivation =
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
            matchId,
            rewardName,
            rewardLoyaltyId,
            rewardId,
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
            if (!matchId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchId!"
              );
            }
            if (!rewardName) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing rewardName!"
              );
            }
            if (!rewardLoyaltyId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing rewardLoyaltyId!"
              );
            }
            if (!rewardId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing rewardId!"
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

              await mcQuizMatchModelApp.submitPlayerCouponActivation(
                  playerId.toString(),
                  matchId.toString(),
                  rewardName.toString(),
                  rewardLoyaltyId.toString(),
                  rewardId.toString(),
                  locale.toString()
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to activate coupon for player! ->" + e
              );
            }

            return {
              success: true,
              message: "Player nickname updated!",
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
export const matchSubmitPlayerRating =
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
            matchId,
            ratingScore,
            ratingComment,
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
            if (!matchId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchId!"
              );
            }
            if (!ratingScore) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing rewardName!"
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

              await mcQuizMatchModelApp.submitPlayerRating(
                  playerId.toString(),
                  matchId.toString(),
                  Number(ratingScore),
                  ratingComment.toString(),
                  locale.toString()
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to save player rating! ->" + e
              );
            }

            return {
              success: true,
              message: "Player rating updated!",
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
export const playerUpdateAvatar =
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
            playerAvatar,
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
            if (!playerAvatar) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing playerAvatar!"
              );
            }
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizMatchModelApp = new McQuizPlayersModel(
                  baseCollection.toString(),
                  locale.toString(),
              );

              await mcQuizMatchModelApp.updateAvatar(
                  playerId.toString(),
                  playerAvatar.toString()
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to update player avatar! ->" + e
              );
            }

            return {
              success: true,
              message: "Player avatar updated!",
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
export const playerUpdateNickname =
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
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const mcQuizMatchModelApp = new McQuizPlayersModel(
                  baseCollection.toString(),
                  locale.toString(),
              );

              await mcQuizMatchModelApp.updateNickname(
                  playerId.toString(),
                  playerNickname.toString()
              );
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to update player nickname! ->" + e
              );
            }

            return {
              success: true,
              message: "Player nickname updated!",
            };
          } else {
            throw new HttpsError(
                "failed-precondition", "Error!"
            );
          }
        }
    );
