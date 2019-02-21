const Discord = require("discord.js");
const dotenv = require("dotenv");
const polka = require("polka");
const bodyParser = require("body-parser");
const templateMsg = require("./template/discordMessage.json");

dotenv.config();

const gitWebHook = new Discord.WebhookClient(process.env.GIT_WEBHOOK_ID, process.env.GIT_WEBHOOK_TOKEN);
const allMessages = [];

function regroupHookInfos(embed) {
    if (Allmessages.length === 0) {
        setTimeout(() => regroupHookInfos(allMessages), 5000);

        return;
    }
    // regrouper weebhook les greekeeper et ceux des differents auteurs
    // si greekeeper formater la description pour greenkeeper
    // si autre description de tout les post de tous les commits 
    // quand on send sur discord, reinitialiser allMessages
}
regroupHookInfos(allMessages);

const server = polka();
server.use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .post("/gitWebHook", (req, res) => {
        const { sender: {
            avatar_url, login, html_url
        }, repository: {
            name, default_branch
        }, compare, commits } = req.body;
        const isGreenkeeper = login === "greenkeeper[bot]";
        const color = isGreenkeeper ? 51061 : 16185594;
        const thumbnail = isGreenkeeper ? "https://avatars0.githubusercontent.com/u/13812225?s=280&v=4 "
            : "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/1200px-Octicons-mark-github.svg.png";
        const author = {
            icon_url: avatar_url,
            name: login,
            url: html_url
        };
        const repo = { name, default_branch };
        const msg = { author, repo, color, thumbnail, commits, compare };
        console.log(msg);

        Allmessages.push(msg);
        /*
        templateMsg.embeds[0].author.icon_url = req.body.sender.avatar_url;
        templateMsg.embeds[0].author.name = req.body.sender.login;
        templateMsg.embeds[0].author.url = req.body.sender.html_url;

        templateMsg.embeds[0].url = req.body.compare;

        if (req.body.sender.login === "greenkeeper[bot]") {
            templateMsg.embeds[0].title = `Update`

            templateMsg.embeds[0].thumbnail.url = "https://avatars0.githubusercontent.com/u/13812225?s=280&v=4";
            templateMsg.embeds[0].footer.icon_url = "https://avatars0.githubusercontent.com/u/13812225?s=280&v=4";
            templateMsg.embeds[0].footer.text = "GreenKeeper";
            templateMsg.embeds[0].color = 51061;
        }
        else {
            const repoName = req.body.repository.name;
            const branch = req.body.ref.split("/").reverse()[0];
            templateMsg.embeds[0].title = `[${repoName}:${branch}] ${req.body.commits.length} commits`;
            templateMsg.embeds[0].description = req.body.commits
                .reduce((desc, currVal) => `${desc}[${currVal.id.substring(0, 7)}](${currVal.url}) ${currVal.message} \n`, []);
            // eslint-disable-next-line
            
            templateMsg.embeds[0].thumbnail.url = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/1200px-Octicons-mark-github.svg.png";
            templateMsg.embeds[0].footer.icon_url = "https://cdn0.iconfinder.com/data/icons/octicons/1024/git-branch-512.png";
            templateMsg.embeds[0].footer.text = "GitHub";
            templateMsg.embeds[0].color = 16185594;
            console.log("message envoyer");
            // gitWebHook.send(templateMsg);
        }
        */
    })
    .listen(3000, () => {
        console.log("Server Start in port 3000");
    });
