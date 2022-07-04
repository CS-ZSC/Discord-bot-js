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
<<<<<<< HEAD
      await addPointsTo.addPointsTo(message.author, parseInt(config.points.engagment.extra));
=======
      await addPointsTo.addPointsTo(message.author,parseInt(config.points.engagment.extra));
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd
    }
    else {
      await addPointsTo.addPointsTo(message.author, parseInt(config.points.engagment.normal));
    }
  },
};
