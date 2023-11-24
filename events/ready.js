const WOKCommands = require("wokcommands");
const path = require("path");
const config = require('../config.json');
const {decryptToString} = require("../helpers/sheets/secure-file");
const schedule = require("node-schedule");
const leaderboard = require("../commands/leaderboard");

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
        const job = await schedule.scheduleJob('0 0 1 * *', async () => {
            const channel = await client.channels.cache.get(config.serverInfo.leaderboard_id);
            await channel.send("Leaderboard for month of " + new Date().toLocaleString('default', {month: 'long'}) + " are :");
            await leaderboard.callback();
        });
    }
}
