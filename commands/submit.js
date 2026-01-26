const { getParentChannel } = require("../helpers/getParentChannel");
const { getKeyByValue } = require("../helpers/utils");
const config = require('../config.json');
const { getTask, submitTask, userDoneTask } = require('../helpers/sheets');
const { generateDateString } = require("../helpers/time/handlers");
const addPointsTo = require("../helpers/addPoints");
const { calculateTaskPoints } = require("../helpers/doneTask");
const logger = require("../helpers/logger");

module.exports = {
    name: "submit",
    description: "Submit your task with a link (e.g. /submit https://github.com/...)",
    category: "Tasks",
    options: [
        {
            name: "url",
            description: "The link to your work",
            required: true,
            type: 3, // STRING
        }
    ],
    slash: true,
    callback: async ({ interaction }) => {
        const author = interaction.user;
        logger.info('Command/Submit', `User ${author.username} initiated task submission`);
        
        await interaction.deferReply({ ephemeral: true });
        const url = interaction.options.getString('url');

        // Validate URL
        try {
            new URL(url);
        } catch (_) {
            logger.warn('Command/Submit', `Invalid URL from ${author.username}`, { url });
            return interaction.editReply("Please provide a valid URL (e.g., https://example.com).");
        }

        try {
            const doneChannel = await getParentChannel(interaction.channelId);

            if (!interaction.channel.name.includes("Done Task-")) {
                logger.warn('Command/Submit', `Wrong channel used by ${author.username}`, { channel: interaction.channel.name });
                return interaction.editReply("This command can only be used in 'Done Task' threads.");
            }

            const taskNumber = parseInt(interaction.channel.name.split("-")[1]);
            const track = getKeyByValue(config.finishTaskChannel, doneChannel.id);
            
            if (!track) {
                logger.error('Command/Submit', `Track not found for channel`, { channelId: doneChannel.id, user: author.username });
                return interaction.editReply('You entered Done Task in wrong channels, or config.json is incorrect');
            }

            const date = new Date(interaction.createdTimestamp);
            const localDate = new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
            const dateStr = generateDateString(localDate);

            let taskDetails;
            try {
                taskDetails = await getTask(track, taskNumber);
            } catch (e) {
                logger.warn('Command/Submit', `Task not found`, { track, taskNumber, user: author.username });
                return interaction.editReply("Task doesn't exist in the spreadsheet");
            }

            const isResubmission = await userDoneTask(taskNumber, author, track);
            const submitDate = new Date(dateStr);
            const endDate = new Date(taskDetails.endingDate);
            const isLate = submitDate > endDate;
            const lateMessage = isLate ? "\n**(Late Submission ⚠️)**" : "";

            if (isResubmission && isLate) {
                logger.info('Command/Submit', `Late resubmission blocked`, { user: author.username, track, taskNumber });
                await interaction.editReply(`Task ${taskNumber} resubmission is **late**. You cannot resubmit the task after deadline: \`${taskDetails.endingDate}\`.`);
                return;
            }

            const sheetDateStr = isLate ? `${dateStr} (Late Submission)` : dateStr;
            await submitTask(track, author, taskNumber, sheetDateStr, url, isLate);

            if (isResubmission) {
                logger.info('Command/Submit', `Resubmission completed`, { user: author.username, track, taskNumber });
                await interaction.editReply(`Task ${taskNumber} resubmitted successfully! Link updated.${lateMessage}`);
                await interaction.channel.send(`${author} has resubmitted **Task ${taskNumber}** at \`${dateStr}\`.${lateMessage}`);
            } else {
                const taskPoints = calculateTaskPoints(new Date(taskDetails.startingDate), endDate, submitDate);
                await addPointsTo.addPointsTo(author, taskPoints);
                logger.info('Command/Submit', `Submission completed`, { user: author.username, track, taskNumber, points: taskPoints, isLate });
                await interaction.editReply(`Task ${taskNumber} submitted successfully! You earned **${taskPoints}** points.${lateMessage}`);
                await interaction.channel.send(`${author} has submitted **Task ${taskNumber}** at \`${dateStr}\` and earned **${taskPoints}** points!${lateMessage}`);
            }

        } catch (error) {
            logger.error('Command/Submit', `Unexpected error`, { user: author.username, error: error.message });
            await interaction.editReply({ content: `An error occurred: Please contact an administrator.`, ephemeral: true });
        }
    },
};
