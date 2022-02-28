const { getUserPoints } = require("../helpers/sheets/index");

module.exports = {
  name: "points",
  description: "Get your points", // Required for slash commands
  testOnly: true,
  slash: true,
  callback: async ({ member, user }) => {
    const userId = `${user.username} #${user.discriminator}`;
    const userRow = await getUserPoints(userId);
    const points = userRow[0]["Points"];
    return `${member.user} you have ${points} points`;
  },
};
