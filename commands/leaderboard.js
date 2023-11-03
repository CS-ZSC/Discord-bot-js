const { getLeaderboard } = require("../helpers/getLeaderboard");
const card = require("../helpers/levelCard");
const leaderboard = require("../helpers/levelCard");
const { client } = require("../main");

module.exports = {
  name: "leaderboard",
  description: "Get the highest 10 members",
  slash: true,
  category: "Leaderboard",
  callback: async ({ interaction }) => {
    interaction.reply({
      content: "Working on it",
    });
    const leaderboard = await getLeaderboard();
    for (let rank = 0; rank < 10; ++rank) {
      if (leaderboard.length <= rank) {
        break;
      }
      const user = await client.users.fetch(leaderboard[rank].userID);
      const RankCard = await card(user, rank + 1);
      RankCard.build({ fontX: "Arial", fontY: "Arial" }).then((buffer) => {
        interaction.followUp({
          files: [{ attachment: buffer }],
        });
      });
    }
    interaction.editReply({
      content: `Here is the leaderboard`,
    });
  },
};