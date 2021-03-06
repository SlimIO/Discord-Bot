"use strict";

// Require Third-party Dependencies
require("dotenv").config();
require("make-promises-safe");
const Discord = require("discord.js");
const polka = require("polka");
const bodyParser = require("body-parser");
const send = require("@polka/send");

// Require Internal Dependencies
const templateMsg = require("./template/discordMessage.json");

// CONSTANTS
const GK_ICON = "https://imgur.com/Rk6r0Oo";
const GIT_ICON = "https://imgur.com/Q2belQu";
const GIT_ICON_FOOTER = "https://imgur.com/kSGv3fz";
const WRITE_TIME_MS = 10000;

// Globals
const contributors = new Map();
const listRepoName = new Set();

// Discord Web hook
const gitWebHook = new Discord.WebhookClient(
    process.env.WEBHOOK_ID,
    process.env.WEBHOOK_TOKEN
);

/**
 * @function getDesc
 * @param {!Array<object>} commits An array send by git through his webhooks
 *
 * @returns {string} represents the concatenation of the message contained in each commit
 *
 */
function getDesc(commits) {
    return commits
        .reduce((desc, currVal) => `${desc}[${currVal.id.substring(0, 7)}](${currVal.url}) ${currVal.message} \n`, []);
}

/**
 * @function getGreenKeeperDesc
 * @param {!Array<object>} commits An array send by git through his webhooks
 * @param {string} repoName name of the repository
 *
 * @returns {string} represents the concatenation of the message contained in each commit
 *
 */
function getGreenKeeperDesc(commits, repoName) {
    return commits
        .reduce((desc, currVal) => `${desc}[${currVal.id.substring(0, 7)}](${currVal.url}) ${repoName} \n`, []);
}


/**
 * @function getEmbed
 * @param {!object} gitWebHookInfos A git webhook destructured and lightened object
 * @param {string} gitWebHookInfos.avatar_url An url of the logo of the git contributor
 * @param {string} gitWebHookInfos.login Name of the git contributor
 * @param {string} gitWebHookInfos.html_url Git URL of the contributor's profile
 * @param {string} gitWebHookInfos.name Name of the git repository
 * @param {string} gitWebHookInfos.Branch Name of the git branch
 * @param {string} gitWebHookInfos.compare Git URL of the comparison page between two commits
 * @param {Array<object>} gitWebHookInfos.commits Array of commits
 * @param {!boolean} isNewContributor if the login of the git account appear for the first time : it will be a new contributor
 *
 * @returns {object} Represents an object that allow to builds a message into discord
 *
 */
function getEmbed(gitWebHookInfos, isNewContributor) {
    const { avatar_url, login, html_url, name, branch, compare, commits } = gitWebHookInfos;
    const isGreenkeeper = login === "greenkeeper[bot]";
    if (!isNewContributor && !isGreenkeeper) {
        const contributor = contributors.get(login);
        const lastIndx = contributor.embeds.size - 1;
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
    obj.title = isGreenkeeper ? "Update " : `[${name}:${branch}] ${commits.length} commits`;
    obj.url = isGreenkeeper ? "" : compare;

    obj.author = author;
    if (isGreenkeeper && isNewContributor) {
        // eslint-disable-next-line
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

// At regular time interval, this function will write on discord all commits infos grouped by contributors to avoid flood
setInterval(function writeOnDiscord() {
    if (contributors.size === 0) {
        return;
    }

    try {
        for (const embed of contributors.values()) {
            gitWebHook.send(embed);
        }
        listRepoName.clear();
        contributors.clear();
    }
    catch (err) {
        console.error(err);
        console.log("Failed to write Discord embeds!");
    }
}, WRITE_TIME_MS);

/**
 * @function isSkippable
 * @param {*} body body
 * @returns {boolean}
 */
function isSkippable(body) {
    if (Reflect.has(body, "zen")) {
        return true;
    }
    if (Reflect.has(body, "action")) {
        return true;
    }

    return false;
}

const server = polka();
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());

server.post("/gitWebHook", (req, res) => {
    try {
        if (isSkippable(req.body)) {
            return send(res, 200, "Action skipped!");
        }

        const {
            sender: { avatar_url, login, html_url },
            repository: { name }, ref, compare, commits
        } = req.body;

        const branch = ref.split("/").pop();
        const gitWebHookInfos = {
            avatar_url, login, html_url, name, branch, compare, commits
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
            const [, packageName] = /update\s(.*)\sto/.exec(commits[0].message);
            const pluralName = listRepoName.size <= 1 ? "repository" : "repositories";
            embeds.embeds[0].title = `Update ${packageName} in ${listRepoName.size} ${pluralName}`;
        }
        contributors.set(login, embeds);

        return send(res, 200, "Everything is fine!");
    }
    catch (err) {
        console.error(err);
        console.log(JSON.stringify(req.body, null, 4));

        return send(res, 500, err.message);
    }
});

const port = process.env.HTTP_PORT || 3000;
server.listen(port, () => console.log(`WEBHOOK HTTP Server listening on port => ${port}`));
