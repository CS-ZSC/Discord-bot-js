/*
  Get leaderboard
*/
const client = require("../../main").client;
const config = require("../../config.json");
const Levels = require("discord-xp");
const logger = require("../logger");

module.exports = {
  async getLeaderboard() {
    try {
      const leaderboard = await Levels.fetchLeaderboard(config.serverInfo.GUILD_ID, 10);
      logger.debug('GetLeaderboard', `Fetched leaderboard`, { count: leaderboard.length });
      return leaderboard;
    } catch (err) {
      logger.error('GetLeaderboard', `Failed to fetch leaderboard`, { error: err.message });
      throw err;
    }
  },
};
