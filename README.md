# SlimIO Discord bot 
[![Maintenance](https://img.shields.io/badge/Maintained%3F-yes-green.svg)](https://github.com/SlimIO/is/commit-activity)
![MIT](https://img.shields.io/github/license/mashape/apistatus.svg)
![version](https://img.shields.io/badge/dynamic/json.svg?url=https://raw.githubusercontent.com/SlimIO/discordBot/master/package.json?token=AOgWw4S2rDbDPbFI8V3xdhLeYA0rGjSHks5cbZG3wA%3D%3D?query=$.version&label=Version)

This project allow us to manage discord messages comming from external application to prevent spam (greenkeeper, snyk, trello, drive ...)

## Requirements
- Node.js v10 or higher

## Getting Started

This package is available in the Node Package Repository and can be easily installed with [npm](https://docs.npmjs.com/getting-started/what-is-npm) or [yarn](https://yarnpkg.com).

```bash
$ npm i @slimio/discord-bot
# or
$ yarn add @slimio/discord-bot
```
After downloading the project. You need to create a `.env` file at the root of the project with two line.
```
WEBHOOK_ID=
WEBHOOK_TOKEN=
```
### How to find discord webhook ID and TOKEN
On discord, go to the server setting.

![discord settings](https://i.imgur.com/WC0SyTI.png)

Choose "Webhooks" on the right and click on `Edit` or create one if you don't have one.

![discord webHook](https://i.imgur.com/Pj0zAZ2.png)

Copy the `webhook url`. The informations are inside this url.

![webHook edit](https://i.imgur.com/YmDC9IF.png)

directly after *_webhooks/_* you will find your ID and at the end it's your token. copy and past it into your `.env` file

> https://*_discordapp_*.com/api/webhooks/`ID`/`TOKEN`

### Run the project
At the root of the project :
```bash
$ npm start
```

