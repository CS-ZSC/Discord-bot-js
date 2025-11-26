const { getParentChannel } = require("../helpers/getParentChannel");
const { getKeyByValue } = require("../helpers/utils");
const config = require('../config.json');
const { getTask, submitTask, userDoneTask } = require('../helpers/sheets');
const { generateDateString } = require("../helpers/time/handlers");
const addPointsTo = require("../helpers/addPoints");
const { calculateTaskPoints } = require("../helpers/doneTask");

module.exports = {
    name: "submit",
    description: "Submit your task with a link",
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
        console.log(`[Command/Submit] Triggered by ${interaction.user.username}`);
        // Make the interaction response ephemeral (private) by default for errors/status
        await interaction.deferReply({ ephemeral: true });
        const url = interaction.options.getString('url');
        const author = interaction.user;

        // Validate URL
        try {
            new URL(url);
        } catch (_) {
            console.warn(`[Command/Submit] Invalid URL provided: ${url}`);
            return interaction.editReply("Please provide a valid URL (e.g., https://example.com).");
        }

        try {
            const doneChannel = await getParentChannel(interaction.channelId);
            console.log(`[Command/Submit] Parent channel: ${doneChannel?.name} (${doneChannel?.id})`);

            if (!interaction.channel.name.includes("Done Task-")) {
                console.warn(`[Command/Submit] Invalid channel: ${interaction.channel.name}`);
                return interaction.editReply("This command can only be used in 'Done Task' threads.");
            }

            const taskNumber = parseInt(interaction.channel.name.split("-")[1]);
            console.log(`[Command/Submit] Task Number: ${taskNumber}`);

            const track = getKeyByValue(config.finishTaskChannel, doneChannel.id);
            if (!track) {
                console.error(`[Command/Submit] Track configuration missing for channel ${doneChannel.id}`);
                return interaction.editReply('You entered Done Task in wrong channels, or config.json is incorrect');
            }
            console.log(`[Command/Submit] Track: ${track}`);

            const dateStr = generateDateString(new Date(interaction.createdTimestamp));

            let taskDetails;
            try {
                taskDetails = await getTask(track, taskNumber);
            } catch (e) {
                console.error(`[Command/Submit] Task details not found: ${e.message}`);
                return interaction.editReply("Task doesn't exist in the spreadsheet");
            }

            const isResubmission = await userDoneTask(taskNumber, author, track);
            console.log(`[Command/Submit] Is Resubmission? ${isResubmission}`);

            const submitDate = new Date(dateStr);
            const endDate = new Date(taskDetails.endingDate);
            const isLate = submitDate > endDate;
            const lateMessage = isLate ? "\n**(Late Submission ⚠️)**" : "";

            // If it's a late resubmission, do not update the sheet
            if (isResubmission && !isLate) {
                console.log(`[Command/Submit] Late resubmission for ${author.username}. Sheet not updated.`);
                await interaction.editReply(`Task ${taskNumber} resubmission is **late**. You cannot resubmit the task after deadline: \`${taskDetails.endingDate}\`.`);
                return;
            }

            // If it's a late submission (first time), mark it in the sheet
            const sheetDateStr = isLate ? `${dateStr} (Late Submission)` : dateStr;
            await submitTask(track, author, taskNumber, sheetDateStr, url);

            if (isResubmission) {
                console.log(`[Command/Submit] Resubmission successful for ${author.username}`);
                // Private confirmation
                await interaction.editReply(`Task ${taskNumber} resubmitted successfully! Link updated.${lateMessage}`);
                // Public announcement
                await interaction.channel.send(`${author} has resubmitted **Task ${taskNumber}** at \`${dateStr}\`.${lateMessage}`);
            } else {
                const taskPoints = calculateTaskPoints(new Date(taskDetails.startingDate), endDate, submitDate);
                console.log(`[Command/Submit] Points calculated: ${taskPoints}`);
                await addPointsTo.addPointsTo(author, taskPoints);
                
                // Private confirmation
                await interaction.editReply(`Task ${taskNumber} submitted successfully! You earned **${taskPoints}** points.${lateMessage}`);
                // Public announcement
                await interaction.channel.send(`${author} has submitted **Task ${taskNumber}** at \`${dateStr}\` and earned **${taskPoints}** points!${lateMessage}`);
            }

        } catch (error) {
            console.error(`[Command/Submit] Error: ${error}`);
            await interaction.editReply({ content: `An error occurred: Please contact an administrator.`, ephemeral: true });
        }
    },
};
