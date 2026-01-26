const { getTaskFeedback } = require("../helpers/sheets");
const config = require("../config.json");
const logger = require("../helpers/logger");

module.exports = {
    name: "feedback",
    description: "Get your feedback for a specific task", // Required for slash commands
    category: "Feedback",

    options: [
        {
            name: "track",
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
        const track = args[0];
        const task = args[1];
        const username = interaction.user.username;

        logger.info('Command/Feedback', `Triggered by ${username}`, { track, task });

        // Defer reply to handle async operations
        await interaction.deferReply({ ephemeral: true });

        // Validate task number
        const taskNumber = parseInt(task);
        if (isNaN(taskNumber) || taskNumber <= 0) {
            logger.warn('Command/Feedback', `Invalid task number provided: ${task}`, { username });
            return interaction.editReply({
                content: "❌ Please provide a valid task number (positive integer).",
            });
        }

        try {
            logger.debug('Command/Feedback', `Getting feedback for track: ${track}, task: ${taskNumber}, user: ${username}`);
            const feedback = await getTaskFeedback(track, username, taskNumber);

            // Format the track name for display
            const trackName = track.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            logger.info('Command/Feedback', `Feedback retrieved successfully for ${username}`, { track, taskNumber });

            await interaction.editReply({
                embeds: [{
                    color: 0x00ff00, // Green
                    title: `📝 Feedback for Task ${taskNumber}`,
                    description: feedback,
                    fields: [
                        { name: "Track", value: trackName, inline: true },
                        { name: "Task", value: `#${taskNumber}`, inline: true },
                    ],
                    footer: { text: "Keep up the great work! 🚀" },
                    timestamp: new Date().toISOString(),
                }],
            });

        } catch (e) {
            const errorMessage = e.message || String(e);
            logger.error('Command/Feedback', `Failed to get feedback: ${errorMessage}`, { track, task, username });

            // Determine appropriate error response
            let userMessage = "❌ An error occurred while fetching your feedback.";
            
            if (errorMessage.includes("doesn't exist yet")) {
                userMessage = `❌ Task ${taskNumber} doesn't exist yet in the **${track.replace(/_/g, ' ')}** track.`;
            } else if (errorMessage.includes("didn't finish this task")) {
                userMessage = `⚠️ You haven't submitted Task ${taskNumber} yet. Please complete the task first!`;
            } else if (errorMessage.includes("not in the")) {
                userMessage = `⚠️ ${errorMessage}`;
            } else if (errorMessage.includes("not ready yet")) {
                userMessage = `⏳ Your feedback for Task ${taskNumber} is not ready yet. Please check back later!`;
            } else if (errorMessage.includes("Couldn't find the user")) {
                userMessage = `⚠️ You are not registered in the **${track.replace(/_/g, ' ')}** track. Please contact an administrator.`;
            }

            await interaction.editReply({
                content: userMessage,
            });
        }
    },
};
