const addPointsTo = require('../helpers/addPoints/index');
const config = require('../config.json');
const logger = require('../helpers/logger');

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot === true) {
      return;
    }
    if (config.points.engagement.extraChannels.includes(message.channelId)) {
      logger.debug('Event/EngagementPoints', `Extra points for ${message.author.username} in channel ${message.channelId}`);
      await addPointsTo.addPointsTo(message.author, parseInt(config.points.engagement.extra));
    }
    else {
      await addPointsTo.addPointsTo(message.author, parseInt(config.points.engagement.normal));
    }
  },
};
