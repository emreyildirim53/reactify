require('dotenv').config();
require("./mongo/connect");
const express = require("express");
const app = express();

app.use(express.json());

const emojiRouter = require("./server/routes/emoji");
const tokenRouter = require("./server/routes/auth");
const commentRouter = require("./server/routes/comment");

const emojiReactionRouter = require("./client/routes/emojiReaction");

const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API çalışıyor...");
});

app.use("/v1/admin/emoji", emojiRouter);
app.use("/v1/admin/token", tokenRouter);
app.use("/v1/admin/comment", commentRouter);

app.use("/v1/client/emoji", emojiReactionRouter);

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`API ${port} portunda çalışıyor...`));
