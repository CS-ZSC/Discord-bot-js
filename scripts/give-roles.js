const { Client, Intents } = require('discord.js');
const fs = require('fs');
const { decryptToString } = require('../auth/secure-file');


const { guild_id } = require("../server.json");
const config = require("../config.json")


console.log("Starting giving roles...");
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ]
});

client.login(process.env.BOT_TOKEN);

const users = [
    [
        "distru_",
        "mohamed_abdalla9999999",
        "rahf_00"
    ],
    [
        "hanaelhady",
        "r6mez",
        "shamsalalfy"
    ],
    [
        "xbadrx456",
        "moosayed.",
        "tahany0173_24225"
    ],
    [
        "bmz._.",
        "m_az_en",
        "zeyadzahran"
    ],
    [
        "mohamed_a_adel",
        "mostafa75185",
        "yousef_elgendy77"
    ]
];

client.once('ready', async () => {
    try {
        const guild = await client.guilds.fetch(guild_id);






        for (let i = 0; i < users.length; i++) {
            console.log(`Starting role assignment for ${users[i].length} users...`);
            for (const username of users[i]) {
                const teamID = config.roles[`backend_team-${i + 1}`];
                const roleID = config.roles["backend"];

                if (!roleID) {
                    console.error(`Role ${team} (${roleID}) not found`);
                    return;
                }


                try {
                    // Search for members with matching username
                    const members = await guild.members.search({ query: username, limit: 100 });
                    const member = members.find(m =>
                        m.user.username.toLowerCase() === username.toLowerCase()
                    );

                    if (member) {
                        await member.roles.add(roleID);
                        await member.roles.add(teamID);
                        console.log(`Assigned role to: ${username}`);
                    } else {
                        console.log(`User not found: ${username}`);
                    }
                } catch (error) {
                    console.error(`Error processing ${username}:`, error.message);
                }
            }
        }

        console.log('Role assignment process completed!');
    } catch (error) {
        console.error('Fatal error:', error);
    } finally {
        client.destroy();
        process.exit();
    }
});
