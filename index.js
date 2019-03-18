const Discord = require("discord.js");
const dotenv = require("dotenv");
const polka = require("polka");
const bodyParser = require("body-parser");
const templateMsg = require("./template/discordMessage.json");

// const GreenKeeper = require("./src/greenKeeper.class");
const GK_ICON = "https://imgur.com/Rk6r0Oo";
const GIT_ICON = "https://imgur.com/Q2belQu";
const GIT_ICON_FOOTER = "https://imgur.com/kSGv3fz";

dotenv.config();

const gitWebHook = new Discord.WebhookClient(process.env.WEBHOOK_ID, process.env.WEBHOOK_TOKEN);

const contributors = new Map();
const listRepoName = new Set();

function getDesc(commits) {
    return commits
        .reduce((desc, currVal) => `${desc}[${currVal.id.substring(0, 7)}](${currVal.url}) ${currVal.message} \n`, []);
}

function getGreenKeeperDesc(commits, repoName) {
    return commits
        .reduce((desc, currVal) => `${desc}[${currVal.id.substring(0, 7)}](${currVal.url}) ${repoName} \n`, []);
}

function getEmbed(gitWebHookInfos, isNewContributor) {
    const { avatar_url, login, html_url, name, branch, compare, commits } = gitWebHookInfos;
    const isGreenkeeper = login === "greenkeeper[bot]";
    if (!isNewContributor && !isGreenkeeper) {
        const contributor = contributors.get(login);
        const lastIndx = contributor.embeds.length - 1;
        delete contributor.embeds[lastIndx].footer;
    }
    const embeds = isNewContributor ? { embeds: [] } : contributors.get(login);
    const obj = JSON.parse(JSON.stringify(templateMsg));

    const author = {
        icon_url: avatar_url,
        name: login,
        url: html_url
    };
    const footer = {
        icon_url: isGreenkeeper ? GK_ICON : GIT_ICON_FOOTER,
        text: isGreenkeeper ? "GreenKeeper" : "GitHub"
    };

    obj.color = isGreenkeeper ? 51061 : 16185594;
    obj.author = author;
    obj.title = isGreenkeeper ? "Update " : `[${name}:${branch}] ${commits.length} commits`;
    obj.url = isGreenkeeper ? "" : compare;
    if (isGreenkeeper && isNewContributor) {
        obj.description = `**commit message** : ${commits[0].message}\n\n__Liste des package mis a jours__:\n${getGreenKeeperDesc(commits, name)}`;
    }
    else {
        obj.description = isGreenkeeper ? getGreenKeeperDesc(commits, name) : getDesc(commits);
    }
    obj.footer = footer;
    obj.thumbnail.url = isGreenkeeper ? GK_ICON : GIT_ICON;

    embeds.embeds.push(obj);

    return embeds;
}

function writeOnDiscord() {
    if (contributors.length === 0) {
        setTimeout(writeOnDiscord, 10000);
        console.log("return");

        return;
    }

    for (const embed of contributors.values()) {
        gitWebHook.send(embed);
    }
    listRepoName.clear();
    contributors.clear();
    setTimeout(writeOnDiscord, 10000);
    console.log("end");
}
writeOnDiscord();

const server = polka();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.post("/gitWebHook", (req, res) => {
    const {
        sender: { avatar_url, login, html_url },
        repository: { name }, ref, compare, commits
    } = req.body;
    const branch = ref.split("/").reverse()[0];
    const gitWebHookInfos = {
        avatar_url,
        login,
        html_url,
        name,
        branch,
        compare,
        commits
    };
    const isGreenkeeper = login === "greenkeeper[bot]";
    let embeds = null;

    if (contributors.has(login)) {
        embeds = isGreenkeeper ? contributors.get(login) : getEmbed(gitWebHookInfos, false);
        if (isGreenkeeper) {
            embeds.embeds[0].description += getGreenKeeperDesc(commits, name);
        }
    }
    else {
        embeds = getEmbed(gitWebHookInfos, true);
    }

    if (isGreenkeeper) {
        listRepoName.add(name);
        const packageName = commits[0].message.split("update")[1].split("to")[0].trim();
        const plurialRepoNAme = listRepoName.size <= 1 ? "repository" : "repositories";
        embeds.embeds[0].title = `Update ${packageName} in ${listRepoName.size} ${plurialRepoNAme}`;
    }

    // const gkObject = new GreenKeeper(gitWebHookInfos);
    // gkObject.getEmbed();

    contributors.set(login, embeds);
    console.log("Message enregistre");
});

server.post("/greenKeeper", (req, res) => {
    console.log("\n");
    console.log(JSON.stringify(req.body));
    console.log("\n");
});

server.listen(3000, () => {
    console.log("Server Start in port 3000");
});
