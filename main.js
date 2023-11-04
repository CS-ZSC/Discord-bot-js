const Discord = require("discord.js");
const Levels = require("discord-xp");
const fs = require("fs");

require('dotenv').config({path: './.env'});
//require("dotenv").config();
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MEMBERS"],
});

module.exports.client = client; //For Helper Functions like Announce
for (const eventFile of fs
    .readdirSync("./events")
    .filter((file) => file.endsWith(".js"))) {
    let event = require(`./events/${eventFile}`);
    if (event.once) client.once(event.name, (...args) => event.execute(...args));
    else client.on(event.name, (...args) => event.execute(...args));
}

const http = require('http');
const requestListener = async function (req, res) {
    const delay =ms => new Promise(res => setTimeout(res, ms));
    delay(3000000).then(r => res.end('Hello, World!'));
}
const server = http.createServer(requestListener);
server.listen(process.env.PORT || 5000);

process.on('uncaughtException', function (err) {
    console.log('Caught exception: ', err);
});


client.login(process.env.BOT_TOKEN).then(r => console.log("Logged in!"));
Levels.setURL(process.env.MONGO_URI).then(r => r).catch(e => console.log(e));