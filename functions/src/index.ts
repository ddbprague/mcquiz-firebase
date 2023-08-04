import * as admin from "firebase-admin";

admin.initializeApp();

exports.production = require("./functionsGroupProduction");
exports.development = require("./functionsGroupDevelopment");
