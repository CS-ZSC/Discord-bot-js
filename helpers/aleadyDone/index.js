const Levels = require('discord-xp');
const config = require('../../config.json');
const announce = require('../announce/index');
const card = require('../levelCard');
const {userDoneTask} = require("../sheets");
const logger = require("../logger");

module.exports = {
  async alreadyDone(track, author, taskNumber) {
      logger.debug('AlreadyDone', `Checking track: ${track}, user: ${author.username}, task: ${taskNumber}`);
      return userDoneTask(taskNumber, author, track);
}
}