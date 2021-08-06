const AWS = require("aws-sdk");
const express = require("express");
const serverless = require("serverless-http");
const utils = require("./utils");
const { nanoid } = require("nanoid");
const { getByEmail } = require("./helpers");
const helmet = require("helmet");
const app = express();
const jwt = require("jsonwebtoken");

const USERS_TABLE = process.env.USERS_TABLE;
const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

app.use(helmet());
app.use(express.json());
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("x-powered-by", "serverless-express");
  next();
});

app.options(`*`, (req, res) => {
  res.status(200).send();
});

app.post("/login", async function (req, res) {
  const { email, password } = req.body;
  let user;
  try {
    user = await getByEmail(email);
  } catch (error) {
    return res
      .status(404)
      .send({ error: "Authentication failed. User not found." });
  }
  if (!user) {
    return res
      .status(404)
      .send({ error: "Authentication failed. User not found." });
  }
  const goodPassword = utils.comparePassword(password, user.password);
  if (goodPassword) {
    const token = jwt.sign(
      {
        email,
      },
      "secret-YTiuugy67fUJ-5FffnC",
      { expiresIn: "12h" }
    );
    return res.json({ token });
  }
});

app.get("/user-profile", async function (req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secret-YTiuugy67fUJ-5FffnC", async (err, decoded) => {
      if (err) return res.sendStatus(403);
      let user;
      try {
        user = await getByEmail(decoded.email);
        res.json({ email: user.email, pseudo: user.pseudo });
      } catch (err) {
        console.log("====================================");
        console.log(err);
        console.log("====================================");
        res.sendStatus(401);
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.get("/question/:questionId", async function (req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secret-YTiuugy67fUJ-5FffnC", async (err, decoded) => {
      if (err) return res.sendStatus(403);
      if (decoded.email) {
        console.log("===req.params============================");
        console.log(req.params.questionId);
        console.log("====================================");
        const { questionId } = req.params;
        let question;
        switch (questionId) {
          case "1":
            question = "question 1";
            break;
          case "2":
            question = "question 2";
            break;
          case "3":
            question = "question 3";
            break;
          default:
            question = "Erreur";
            break;
        }
        res.json({ question, questionId });
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.post("/reponse/:reponseId", async function (req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, "secret-YTiuugy67fUJ-5FffnC", async (err, decoded) => {
      if (err) return res.sendStatus(403);
      if (decoded.email) {
        console.log("===req.params============================");
        console.log(req.params.reponseId);
        console.log("====================================");
        const { reponseId } = req.params;
        const { userResponse } = req.body;
        let reponse;
        switch (reponseId) {
          case "1":
            if (userResponse === "aaa") {
              reponse = true;
              break;
            } else {
              repsonse = false;
            }
          case "2":
            if (userResponse === "bbb") {
              reponse = true;
              break;
            } else {
              repsonse = false;
            }
            break;
          case "3":
            if (userResponse === "ccc") {
              reponse = true;
              break;
            } else {
              repsonse = false;
            }
            break;
          default:
            reponse = false;
            break;
        }
        res.json({ reponse });
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.post("/register", async function (req, res) {
  const { pseudo, email, password } = req.body;
  const hashPassword = utils.hashPassword(password);
  if (!pseudo || !email || !password) {
    res.status(400).json({ error: true });
  }

  const params = {
    TableName: USERS_TABLE,
    Item: {
      id: nanoid(),
      userId: email,
      pseudo,
      email,
      password: hashPassword,
    },
  };

  try {
    await dynamoDbClient.put(params).promise();
    res.json({ isRegister: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ isRegister: false });
  }
});

app.use((req, res, next) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
