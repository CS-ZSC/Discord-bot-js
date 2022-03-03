const { getUser } = require("../helpers/sheets/index");
const card = require("../helpers/levelCard");

module.exports = {
  name: "points1",
  testOnly: true,
  slash: false,
  callback: async ({ message, member, user }) => {
    const rank = await card(message, user);
    rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
      message.reply({
        content: `Hello ${user.username}`,
        files: [{ attachment: buffer }],
      });
    });
  },
};
