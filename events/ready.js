const WOKCommands = require("wokcommands");
const path = require("path");

module.exports = {
  name: "ready",
  once: true,
  execute(client) {
    console.log("bot online");
    new WOKCommands(client, {
      commandsDir: path.join(__dirname, "../commands"),
      testServers: ["945195764408262687"],
    }).setDefaultPrefix("!");
  },
};
