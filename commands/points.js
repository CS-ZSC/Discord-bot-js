const card = require("../helpers/levelCard");
const announce = require("../helpers/announce");
const addPointsTo = require("../helpers/addPoints");
const { writeFileSync } = require("fs");

module.exports = {
    name: "points",
    slash: true,
    category: "Points",
    description: "Get your points",
    callback: async ({ interaction, user }) => {
        console.log(`[Command/Points] User: ${user.username}`);
        interaction.reply({
            content: "Working on it", ephemeral: true,
        });
        try {
            await addPointsTo.addPointsTo(user, 1);
            const rank = await card(user);

            if (rank && typeof rank.build === 'function') {
                const buffer = await rank.build({ fontX: "Arial", fontY: "Arial" });
                if (buffer) {
                    interaction.editReply({
                        content: `Hello ${user.username} here is your rank card`,
                        files: [{ attachment: buffer }],
                        ephemeral: true,
                    });
                    console.log(`[Command/Points] Rank card sent to ${user.username}`);
                } else {
                    console.error("[Command/Points] Failed to generate rank image: Buffer is empty.");
                }
            } else {
                console.error("[Command/Points] Rank object is invalid or missing a 'build' method.");
            }
        } catch (error) {
            console.error("[Command/Points] An error occurred:", error);
        }
    }

};
