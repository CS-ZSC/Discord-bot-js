const addPointsTo = require('../helpers/addPoints/index');

module.exports = {
  name: "messageCreate",
  once: false,
  async execute(message) {
    addPointsTo.addPointsTo(message.author, 5);     //TODO GET Points from config.json
  },
};
