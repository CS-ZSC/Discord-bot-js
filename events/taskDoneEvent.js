const doneTask = require('../helpers/doneTask/index');

module.exports = {
  name: "messageCreate",
  once: false,
  execute(message) {
    if (message.author.bot) return;
    doneTask.doneTask(message);
  },
};