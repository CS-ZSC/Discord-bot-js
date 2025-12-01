const schedule = require('node-schedule');
const deadline = require("./deadline");
// Description: This file contains the code for the schedule command
module.exports = {
    name: "scheduler",
    description: "schedule task", // Required for slash commands
    category: "Scheduler",

    options: [
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
            description: "Please enter the hour, 24 hour format ",
            required: true,
            type: 3,
        },
        {
            name: "minute",
            description: "Please enter the minute",
            required: true,
            type: 3,
        },
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
                    name: "Science",
                    value: "science",
                },
                {
                    name: "Rookies",
                    value: "rookies",
                },
                {
                    name: "Game Development",
                    value: "game_development"
                },
                {
                    name: "Cyber Security",
                    value: "cyber_security"
                },
                {
                    name: "Cyber Security (Blue Team)",
                    value: "cyber_security_blue_team"
                },
                {
                    name: "Cyber Security (Red Team)",
                    value: "cyber_security_red_team"
                }
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
    ],
    slash: true,
    callback: async ({ interaction, args }) => {

        console.log(`[Command/Scheduler] Args: ${args}, User: ${interaction.user.username}`);
        try {
            // Send an initial response or defer the reply
            await interaction.deferReply({ ephemeral: true });

            const month = parseInt(args[1]);
            const day = parseInt(args[0]);
            const hour = parseInt(args[2]);
            const minute = parseInt(args[3]);
            const deadlineArgs = args.slice(4);

            // Calculate the duration
            const nowDate = new Date();
            
            // Construct the target date assuming inputs are UTC first
            const targetTimeUTC = new Date(Date.UTC(nowDate.getFullYear(), month - 1, day, hour || 0, minute || 0, 0, 0));

            // Calculate Cairo offset dynamically
            const cairoTimeString = targetTimeUTC.toLocaleString("en-US", { timeZone: "Africa/Cairo" });
            const cairoDateLocal = new Date(cairoTimeString);
            
            // Convert the local face values to UTC timestamp to calculate the shift
            const cairoDateUTC = new Date(Date.UTC(
                cairoDateLocal.getFullYear(),
                cairoDateLocal.getMonth(),
                cairoDateLocal.getDate(),
                cairoDateLocal.getHours(),
                cairoDateLocal.getMinutes(),
                cairoDateLocal.getSeconds()
            ));

            // Offset = Cairo Time - UTC Time
            const offset = cairoDateUTC.getTime() - targetTimeUTC.getTime();

            // Adjust target time: we want the moment when Cairo Time equals the Input Time.
            const date = new Date(targetTimeUTC.getTime() - offset);

            if (date < nowDate) {
                console.warn(`[Command/Scheduler] Invalid date provided: ${date}`);
                await interaction.editReply({
                    content: `Please enter a valid date`,
                });
                return;
            }

            console.log(`[Command/Scheduler] Scheduling job for ${date}`);
            // Set the time at which the deadline will be announced
            const job = schedule.scheduleJob(date, async () => {
                console.log(`[Command/Scheduler] Executing scheduled job for ${date}`);
                await deadline.callback({
                    interaction: interaction,
                    args: deadlineArgs,
                });
            });

            // Edit the reply if needed
            await interaction.editReply({
                content: `scheduled task for ${date}`,
            });
        } catch (error) {
            console.error(`[Command/Scheduler] Error: ${error}`);
            // Handle errors appropriately
            await interaction.followUp({
                content: `There was an error while executing this command!`,
                ephemeral: true,
            });
        }
    },
};