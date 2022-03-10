const config = require('../../config.json');
const client = require("../../main").client;

module.exports = {
  async announce(message) {
    client.channels.cache.get(config.serverInfo.announcments_id).send(message);
  }
}
