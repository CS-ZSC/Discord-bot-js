const Levels = require('discord-xp');
const config = require('../../config.json');
const announce = require('../announce/index');
const card = require('../levelCard');
const {userDoneTask} = require("../sheets");
const logger = require("../logger");

module.exports = {
  async alreadyDone(track, author, taskNumber) {
      const result = await userDoneTask(taskNumber, author, track);
      logger.debug('AlreadyDone', `Check completed`, { user: author.username, track, taskNumber, isDone: result });
      return result;
  }
}