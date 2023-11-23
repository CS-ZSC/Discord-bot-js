const WOKCommands = require("wokcommands");
const path = require("path");
const config = require('../config.json');
const {decryptToString} = require("../helpers/sheets/secure-file");

module.exports = {
  name: "ready",
  once: true,
  async execute(client) {
    console.log("bot online");
    client.user.setActivity('& Sleeping');
    new WOKCommands(client, {
      commandsDir: path.join(__dirname, "../commands"),
      testServers: [config.serverInfo.GUILD_ID],
    }).setDefaultPrefix("!");
    module.exports.credentials = JSON.parse(await decryptToString("./helpers/sheets/creds.json.secure"));
  },
};
