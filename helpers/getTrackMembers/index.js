/*
  Get track members
*/
const client = require("../../main").client;
const config = require("../../config.json");
const logger = require("../logger");

module.exports = {
  async getMembers(track) {
    try {
      const trackId = config.roles[track];
      const guild = client.guilds.cache.get(config.serverInfo.GUILD_ID);

      if (!guild) {
        logger.error('GetTrackMembers', `Guild not found`, { guildId: config.serverInfo.GUILD_ID });
        return [];
      }

      await guild.members.fetch();
      const trackRole = guild.roles.cache.get(trackId);

      if (!trackRole) {
        logger.warn('GetTrackMembers', `Role not found for track`, { track, roleId: trackId });
        return [];
      }

      const members = trackRole.members.map((m) => m.user);
      logger.debug('GetTrackMembers', `Fetched members for track`, { track, count: members.length });
      return members;
    } catch (err) {
      logger.error('GetTrackMembers', `Failed to get track members`, { track, error: err.message });
      return [];
    }
  },
};
