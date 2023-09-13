// @author/developer: Aryan yadav
// linkedin profile: aryanyadav7678319417
// This api is trained for Taxmechanic chatbot response


const express = require("express");
const { containerBootstrap } = require("@nlpjs/core");
const { Nlp } = require("@nlpjs/nlp");
const { LangEn } = require("@nlpjs/lang-en-min");
const cors = require("cors");
const importFresh = require("import-fresh");
require('dotenv').config();

// Firebase Starts here
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get } = importFresh("firebase/database");

const firebaseConfig = {
  databaseURL: process.env.DB_URL,
};

// Initialize Firebase
const fbApp = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const db = getDatabase();

async function readUserData(botId) {
  try {
    const chatbotRef = ref(db, `chatbot/${botId}/botData`);
    const snapshot = await get(chatbotRef);

    if (snapshot.exists()) {
      const data = snapshot.val();
      return data; // Return the data
    } else {
      return null; // Return null if no data is available
    }
  } catch (error) {
    console.error("Error reading data:", error);
    throw error; // Re-throw the error to handle it elsewhere if needed
  }
}

// Firebase ends here

const app = express();
const port = process.env.PORT;

app.use(
  cors({
    origin: ["http://127.0.0.1:5500", "https://www.taxmechanic.ca"], // Allow requests from this origin
    methods: "GET,POST", // Allow specific HTTP methods
  })
);

app.use(express.json());

app.post("/process", async (req, res) => {
  try {

    //destructuring the response
    const reqMessage = req.body.message;

    // model setup
    const container = await containerBootstrap();
    container.use(Nlp);
    container.use(LangEn);
    const nlp = container.get("nlp");
    nlp.settings.autoSave = false;
    nlp.addLanguage("en");

    // getting the raw trained model
    const modelTrainedStr = await readUserData("gdhry476rgfh");
    const modelTrained = JSON.parse(modelTrainedStr);

    // Load the NLP model from the JSON object
    nlp.fromJSON(modelTrained);

    // TAKING RESPONSE OF MESSAGE
    const response = await nlp.process("en", reqMessage);
    const answer = response.answer;

    res.status(200).json({ message: answer });

  } catch (error) {
    res.status(500).json({ error: error.text });
  }
});

// GET endpoint for testing
app.get("/test", (req, res) => {
  try {
    res.status(200).json({ message: "Hi there" });
  } catch (error) {
    res.status(500).json({ error: error.text });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
