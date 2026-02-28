const { getLeaderboard } = require("../helpers/getLeaderboard");
const card = require("../helpers/levelCard");
const leaderboard = require("../helpers/levelCard");
const config = require('../config.json');
const logger = require("../helpers/logger");

module.exports = {
  name: "leaderboard",
  description: "Get the highest 10 members",
  slash: true,
  category: "Leaderboard",
  callback: async (interaction) => {
    const client = interaction.client;
    const isBotFired = interaction === "Bot fired";

    logger.info('Command/Leaderboard', `Leaderboard requested`, { source: isBotFired ? 'scheduled' : 'user' });

    if (isBotFired) {
      client.channels.cache.get(config.serverInfo.leaderboard_id).send(
        "Leaderboard for month of " + new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' }) + " are :"
      );
    } else {
      const member = interaction.member;
      if (!member?.permissions.has("ADMINISTRATOR")) {
        logger.warn('Command/Deadline', `Unauthorized access attempt by ${user}`);
        interaction.reply({
          content: "You don't have the permissions to run this command. Please, don't play",
          ephemeral: true,
        });
        return;
      }
    }

    const leaderboard = await getLeaderboard();
    logger.info('Command/Leaderboard', `Fetched ${leaderboard.length} entries`);

    for (let rank = 0; rank < 10; ++rank) {
      if (leaderboard.length <= rank) break;

      const user = await client.users.fetch(leaderboard[rank].userID);
      const RankCard = await card(user, rank + 1);

      RankCard.build({ fontX: "Arial", fontY: "Arial" }).then((buffer) => {
        if (!isBotFired) {
          interaction.channel.send({ files: [{ attachment: buffer }] });
        } else {
          client.channels.cache.get(config.serverInfo.leaderboard_id).send({ files: [{ attachment: buffer }] });
        }
      }).catch(err => logger.error('Command/Leaderboard', `Card build failed for rank ${rank + 1}`, { error: err.message }));
    }

    logger.info('Command/Leaderboard', `Leaderboard display completed`);
  },
};