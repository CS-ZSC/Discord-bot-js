const doneTask = require('../helpers/doneTask/index');
const logger = require('../helpers/logger');

module.exports = {
  name: "messageCreate",
  once: false,
  execute(message) {
    if (message.author.bot) return;
    if (message.content.toLowerCase() !== "done"  ) return;
    logger.info('Event/MessageCreate', `'done' detected from ${message.author.username} in ${message.channel.id}`);
    doneTask.doneTask(message);
  },
};
