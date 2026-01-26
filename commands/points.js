const card = require("../helpers/levelCard");
const announce = require("../helpers/announce");
const addPointsTo = require("../helpers/addPoints");
const { writeFileSync } = require("fs");
const logger = require("../helpers/logger");

module.exports = {
    name: "points",
    slash: true,
    category: "Points",
    description: "Get your points",
    callback: async ({ interaction, user }) => {
        logger.info('Command/Points', `User ${user.username} requested rank card`);
        
        interaction.reply({ content: "Working on it", ephemeral: true });
        
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
                    logger.info('Command/Points', `Rank card delivered to ${user.username}`);
                } else {
                    logger.error('Command/Points', `Buffer empty for rank card`, { user: user.username });
                }
            } else {
                logger.error('Command/Points', `Invalid rank object`, { user: user.username });
            }
        } catch (error) {
            logger.error('Command/Points', `Failed to generate rank card`, { user: user.username, error: error.message });
        }
    }

};
