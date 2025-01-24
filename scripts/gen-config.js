const { Client, Intents } = require('discord.js');
const fs = require('fs');
const { decryptToString } = require('../auth/secure-file');


const { guild_id } = require("../server.json")



console.log("Starting generating the configuration file...");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

client.login(process.env.BOT_TOKEN);

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    try {

        // Fetch the guild (server) by ID
        const guild = await client.guilds.fetch(guild_id);

        if (!guild) {
            console.error("Server not found. Check your GUILD_ID.");
            client.destroy();
            return;
        }

        // Collect configuration information

        const config = {
            finishTaskChannel:
                Object.fromEntries(
                    guild.channels.cache.filter(channel => channel.name === "finished-tasks").map(channel => {
                        return [channel.parent.name.toLowerCase().replace("-", "_"), channel.id,]
                    })),
            tasksChannels:
                Object.fromEntries(
                    guild.channels.cache.filter(channel => channel.name === "tasks").map(channel => {
                        return [channel.parent.name.toLowerCase().replace("-", "_"), channel.id,]
                    })
                ),
            roles: Object.fromEntries(
                guild.roles.cache.filter(role => !role.name.includes(" ")).map(role => {
                    return [role.name.toLowerCase().replace("-", "_"), role.id]
                }),
            ),
            contest: Object.fromEntries(
                guild.channels.cache.filter(channel => channel.parent && channel.parent.name.toLowerCase() === "contest" && channel.type === "GUILD_TEXT").map(channel => {
                    return [channel.name.toLowerCase().replace("-", "_"), channel.id]
                }
                )
            ),
            serverInfo: {
                GUILD_ID: guild_id,
                announcements_id: guild.channels.cache.find(role => role.name === "bot-announcements").id,
                leaderboard_id: guild.channels.cache.find(role => role.name === "leaderboard").id,
            },
            points: {
                engagement: {
                    normal: 1,
                    extra: 5,
                    // Note: You can edit the extra channels for your needs. 
                    // currently, we use the `materials` as extra channels in our discord server (IEEE-CS'26).
                    extraChannels: guild.channels.cache.filter(channel => channel.name === "materials").map(channel => channel.id)
                },
                tasks: {
                    pointsPerDay: 15,
                    bonus: 0.5
                }
            },
        }
        // Write data to a JSON file
        fs.writeFileSync('config.json', JSON.stringify(config, null, 2));
        console.log("Generating is done.")
    } catch (err) {
        console.error(`Generating failed: ${err}`)
    } finally {
        client.destroy();
    }
});
