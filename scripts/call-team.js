const { Client, Intents } = require('discord.js');
const config = require('../config.json');
const { guild_id } = require("../server.json")
const { decryptToString } = require('../auth/secure-file');


const CONTEST_TIME = new Date("Feb 01 2025 12:00:00");

console.log("Calling teams...");
const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MESSAGES,
  ]
});



client.login(process.env.BOT_TOKEN);

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  sendTeamMessage(1); 
});

const sendTeamMessage = async (teamNumber) => {
  const guild = await client.guilds.fetch(guild_id);

  if (!guild) {
    console.error("Server not found. Check your GUILD_ID.");
    client.destroy();
    return;
  }


  const team = `team_${teamNumber}`;

  // Get the role and channel by name
  const roleID = config.roles[team];
  const channelID = config.contest[team];

  if (!roleID) {
    console.error(`Role ${team} (${roleID}) not found`);
    return;
  }

  if (!channelID) {
    console.error(`Channel ${channelName} (${channelID}) not found`);
    return;
  }

  const channel = guild.channels.cache.find(ch => ch.id === channelID);
  // Send the message in the channel mentioning the role
  try {
    await channel.send(`
Hello <@&${roleID}>!

Welcome to your team channel! The contest is just around the corner on **${CONTEST_TIME.toLocaleString()}**, and it's time to get to know each other and start practising together. Let's begin by introducing ourselves!

Here\’s a quick guide to get started:
- Share your name, expertise, and what excites you about this contest.
- Feel free to ask any questions or suggest practice plans to the group.

Let\’s make this a great experience and work together to bring out the best in each other. Good luck, Team ${teamNumber}! 🚀
`);
    console.log(`Message sent to ${channelID}`);
  } catch (error) {
    console.error(`Failed to send message in ${channelID}:`, error);
  }
};


