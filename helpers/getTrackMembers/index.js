/*
  Get track memebers
*/
const client = require("../../main").client;
const config = require("../../config.json");

module.exports = {
  async getMembers(interaction, track) {
    const trackId = config.roles[track];
    await interaction.guild.members.fetch();
    return client.guilds.cache
        .get(config.serverInfo.GUILD_ID)
        .roles.cache.get(trackId)
        .members.map((m) => m.user);
  },
};
