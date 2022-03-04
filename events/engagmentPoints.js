const addPointsTo = require('../helpers/addPoints/index');
const config = require('../config.json');

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    if (message.author.bot === true) {
      return;
    }
    if (config.points.engagment.extraChannels[message.channelId] != undefined) {
      addPointsTo.addPointsTo(message.author, parseInt(config.points.engagment.extra));
    }
    else {
      addPointsTo.addPointsTo(message.author, parseInt(config.points.engagment.normal));
    }
  },
};
