const schedule = require('node-schedule');
const deadline = require("./deadline");
const config = require("../config.json");

// Description: This file contains the code for the schedule command
module.exports = {
    name: "schedule",
    description: "Schedule a task with a specific date and time",
    category: "Schedule",

    options: [
        {
            name: "date",
            description: "Date and time in format DD/MM HH:mm (e.g. 25/12 14:30)",
            required: true,
            type: 3, // STRING
        },
        {
            name: "track",
            description: "Choose the track",
            required: true,
            type: 3,
            choices: Object.keys(config.finishTaskChannel).map(key => ({
                name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: key
            })),
        },
        {
            name: "duration",
            description: "Duration in days",
            required: true,
            type: 3,
        },
        {
            name: "task",
            description: "Task number",
            required: true,
            type: 3,
        },
        {
            name: "submission_type",
            description: "How should members submit the task?",
            required: true,
            type: 3,
            choices: [
                { name: "Type 'Done'", value: "done" },
                { name: "Submit Link (/submit)", value: "submit" }
            ]
        }
    ],
    slash: true,
    callback: async ({ interaction }) => {

        console.log(`[Command/Scheduler] User: ${interaction.user.username}`);
        try {
            // Send an initial response or defer the reply
            await interaction.deferReply({ ephemeral: true });

            const dateStr = interaction.options.getString('date');
            const track = interaction.options.getString('track');
            const duration = interaction.options.getString('duration');
            const task = interaction.options.getString('task');
            const submissionType = interaction.options.getString('submission_type');

            // Parse date string DD/MM HH:mm
            const datePattern = /^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/;
            const match = dateStr.match(datePattern);

            if (!match) {
                await interaction.editReply({
                    content: `Invalid date format. Please use DD/MM HH:mm (e.g. 25/12 14:30)`,
                });
                return;
            }

            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const hour = parseInt(match[3]);
            const minute = parseInt(match[4]);
            const year = new Date().getFullYear();

            // Calculate the duration
            const nowDate = new Date();
            
            // Construct the target date assuming inputs are UTC first
            const targetTimeUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));

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
                    content: `Please enter a valid future date`,
                });
                return;
            }

            console.log(`[Command/Scheduler] Scheduling job for ${date}`);
            
            const deadlineArgs = [track, duration, task, submissionType];

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
                content: `Scheduled task ${task} for ${track} at ${date.toLocaleString("en-US", { timeZone: "Africa/Cairo" })} (Cairo Time)`,
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