const schedule = require('node-schedule');
const deadline = require("./deadline");
const logger = require("../helpers/logger");
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
        }
    ],
    slash: true,
    callback: async ({ interaction }) => {
        const user = interaction.user.username;
        logger.info('Command/Scheduler', `User ${user} scheduling a task`);
        
        try {
            await interaction.deferReply({ ephemeral: true });

            const dateStr = interaction.options.getString('date');
            const track = interaction.options.getString('track');
            const duration = interaction.options.getString('duration');
            const task = interaction.options.getString('task');

            const datePattern = /^(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/;
            const match = dateStr.match(datePattern);

            if (!match) {
                logger.warn('Command/Scheduler', `Invalid date format`, { dateStr, user });
                await interaction.editReply({ content: `Invalid date format. Please use DD/MM HH:mm (e.g. 25/12 14:30)` });
                return;
            }

            const day = parseInt(match[1]);
            const month = parseInt(match[2]);
            const hour = parseInt(match[3]);
            const minute = parseInt(match[4]);
            const year = new Date().getFullYear();

            const nowDate = new Date();
            const targetTimeUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
            const cairoTimeString = targetTimeUTC.toLocaleString("en-US", { timeZone: "Africa/Cairo" });
            const cairoDateLocal = new Date(cairoTimeString);
            const cairoDateUTC = new Date(Date.UTC(
                cairoDateLocal.getFullYear(), cairoDateLocal.getMonth(), cairoDateLocal.getDate(),
                cairoDateLocal.getHours(), cairoDateLocal.getMinutes(), cairoDateLocal.getSeconds()
            ));
            const offset = cairoDateUTC.getTime() - targetTimeUTC.getTime();
            const date = new Date(targetTimeUTC.getTime() - offset);

            if (date < nowDate) {
                logger.warn('Command/Scheduler', `Past date provided`, { date, user });
                await interaction.editReply({ content: `Please enter a valid future date` });
                return;
            }

            const deadlineArgs = [track, duration, task];

            schedule.scheduleJob(date, async () => {
                logger.info('Command/Scheduler', `Executing scheduled deadline`, { track, task, scheduledBy: user });
                await deadline.callback({ interaction, args: deadlineArgs });
            });

            const cairoDisplayTime = date.toLocaleString("en-US", { timeZone: "Africa/Cairo" });
            logger.info('Command/Scheduler', `Task scheduled`, { track, task, scheduledFor: cairoDisplayTime, scheduledBy: user });
            
            await interaction.editReply({ content: `Scheduled task ${task} for ${track} at ${cairoDisplayTime} (Cairo Time)` });
        } catch (error) {
            logger.error('Command/Scheduler', `Scheduling failed`, { user, error: error.message });
            await interaction.followUp({ content: `There was an error while executing this command!`, ephemeral: true });
        }
    },
};