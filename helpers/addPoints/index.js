const Levels = require('discord-xp');
const config = require('../../config.json');
const announce = require('../announce/index');
const card = require('../levelCard');

module.exports = {
  async addPointsTo(author, xp) {
    if (author.bot) {
      return
    }
    const hasLeveledUP = await Levels.appendXp(
      author.id,
      config.serverInfo.GUILD_ID,
      xp
    );
    if (hasLeveledUP) {
      const user = await Levels.fetch(author.id, config.serverInfo.GUILD_ID);
      const rank = await card(author);
      rank.build({ fontX: "Arial", fontY: "Arial" }).then((buffer) => {
         announce.announce({
           content: `${author} Congratulations! You Have Reached Level ${user.level}`,
           files: [{ attachment: buffer }],
         });
       });
    }
  }
}