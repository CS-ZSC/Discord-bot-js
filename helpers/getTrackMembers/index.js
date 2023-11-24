/*
  Get track members
*/
const client = require("../../main").client;
const config = require("../../config.json");

module.exports = {
  async getMembers(track) {
    const trackId = config.roles[track];
    const guild = client.guilds.cache.get(config.serverInfo.GUILD_ID);

    if (!guild) {
      console.error(`Guild not found with ID: ${config.serverInfo.GUILD_ID}`);
      return [];
    }

    await guild.members.fetch();

    const trackRole = guild.roles.cache.get(trackId);

    if (!trackRole) {
      console.error(`Role not found with ID: ${trackId}`);
      return [];
    }

    return trackRole.members.map((m) => m.user);
  },
};
