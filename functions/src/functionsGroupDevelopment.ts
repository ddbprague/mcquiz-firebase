import {onRequest} from "firebase-functions/v2/https";
import {McQuizMatchApp} from "./extentions/mcQuizMatch";
import {McQuizDummies} from "./extentions/mcQuizDummies";


/**
 * Note: Cloud Function V2.
 *
 */
export const gameEmulatorCz =
    onRequest(
        {
          region: "europe-west1",
          timeoutSeconds: 300,
          memory: "2GiB",
        },
        async (req, res) => {
          const secondsAdded = 90;
          const minutesLobbyOpened = 5;

          const mcQuizMatchApp = new McQuizMatchApp(
              secondsAdded,
              minutesLobbyOpened,
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
export const createDummies =
    onRequest(
        {
          region: "europe-west1",
          timeoutSeconds: 120,
          memory: "4GiB",
        },
        async (req, res) => {
          const maxNewPlayers = 5;
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
