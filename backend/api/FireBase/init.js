const Firebase = require("firebase-admin");
const serviceAccountKey = require("./serviceAccountKey.json");

Firebase.initializeApp({
  credential: Firebase.credential.cert(serviceAccountKey),
});

module.exports = Firebase;
