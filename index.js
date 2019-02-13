const discord = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const bot = new discord.Client();

bot.login(process.env.BOT_TOKEN);
