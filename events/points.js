const card = require("../helpers/levelCard");
const { channelsPoints } = require("../helpers/utils");
const Levels = require("discord-xp");
module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot) return;
    const xp = channelsPoints[message.channel.name] || 1;
    const hasLeveledUP = await Levels.appendXp(
      message.author.id,
      message.guild.id,
      xp
    );
    if (hasLeveledUP) {
      const user = await Levels.fetch(message.author.id, message.guild.id);
      const rank = await card(message, message.author);
      rank.build({ fontX: "Quantico", fontY: "Quantico" }).then((buffer) => {
        message.reply({
          content: `${message.member} Congratulations! You Have Reached Level ${user.level}`,
          files: [{ attachment: buffer }],
        });
      });
    }
  },
};
