const Discord = require("discord.js");
const Levels = require("discord-xp");
const fs = require("fs");
//require("dotenv").config();
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

Levels.setURL(process.env.MONGO_URI);
client.login(process.env.BOT_TOKEN);

module.exports.client = client; //For Helper Functions like Announce

for (const eventFile of fs
  .readdirSync("./events")
  .filter((file) => file.endsWith(".js"))) {
  let event = require(`./events/${eventFile}`);
  if (event.once) client.once(event.name, (...args) => event.execute(...args));
  else client.on(event.name, (...args) => event.execute(...args));
}

const http = require('http');
const requestListener = function (req, res) {
  res.writeHead(200);
  res.end('Hello, World!');
}
const server = http.createServer(requestListener);
server.listen(80);

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ', err);
});
