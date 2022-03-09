/*
  Get track memebers
*/
const client = require("../../main").client;
const config = require('../../config.json');

module.exports = {
  async getMembers(track) {
    const trackId = config.roles[track];
    const trackMembers = client.guilds.cache.get(config.serverInfo.GUILD_ID).roles.cache.get(trackId).members.map(m=>m.user);
    //console.log(trackMembers);
    return trackMembers;
  }
}