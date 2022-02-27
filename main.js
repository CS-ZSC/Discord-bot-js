const Discord = require("discord.js");
const { getSheet } = require("./helpers/sheets/index");
const WOKCommands = require("wokcommands");
const path = require("path");
require("dotenv").config();
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

client.once("ready", () => {
  console.log("bot online");
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    testServers: ["945195764408262687"],
  });
});

getSheet("points").then((resolve) => {
  console.log(resolve);
});

client.login(process.env.BOT_TOKEN);
