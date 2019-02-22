const Discord = require("discord.js");
const dotenv = require("dotenv");
const polka = require("polka");
const bodyParser = require("body-parser");
const templateMsg = require("./template/discordMessage.json");

dotenv.config();

const gitWebHook = new Discord.WebhookClient(process.env.GIT_WEBHOOK_ID, process.env.GIT_WEBHOOK_TOKEN);

const contributors = new Map();

function getDesc(commits) { 
    return commits
        .reduce((desc, currVal) => `${desc}[${currVal.id.substring(0, 7)}](${currVal.url}) ${currVal.message} \n`, []);
}

function getEmbed(requestBody, isNewContributor) {
    const { avatar_url, login, html_url, name, branch, compare, commits } = requestBody;
    if (!isNewContributor) {
        const contributor = contributors.get(login);
        const lastIndx = contributor.embeds.length - 1;        
        delete contributor.embeds[lastIndx].footer;
    }
    const embeds = isNewContributor ? { embeds: [] } : contributors.get(login);
    const obj = JSON.parse(JSON.stringify(templateMsg));

    const isGreenkeeper = login === "greenkeeper[bot]";
    const author = {
        icon_url: avatar_url,
        name: login,
        url: html_url
    };
    const footer = {
        icon_url: isGreenkeeper ? "https://avatars0.githubusercontent.com/u/13812225?s=280&v=4"
            : "https://cdn0.iconfinder.com/data/icons/octicons/1024/git-branch-512.png",
        text: isGreenkeeper ? "GreenKeeper" : "GitHub"
    };

    obj.color = isGreenkeeper ? 51061 : 16185594;
    obj.author = author;
    obj.title = isGreenkeeper ? "" : `[${name}:${branch}] ${commits.length} commits`;
    obj.url = compare;
    obj.description = getDesc(commits);
    obj.footer = footer;
    obj.thumbnail.url = isGreenkeeper ? "https://avatars0.githubusercontent.com/u/13812225?s=280&v=4"
        : "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/1200px-Octicons-mark-github.svg.png";

    embeds.embeds.push(obj);

    return embeds;
}

function writeOnDiscord() {
    if (contributors.length === 0) {
        setTimeout(() => writeOnDiscord(), 10000);
        console.log("return");

        return;
    }

    contributors.clear();
    console.log(contributors);
    setTimeout(() => writeOnDiscord(), 10000);
    console.log("end");
}
// writeOnDiscord();

const server = polka();
server.use(bodyParser.urlencoded({ extended: false }))
    .use(bodyParser.json())
    .post("/gitWebHook", (req, res) => {
        const { sender: {
            avatar_url, login, html_url
        }, repository: {
            name, default_branch: branch
        }, compare, commits } = req.body;
        const requestBody = {
            avatar_url,
            login, html_url,
            name,
            branch,
            compare,
            commits
        };

        if (contributors.has(login)) {
            const embeds = getEmbed(requestBody, false);
            console.log(JSON.stringify(embeds));
            // contributors.set(login, embeds);
        }
        else {
            const embeds = getEmbed(requestBody, true);
            contributors.set(login, embeds);
        }

        console.log("Message enregistre");
    })
    .listen(3000, () => {
        console.log("Server Start in port 3000");
    });
