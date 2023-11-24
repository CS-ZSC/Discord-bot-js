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
  callback: async (interaction = null) => {
    if (interaction) {
      interaction.reply({
        content: "Working on it",
      });
    }
    const leaderboard = await getLeaderboard();
    for (let rank = 0; rank < 10; ++rank) {
      if (leaderboard.length <= rank) {
        break;
      }
      const user = await client.users.fetch(leaderboard[rank].userID);
      const RankCard = await card(user, rank + 1);
      RankCard.build({ fontX: "Arial", fontY: "Arial" }).then((buffer) => {
        if (interaction){
          interaction.followUp({
            files: [{ attachment: buffer }],
          });
        }else {
          const channel = client.channels.cache.get(config.serverInfo.leaderboard_id);
          channel.send({
            files: [{ attachment: buffer }],
          });
        }
      });
    }
    if (interaction){
      interaction.editReply({
        content: `Here is the leaderboard`,
      });
    }
  },
};