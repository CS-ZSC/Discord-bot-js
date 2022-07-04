//const { getUser } = require("../helpers/sheets/index");
const card = require("../helpers/levelCard");
const announce = require("../helpers/announce");
const addPointsTo = require("../helpers/addPoints");

module.exports = {
  name: "points",
  testOnly: true,
  slash: false,
  callback: async ({ message, member, user }) => {
    await addPointsTo.addPointsTo(message.author, 1);
    const rank = await card(user);
    rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
      announce.announce({
        content: `Hello ${user}`,
        files: [{ attachment: buffer }],
      });
    });
  },
};
