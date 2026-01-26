const Levels = require('discord-xp');
const config = require('../../config.json');
const announce = require('../announce/index');
const card = require('../levelCard');
const logger = require('../logger');

module.exports = {
  async addPointsTo(author, xp) {
    if (author.bot) {
      return;
    }
    
    try {
      const hasLeveledUP = await Levels.appendXp(
        author.id,
        config.serverInfo.GUILD_ID,
        xp
      );
      
      logger.debug('AddPoints', `Added ${xp} XP to user`, { user: author.username, xp });
      
      if (hasLeveledUP) {
        const user = await Levels.fetch(author.id, config.serverInfo.GUILD_ID);
        logger.info('AddPoints', `User leveled up!`, { user: author.username, newLevel: user.level });
        
        const rank = await card(author);
        rank.build({ fontX: "Arial", fontY: "Arial" }).then((buffer) => {
          announce.announce({
            content: `${author} Congratulations! You Have Reached Level ${user.level}`,
            files: [{ attachment: buffer }],
          });
        }).catch(err => {
          logger.error('AddPoints', `Failed to build level up card`, { user: author.username, error: err.message });
        });
      }
    } catch (err) {
      logger.error('AddPoints', `Failed to add points`, { user: author.username, xp, error: err.message });
    }
  }
}