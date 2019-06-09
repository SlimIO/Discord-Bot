# SlimIO Discord bot
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/discordBot/master/package.json?token=AOgWw4S2rDbDPbFI8V3xdhLeYA0rGjSHks5cbZG3wA%3D%3D?query=$.version&label=Version)

This project allow us to manage discord messages comming from external application to prevent spam (greenkeeper, snyk, trello, drive ...)

## Requirements
- Node.js v10 or higher

## Getting Started
Clone Discord-Bot on your computer
```bash
$ git clone https://github.com/SlimIO/Discord-Bot.git
```
After cloning the project, you need to create a `.env` file at the root of the project with two line.
```
WEBHOOK_ID=
WEBHOOK_TOKEN=
```
Don't forget to indicate after `=` the ID and the token of your discord webhook

### Where to find your discord webhook ID and TOKEN
Steps to find this informations are described on the [wiki of the project](https://github.com/SlimIO/Discord-Bot/wiki/Getting-your-dsicord-webhook-infos)

### Run the project

To start the project write the following command line at the root of the project
```bash
$ npm start
```

## Dependencies

## Dependencies

|Name|Refactoring|Security Risk|Usage|
|---|---|---|---|
|[@polka/send]()|Minor|Low|TBC|
|[body-parser](https://github.com/expressjs/body-parser)|Minor|High|Body Parser|
|[discord.js](https://github.com/discordjs/discord.js#readme)|⚠️Major|High|Discord.js lib|
|[dotenv](https://github.com/motdotla/dotenv)|Minor|Low|Env file|
|[make-promises-safe](https://github.com/mcollina/make-promises-safe#readme)|⚠️Major|Low|TBC|
|[polka](https://github.com/lukeed/polka)|Minor|Low|Native HTTP server|

## License
MIT
