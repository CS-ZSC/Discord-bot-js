const Discord = require('discord.js');
require('dotenv').config();
const client = new Discord.Client({
    intents: ["GUILDS", "GUILD_MESSAGES"]
});
const commandHandler = require("./command_handler.js");
const PREFIX = '-';

client.once('ready', () => {
    console.log("bot online");
});

commandHandler.registerCommands(client, Discord);

client.on('messageCreate', async (msg) => {
    if (msg.author.bot) return;

    if (msg.content.startsWith(PREFIX)) {
        const args = msg.content.slice(PREFIX.length).split(" ");
        const cmd = args.shift().toLowerCase();

        let command = client.commands.get(cmd);

        if (!command) {
            msg.channel.send("command not found");
        } else {
            command.execute(msg, args, Discord);
        }
        return;
    }
});

client.login(process.env.BOT_TOKEN);