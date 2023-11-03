const WOKCommands = require("wokcommands");
const path = require("path");
const config = require('../config.json');

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log("bot online");
    client.user.setActivity('& Sleeping');
    new WOKCommands(client, {
      commandsDir: path.join(__dirname, "../commands"),
      testServers: [config.serverInfo.GUILD_ID],
    }).setDefaultPrefix("!");
  },
};
