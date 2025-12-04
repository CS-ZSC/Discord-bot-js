const { getTaskFeedback } = require("../helpers/sheets");
const config = require("../config.json");

module.exports = {
    name: "feedback",
    description: "Get feedback for a specific task", // Required for slash commands
    category: "Feedback",
    options: [
        {
            name: "track_name",
            description: "Choose the track of your feedback",
            required: true,
            type: 3,
            choices: Object.keys(config.finishTaskChannel).map(key => ({
                name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: key
            })),
        },
        {
            name: "task_number",
            description: "Please enter the task number",
            required: true,
            type: 3,
        },
    ],
    slash: true,
    callback: async ({ interaction, args }) => {

        console.log(`[Command/Feedback] Args: ${args}, User: ${interaction.user.username}`);
        interaction.reply({
            content: "Working on it",
            ephemeral: true,
        });

        const track = args[0];
        const task = args[1];

        let feedback;
        try {
            console.log(`[Command/Feedback] Getting feedback: track: ${track}, task: ${task}, user: ${interaction.user.username}`);
            feedback = await getTaskFeedback(track, interaction.user.username, task);
        } catch (e) {

            console.error(`[Command/Feedback] Couldn't get feedback: track: ${track}, task: ${task}, user: ${interaction.user.username}, error: ${e.message}`);
            interaction.editReply({
                content: `${e.message || e}`,
            });
            return;
        }
        // interaction is provided only for a slash command
        interaction.editReply({
            content: `Good job! Here is your feedback on that task: \n${feedback}`,
            ephemeral: true,
        });

        console.log(`[Command/Feedback] Feedback sent to ${interaction.user.globalName} (${interaction.user.username})`);
    },
};
