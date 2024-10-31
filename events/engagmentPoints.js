const addPointsTo = require('../helpers/addPoints/index');
const config = require('../config.json');

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot === true) {
      return;
    }
    if (config.points.engagement.extraChannels.includes(message.channelId)) {
      await addPointsTo.addPointsTo(message.author, parseInt(config.points.engagement.extra));
    }
    else {
      await addPointsTo.addPointsTo(message.author, parseInt(config.points.engagement.normal));
    }
  },
};
