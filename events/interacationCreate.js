module.exports = {
    name: "interactionCreate",
    once: true,
    async execute(interaction) {
        if (interaction.isCommand()) {
            console.debug(` DEBUG: Command executed 
   by: ${interaction.user.globalName} (${interaction.user.tag})
   user_id: (${interaction.user.id})
   command: ${interaction.commandName}
            `);
        }

    }
}

