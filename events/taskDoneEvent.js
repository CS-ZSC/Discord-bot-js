const doneTask = require('../helpers/doneTask/index');
module.exports = {
  name: "messageCreate",
  once: false,
  execute(message) {
    if (message.author.bot) return;
    if (message.content.toLowerCase() !== "done"  ) return;
    console.log(`[Event/MessageCreate] 'done' detected from ${message.author.username} in ${message.channel.id}`);
    doneTask.doneTask(message);
  },
};