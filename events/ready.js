const WOKCommands = require("wokcommands");
const path = require("path");
const config = require('../config.json');
const { decryptToString } = require("../auth/secure-file");
const schedule = require("node-schedule");
const leaderboard = require("../commands/leaderboard");
const { credentials } = require("../auth/google");

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
        const job = await schedule.scheduleJob('0 0 1 * *', async () => {
            const channel = await client.channels.cache.get(config.serverInfo.leaderboard_id);
            await channel.send("Leaderboard for month of " + new Date(new Date().setMonth(new Date().getMonth() - 1)).toLocaleString('default', { month: 'long' }) + " are :");
            await leaderboard.callback("Bot fired");
        });

        module.exports.creds = await credentials();
    }
}
