require('dotenv').config();
const express = require("express");
const app = express();
const db = require("./mongo/connect");

app.use(express.json());

const emojiRouter = require("./routes/emoji");
const tokenRouter = require("./routes/token");
const commentRouter = require("./routes/comment");
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API çalışıyor...");
});


app.use("/v1/emoji", emojiRouter);
app.use("/v1/token", tokenRouter);
app.use("/v1/comment", commentRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`API ${port} portunda çalışıyor...`));
