const logger = require("../helpers/logger");

module.exports = {
    name: "interactionCreate",
    once: true,
    async execute(interaction) {
        if (interaction.isCommand()) {
            logger.debug('Event/InteractionCreate', `Command executed by: ${interaction.user.globalName} (${interaction.user.tag}), user_id: (${interaction.user.id}), command: ${interaction.commandName}`);
        }

    }
}

