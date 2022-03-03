const Discord = require("discord.js");
const Levels = require("discord-xp");
const WOKCommands = require("wokcommands");
const card = require("./helpers/levelCard");
const { channelsPoints } = require("./helpers/utils");
const path = require("path");
require("dotenv").config();
const client = new Discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES"],
});

Levels.setURL(process.env.MONGO_URI);
client.once("ready", () => {
  console.log("bot online");
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, "commands"),
    testServers: ["945195764408262687"],
  }).setDefaultPrefix("!");
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const xp = channelsPoints[message.channel.name] || 1;
  const hasLeveledUP = await Levels.appendXp(
    message.author.id,
    message.guild.id,
    xp
  );
  if (hasLeveledUP) {
    const user = await Levels.fetch(message.author.id, message.guild.id);
    const rank = await card(message, message.author);
    rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
      message.reply({
        content: `${message.member} Congratulations! You Have Reached Level ${user.level}`,
        files: [{ attachment: buffer }],
      });
    });
  }
});

client.login(process.env.BOT_TOKEN);
