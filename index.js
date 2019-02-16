const discord = require('discord.js');
const dotenv = require('dotenv');
const polka = require("polka");
const bodyParser = require("body-parser");

dotenv.config();

const bot = new discord.Client();

bot.login(process.env.BOT_TOKEN);

const server = polka();
server.use(bodyParser.urlencoded({extended: false}))
  .use(bodyParser.json())
  .post("/gitWebHook", (req, res) => {
    const branch = req.body.ref.split("/").reverse()[0];
    const avatarUrl = req.body.sender.avatar_url;
    const login = req.body.sender.login;
    const userUrl = req.body.sender.html_url;
    const repoName = req.body.repository.name;
    const commits = req.body.commits.map(commit => (
      {
        "id" : commit.id.substring(0,7),
        "msg" : commit.message, 
        "timestamp" : commit.timestamp
      }
    ));
  })
  .listen(3000, () => {
  console.log("Server Start in port 3000");  
});
