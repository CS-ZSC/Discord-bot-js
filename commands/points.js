//const { getUser } = require("../helpers/sheets/index");
const card = require("../helpers/levelCard");
<<<<<<< HEAD
=======
const announce = require("../helpers/announce");
const addPointsTo = require("../helpers/addPoints");
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd

module.exports = {
  name: "points",
  testOnly: true,
  slash: false,
  callback: async ({ message, member, user }) => {
<<<<<<< HEAD
    const rank = await card(user);
    rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
      message.reply({
        content: `Hello ${user.username}`,
=======
    await addPointsTo.addPointsTo(message.author, 1);
    const rank = await card(user);
    rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
      announce.announce({
        content: `Hello ${user}`,
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd
        files: [{ attachment: buffer }],
      });
    });
  },
};
