import * as admin from "firebase-admin";

export type CreatePlayerData = {[p: string]: any} & admin.firestore.AddPrefixToKeys<string, any>
