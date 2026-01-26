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
    logger.info('Command/Leaderboard', `Running. Interaction type: ${typeof interaction === 'string' ? interaction : 'Object'}`);
    if (interaction !== "Bot fired") {
      logger.debug('Command/Leaderboard', 'Interaction fired');
    } else {
      client.channels.cache.get(config.serverInfo.leaderboard_id).send("Leaderboard for month of " + new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' }) + " are :");
    }
    const leaderboard = await getLeaderboard();
    logger.info('Command/Leaderboard', `Leaderboard fetched. Count: ${leaderboard.length}`);
    for (let rank = 0; rank < 10; ++rank) {
      if (leaderboard.length <= rank) {
        break;
      }
      const user = await client.users.fetch(leaderboard[rank].userID);
      const RankCard = await card(user, rank + 1);
      RankCard.build({ fontX: "Arial", fontY: "Arial" }).then((buffer) => {
        if (interaction !== "Bot fired") {
          interaction.channel.send({
            files: [{ attachment: buffer }],
          });
        } else {
          const channel = client.channels.cache.get(config.serverInfo.leaderboard_id);
          channel.send({
            files: [{ attachment: buffer }],
          });
        }
        logger.debug('Command/Leaderboard', `Sent rank ${rank + 1}`);
      }).catch(err => logger.error('Command/Leaderboard', `Error building card for rank ${rank + 1}: ${err}`));
    }
  },
};