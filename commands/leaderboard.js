const { getLeaderboard } = require("../helpers/getLeaderboard");
const card = require("../helpers/levelCard");
const leaderboard = require("../helpers/levelCard");

module.exports = {
  name: "leaderboard",
  description: "Get the highest 10 members", 
  testOnly: true,
  slash: false,
  callback: async ({ interaction }) => {
    interaction.reply({
      content: "Working on it",
    });
    const leaderboard = getLeaderboard();
    for (let rank = 0; rank < 10; ++rank) {
      const rank = await card(leaderboard[i].userID, rank+1);
      rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
        message.reply({
          files: [{ attachment: buffer }],
        });
      });
    }
  },
};

