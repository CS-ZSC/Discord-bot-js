const { getLeaderboard } = require("../helpers/getLeaderboard");
const card = require("../helpers/levelCard");
const leaderboard = require("../helpers/levelCard");
const { client } = require("../main");
const config = require('../config.json');

module.exports = {
  name: "leaderboard",
  description: "Get the highest 10 members",
  slash: true,
  category: "Leaderboard",
  callback: async (interaction) => {
    console.log(`[command/leaderboard] running`);
    if (interaction !== "Bot fired") {
      console.log("interaction fired");
    } else {
      client.channels.cache.get(config.serverInfo.leaderboard_id).send("Leaderboard for month of " + new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' }) + " are :");
    }
    const leaderboard = await getLeaderboard();
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
      });
    }
  },
};