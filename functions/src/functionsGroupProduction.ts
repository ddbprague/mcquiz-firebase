import {McQuizMatchApp} from "./extentions/mcQuizMatch";
import {McQuizPlayerAnswerApp} from "./extentions/mcQuizPlayerAnswer";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import McQuizPlayersModel from "./extentions/model/mcQuizPlayersModel";
import McQuizMatchModel from "./extentions/model/mcQuizMatchModel";
import McQuizRewardModel from "./extentions/model/mcQuizRewardModel";
import {McQuizPlayersStatisticsApp} from "./extentions/mcQuizPlayersStatistics";
import McQuizQuestionModel from "./extentions/model/mcQuizQuestionModel";
import {getStorage, getDownloadURL} from "firebase-admin/storage";

const cKey = "O42PksS42Df18sSDEezer--8e/=AAdl";

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
 * This is not a latency-critical function.
 *
 */
export const createPlayer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
 * This is not a latency-critical function.
 *
 */
export const getPlayer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
 * Called in Profile Page.
 * This is not a latency-critical function.
 *
 */
export const getPlayersStatistics =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
          const {
            key,
            baseCollection,
            playerId,
            matchId,
            withReward,
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
            if (typeof matchId === "undefined" ) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing matchId!"
              );
            }
            if (typeof withReward === "undefined" ) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing withReward!"
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
                  withReward,
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
 * Called in-match
 * This is a latency-critical function.
 *
 */
export const getMatchQuestionAnswersStatistics =
    onCall(
        {
          region: "europe-west1",
          minInstances: 1,
        },
        async (request) => {
          const {
            key,
            baseCollection,
            matchId,
            questionKey,
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
            if (!questionKey) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing questionKey!"
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

              const questionAnswerStatistics = await mcQuizMatchModelApp.getMatchQuestionAnswersStatistics(
                  matchId.toString(),
                  questionKey.toString(),
                  locale.toString()
              );

              if (!questionAnswerStatistics.exists) {
                return {
                  success: false,
                };
              }

              return {
                success: true,
                statistics: questionAnswerStatistics.data(),
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to get question answers statistics statistics! ->" + e
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
 * Called in home page.
 * This is not a latency-critical function.
 *
 */
export const nextMatchGetRewardInfo =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
              const mcQuizRewardModelApp = new McQuizRewardModel(
                  baseCollection.toString(),
                  locale.toString(),
              );

              const rewards = await mcQuizRewardModelApp.getRewards(
                  matchId,
              );

              if (!rewards || !rewards.exists) {
                return {
                  success: false,
                  message: "Failed to get rewards info!",
                };
              }

              const rewardsData = rewards.data();

              const storage = getStorage().bucket("mcquiz-global.appspot.com");

              const iconFileRef = storage.file(rewardsData?.rewardIcon);
              const imageFileRef = storage.file(rewardsData?.rewardImage);

              return {
                success: true,
                rewards: {
                  icon: await getDownloadURL(iconFileRef),
                  image: await getDownloadURL(imageFileRef),
                },
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to get rewards info! ->" + e
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
 * Called when connecting to the match.
 * This is a latency-critical function.
 *
 */
export const matchSubscribePlayerGetQuestionsGetRewards =
    onCall(
        {
          region: "europe-west1",
          minInstances: 1,
        },
        async (request) => {
          const {
            key,
            baseCollection,
            matchId,
            questionsId,
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
            if (!questionsId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing questionsId!"
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
              const storage = getStorage().bucket("mcquiz-global.appspot.com");

              const questionModel = new McQuizQuestionModel(baseCollection);
              const mcQuizRewardModelApp = new McQuizRewardModel(
                  baseCollection.toString(),
                  locale.toString(),
              );
              const mcQuizMatchModelApp = new McQuizMatchModel(
                  baseCollection.toString(),
              );

              /* 1 - GET MATCH QUESTIONS */
              const questions = [];

              // Prepare questions
              for (const [index, questionId] of questionsId.entries()) {
                const questionSnapshot = await questionModel.getQuestionWithId(questionId);
                const questionData = questionSnapshot.data();

                const fileRef = storage.file(questionData?.image);
                const image= await getDownloadURL(fileRef);

                const questionChoices = await questionModel.getQuestionChoices(questionId, locale);
                const questionChoicesData = questionChoices.data();

                questions.push({
                  _key: questionId,
                  questionNumber: index + 1,
                  title: questionChoicesData?.title,
                  explanation: questionChoicesData?.explanation,
                  choices: questionChoicesData?.choices,
                  timeLimit: questionData?.timeLimit,
                  image,
                });
              }

              /* 2 - GET MATCH REWARDS */
              const rewardsSnapshot = await mcQuizRewardModelApp.getRewards(
                  matchId,
              );

              let rewards = null;

              if (rewardsSnapshot.exists) {
                const rewardsData = rewardsSnapshot.data();

                const iconFileRef = storage.file(rewardsData?.rewardIcon);
                const imageFileRef = storage.file(rewardsData?.rewardImage);
                const standardRewardImageFileRef = storage.file(rewardsData?.standardReward.rewardImage);
                const premiumRewardImageFileRef = storage.file(rewardsData?.premiumReward.rewardImage);

                rewards = {
                  icon: await getDownloadURL(iconFileRef),
                  image: await getDownloadURL(imageFileRef),
                  standard: {
                    name: rewardsData.standardReward.rewardName,
                    image: await getDownloadURL(standardRewardImageFileRef),
                  },
                  premium: {
                    name: rewardsData.premiumReward.rewardName,
                    image: await getDownloadURL(premiumRewardImageFileRef),
                  },
                };
              }


              /* 3 - SUBSCRIBE PLAYER TO MATCH */
              await mcQuizMatchModelApp.matchSubscribePlayer(
                  matchId.toString(),
                  playerId.toString(),
                  locale.toString()
              );

              return {
                success: true,
                message: "Player subscribed and data retrieved!",
                questionsRewards: {
                  questions,
                  rewards,
                },
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to subscribe player to game or get questions or get rewards! ->" + e
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
 * Called when connecting to the match.
 * This is a latency-critical function.
 *
 */
export const matchGetQuestions =
    onCall(
        {
          region: "europe-west1",
          minInstances: 1,
        },
        async (request) => {
          const {
            key,
            baseCollection,
            matchId,
            questionsId,
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
            if (!questionsId) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing questionsId!"
              );
            }
            if (!locale) {
              throw new HttpsError(
                  "failed-precondition",
                  "Missing locale!"
              );
            }

            try {
              const storage = getStorage().bucket("mcquiz-global.appspot.com");

              const questionModel = new McQuizQuestionModel(baseCollection);
              const mcQuizMatchModelApp = new McQuizMatchModel(
                  baseCollection.toString(),
              );

              /* 1 - CHECK MATCH TO AVOID CHEATING */
              const querySnapshot = await mcQuizMatchModelApp.getMatch(matchId.toString());
              if (!querySnapshot.exists) {
                return {
                  success: false,
                  message: "This match doesn't exist!",
                };
              }

              const matchData = querySnapshot.data();

              if (matchData?.status !== "completed") {
                return {
                  success: false,
                  message: "This match is not available!",
                };
              }

              /* 2 - GET MATCH QUESTIONS */
              const questions = [];

              // Prepare questions
              for (const [index, questionId] of questionsId.entries()) {
                const questionSnapshot = await questionModel.getQuestionWithId(questionId);
                const questionData = questionSnapshot.data();

                const fileRef = storage.file(questionData?.image);
                const image= await getDownloadURL(fileRef);

                const questionChoices = await questionModel.getQuestionChoices(questionId, locale);
                const questionChoicesData = questionChoices.data();

                questions.push({
                  _key: questionId,
                  questionNumber: index + 1,
                  title: questionChoicesData?.title,
                  explanation: questionChoicesData?.explanation,
                  choices: questionChoicesData?.choices,
                  timeLimit: questionData?.timeLimit,
                  image,
                });
              }

              return {
                success: true,
                message: "Questions data retrieved!",
                questions,
              };
            } catch (e) {
              throw new HttpsError(
                  "internal", "Failed to subscribe player to game or get questions or get rewards! ->" + e
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
 * Called when leaving the match.
 * This is not a latency-critical function.
 *
 */
export const matchUnSubscribePlayer =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
 * Called when in-game.
 * This is a latency-critical function.
 *
 */
export const matchSubmitPlayerAnswer =
    onCall(
        {
          region: "europe-west1",
          minInstances: 1, // Keep 10 instances warm for this latency-critical function
        },
        async (request) => {
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
 * Called in match final result.
 * This is not a latency-critical function.
 *
 */
export const matchSubmitPlayerCouponActivation =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
 * Called in match final result.
 * BUT This is not a latency-critical function.
 *
 */
export const matchSubmitPlayerRating =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
 * Called in profile and match waiting room.
 * This is not a latency-critical function.
 *
 */
export const playerUpdateAvatar =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
 * Called in profile page.
 * This is not a latency-critical function.
 *
 */
export const playerUpdateNickname =
    onCall(
        {
          region: "europe-west1",
        },
        async (request) => {
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
