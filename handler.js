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

app.get("/", (req, res) => {
  res.send("hello");
});

app.post("/login", async function (req, res) {
  if (!req.body.email || !req.body.password)
    return res.status(404).send({ error: "Wrong email or password" });

  const email = utils.htmlEncoded(req.body.email);
  const password = utils.htmlEncoded(req.body.password);

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
      process.env.jwtSecretKey,
      { expiresIn: "12h" }
    );
    return res.json({ token });
  } else {
    return res.status(404).send({ error: "Wrong email or password" });
  }
});

app.get("/user-profile", async function (req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.jwtSecretKey, async (err, decoded) => {
      if (err) return res.sendStatus(403);
      let user;
      try {
        user = await getByEmail(decoded.email);
        res.json({ email: user.email, pseudo: user.pseudo });
      } catch (err) {
        res.sendStatus(401);
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.get("/question/:questionId", async function (req, res) {
  if (!req.params.questionId) return res.sendStatus(403);
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.jwtSecretKey, async (err, decoded) => {
      if (err) return res.sendStatus(403);
      if (decoded.email) {
        const { questionId } = req.params;
        let question;
        switch (questionId) {
          case "1":
            question = "J???entre dur et long , je ressors mou et petit";
            break;
          case "2":
            question = "Plus je suis frais, plus je suis chaud";
            break;
          case "3":
            question =
              "Je vous lie et vous additionne vous m'utilisez sans cesse et pourtant trop pr??sent je deviens une g??ne";
            break;

          case "4":
            question =
              "En ton honneur ce jeu est cr????, tu es pour moi la douceur des nuits de Don Quichotte";
            break;

          case "5":
            question =
              "Je peux ??tre noir et rec??le pourtant d???un tas de couleurs, gare ?? vos yeux lorsque je suis ??blouissant";
            break;

          case "6":
            question = "Je suis un cadeau mais je peux ??tre repris";
            break;

          case "7":
            question =
              "Intervalle parfait j???ai aussi une arm??e sous mes ordres";
            break;

          case "8":
            question =
              "Chronophage et addictif, j'absorbe l'attention et refl??te la beaut??";
            break;

          case "9":
            question = "Je rassemble la force, la sagesse et le courage";
            break;

          case "10":
            question =
              "Je vole la vie de l'autre, je risque gros mais ai un but pr??cis";
            break;

          case "11":
            question =
              "Elle m'a perdu, moi qui fut son professeur et son amant, moi qui la mena dans les plus hautes sph??res du chant";
            break;

          case "12":
            question =
              "Aussi bref et derni??rement, pour finir ou pour r??sumer finalement";
            break;

          case "13":
            question =
              "Arriv?? ?? la fin du chemin, la solution demeure dans chacune de tes r??ponses??: Chewing-gum ,Le pain,Et,Dulcin??e ,Ecran,Vie,Octave,Instagram, Triforce,Usurpateur,Ren??,Enfin ";
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
  if (!req.params.reponseId) return res.sendStatus(403);
  if (!req.body.userResponse) return res.sendStatus(403);
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.jwtSecretKey, async (err, decoded) => {
      if (err) return res.sendStatus(403);
      if (decoded.email) {
        const { reponseId } = req.params;
        let userResponse = utils.htmlEncoded(req.body.userResponse);

        let reponse;
        let nextQuestionId;

        userResponse = userResponse.trim();

        switch (reponseId) {
          case "1":
            if (
              userResponse === "chewing-gum" ||
              userResponse === "chewinggum" ||
              userResponse === "chewing gum" ||
              userResponse === "Chewing-gum" ||
              userResponse === "Chewinggum" ||
              userResponse === "Chewing gum"
            ) {
              reponse = true;
              nextQuestionId = 2;
              break;
            } else {
              reponse = false;
              nextQuestionId = 1;
              break;
            }
          case "2":
            if (
              userResponse === "Le pain" ||
              userResponse === "pain" ||
              userResponse === "le pain" ||
              userResponse === "Pain"
            ) {
              reponse = true;
              nextQuestionId = 3;
              break;
            } else {
              reponse = false;
              nextQuestionId = 2;
              break;
            }

          case "3":
            if (userResponse === "Et" || userResponse === "et") {
              reponse = true;
              nextQuestionId = 4;
              break;
            } else {
              reponse = false;
              nextQuestionId = 3;
              break;
            }

          case "4":
            if (
              userResponse === "Dulcin??e" ||
              userResponse === "dulcin??e" ||
              userResponse === "dulcinee"
            ) {
              reponse = true;
              nextQuestionId = 5;
              break;
            } else {
              reponse = false;
              nextQuestionId = 4;
              break;
            }

          case "5":
            if (
              userResponse === "Ecran" ||
              userResponse === "??cran" ||
              userResponse === "ecran" ||
              userResponse === "??cran"
            ) {
              reponse = true;
              nextQuestionId = 6;
              break;
            } else {
              reponse = false;
              nextQuestionId = 5;
              break;
            }

          case "6":
            if (userResponse === "vie" || userResponse === "Vie") {
              reponse = true;
              nextQuestionId = 7;
              break;
            } else {
              reponse = false;
              nextQuestionId = 6;
              break;
            }

          case "7":
            if (userResponse === "Octave" || userResponse === "octave") {
              reponse = true;
              nextQuestionId = 8;
              break;
            } else {
              reponse = false;
              nextQuestionId = 7;
              break;
            }

          case "8":
            if (
              userResponse === "Instagrame" ||
              userResponse === "instagrame" ||
              userResponse === "Instagram" ||
              userResponse === "instagram"
            ) {
              reponse = true;
              nextQuestionId = 9;
              break;
            } else {
              reponse = false;
              nextQuestionId = 8;
              break;
            }

          case "9":
            if (
              userResponse === "La triforce" ||
              userResponse === "la triforce" ||
              userResponse === "Triforce" ||
              userResponse === "triforce"
            ) {
              reponse = true;
              nextQuestionId = 10;
              break;
            } else {
              reponse = false;
              nextQuestionId = 9;
              break;
            }

          case "10":
            if (
              userResponse === "Usurpateur" ||
              userResponse === "usurpateur"
            ) {
              reponse = true;
              nextQuestionId = 11;
              break;
            } else {
              reponse = false;
              nextQuestionId = 10;
              break;
            }

          case "11":
            if (
              userResponse === "Ren??" ||
              userResponse === "ren??" ||
              userResponse === "rene" ||
              userResponse === "Rene"
            ) {
              reponse = true;
              nextQuestionId = 12;
              break;
            } else {
              reponse = false;
              nextQuestionId = 11;
              break;
            }

          case "12":
            if (userResponse === "Enfin" || userResponse === "enfin") {
              reponse = true;
              nextQuestionId = 13;
              break;
            } else {
              reponse = false;
              nextQuestionId = 12;
              break;
            }

          case "13":
            if (
              userResponse === "Cl?? de voiture" ||
              userResponse === "Clef de voiture" ||
              userResponse === "Cl?? de la voiture" ||
              userResponse === "Clef de la voiture" ||
              userResponse === "cl?? de voiture" ||
              userResponse === "clef de voiture" ||
              userResponse === "cl?? de la voiture" ||
              userResponse === "clef de la voiture" ||
              userResponse === "la Cl?? de voiture" ||
              userResponse === "la Clef de voiture" ||
              userResponse === "la Cl?? de la voiture" ||
              userResponse === "la Clef de la voiture" ||
              userResponse === "la cl?? de voiture" ||
              userResponse === "la clef de voiture" ||
              userResponse === "la cl?? de la voiture" ||
              userResponse === "la clef de la voiture" ||
              userResponse === "La Cl?? de voiture" ||
              userResponse === "La Clef de voiture" ||
              userResponse === "La Cl?? de la voiture" ||
              userResponse === "La Clef de la voiture" ||
              userResponse === "La cl?? de voiture" ||
              userResponse === "La clef de voiture" ||
              userResponse === "La cl?? de la voiture" ||
              userResponse === "La clef de la voiture"
            ) {
              reponse = true;
              nextQuestionId = 14;
              break;
            } else {
              reponse = false;
              nextQuestionId = 13;
              break;
            }

          default:
            reponse = false;
            nextQuestionId = 0;
            break;
        }
        res.json({ reponse, nextQuestionId });
      }
    });
  } else {
    res.sendStatus(401);
  }
});

app.post("/register", async function (req, res) {
  if (!req.body.email || !req.body.password || !req.body.pseudo)
    return res.status(404).send({ error: "Wrong email or password or pseudo" });

  const email = utils.htmlEncoded(req.body.email);
  const password = utils.htmlEncoded(req.body.password);
  const pseudo = utils.htmlEncoded(req.body.pseudo);

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
