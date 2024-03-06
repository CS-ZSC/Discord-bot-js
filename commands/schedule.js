const schedule = require('node-schedule');
const deadline = require("./deadline");
// Description: This file contains the code for the schedule command
module.exports = {
    name: "schedule",
    description: "schedule task", // Required for slash commands
    category: "Schedule",

    options: [
        {
            name: "track",
            description: "Choose the track which you want to create a deadline",
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
            name: "duration",
            description: "Please enter the duration in days [7 Days Recommended]",
            required: true,
            type: 3,
        },
        {
            name: "task",
            description: "Please enter the task number",
            required: true,
            type: 3,
        },
        {
            name: "day",
            description: "Please enter the day",
            required: true,
            type: 3,
        },
        {
            name: "month",
            description: "Please enter the month",
            required: true,
            type: 3,
        },
        {
            name: "hour",
            description: "Please enter the hour, 24 hour format [optional]",
            required: false,
            type: 3,
        },
        {
            name: "minute",
            description: "Please enter the minute [optional]",
            required: false,
            type: 3,
        },
    ],
    slash: true,
    /**
     * Schedule a task based on the provided date and time arguments
     * @param {Object} options - The options object
     * @param {Object} options.interaction - The interaction object
     * @param {Array} options.args - The arguments array
     */
    callback: async ({interaction, args}) => {
        try {
            // Defer the reply to avoid timeout issues
            await interaction.deferReply({ephemeral: true});

            // Extract day, month, hour, minute, and remaining deadline arguments
            const [day, month, hour, minute, ...deadlineArgs] = args.map(arg => parseInt(arg));

            // Create a date object based on the provided arguments
            const nowDate = new Date();
            const date = new Date(nowDate.getFullYear(), month - 1, day, hour || 0, minute || 0, 0, 0);

            // Check if the provided date is in the past
            if (date < nowDate) {
                await interaction.editReply({
                    content: `Please enter a valid date`,
                });
                return;
            }

            // Schedule a job to execute the deadline callback at the specified date
            const job = schedule.scheduleJob(date, async () => {
                await deadline.callback({
                    interaction,
                    args: deadlineArgs,
                });
            });

            // Update the interaction reply with the scheduled task information
            await interaction.editReply({
                content: `scheduled task for ${date}`,
            });
        } catch (error) {
            console.error(error);
            // Notify the user about the error
            await interaction.followUp({
                content: `There was an error while executing this command!`,
                ephemeral: true,
            });
        }
    }
};
