const Discord = require("discord.js");
const Levels = require("discord-xp");
const fs = require("fs");
require("dotenv").config();
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});
module.exports.client = client;   //For Helper Functions like Announce

for (const eventFile of fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"))) {
  let event = require(`./events/${eventFile}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args));
  else client.on(event.name, (...args) => event.execute(...args));
}

Levels.setURL(process.env.MONGO_URI);
client.login(process.env.BOT_TOKEN);