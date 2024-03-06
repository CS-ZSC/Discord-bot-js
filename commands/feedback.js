const {getTaskFeedback} = require("../helpers/sheets");

module.exports = {
    name: "feedback",
    description: "Get your feedback", // Required for slash commands
    category: "Feedback",

    options: [
        {
            name: "track",
            description: "Choose the track of your feedback",
            required: true,
            type: 3,
            choices: [
                {
                    name: "Frontend",
                    value: "frontend",
                },
                {
                    name: "Backend",
                    value: "backend",
                },
                {
                    name: "Mobile",
                    value: "mobile",
                },
                {
                    name: "Advanced AI",
                    value: "advanced_ai",
                },
                {
                    name: "Basic AI",
                    value: "basic_ai",
                },
                {
                    name: "Ras AI",
                    value: "ras_ai",
                },
                {
                    name: "Science",
                    value: "science",
                },
                {
                    name: "Rookies",
                    value: "rookies",
                },
            ],
        },
        {
            name: "task_number",
            description: "Please enter the task number",
            required: true,
            type: 3,
        },
    ],
    slash: true,
    callback: async ({interaction, args}) => {
        interaction.reply({
            content: "Working on it",
            ephemeral: true,
        });

        const track = args[0];
        const task = args[1];

        let feedback;
        try {
            feedback = await getTaskFeedback(track, interaction.user.username, task);
        } catch (e) {
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
    },
};
