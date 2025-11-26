const Levels = require('discord-xp');
const config = require('../../config.json');
const announce = require('../announce/index');
const card = require('../levelCard');
const {userDoneTask} = require("../sheets");

module.exports = {
  async alreadyDone(track, author, taskNumber) {
      console.log(`[AlreadyDone] Checking track: ${track}, user: ${author.username}, task: ${taskNumber}`);
      return userDoneTask(taskNumber, author, track);
}
}