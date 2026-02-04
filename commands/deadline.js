// Description: This file contains the code for the schedule command

const times = require("../helpers/time/handlers");
const { getSheet } = require("../helpers/sheets/index");
const { getMembers } = require("../helpers/getTrackMembers/index");
const announce = require("../helpers/announce");
const config = require("../config.json");
const { Interaction } = require("discord.js");
const logger = require("../helpers/logger");

module.exports = {
    name: "deadline",
    description: "Create a deadline for a specific track and send it immediately.", // Required for slash commands
    category: "Deadline",

    options: [
        {
            name: "track_name",
            description: "Choose the track which you want to create a deadline",
            required: true,
            type: 3,
            choices: Object.keys(config.finishTaskChannel).map(key => ({
                name: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                value: key
            })),
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
        }
    ],
    slash: true,
    callback: async ({ interaction, args }) => {
        const client = interaction.client;
        const user = interaction.user.username;

        const track = args[0];
        const duration = args[1];
        const task = args[2];

        logger.info('Command/Deadline', `User ${user} creating deadline`, { track, duration, task });

        if (!interaction.replied) {
            interaction.reply({ content: "Working on it", ephemeral: true });
        } else {
            interaction.editReply({ content: "Working on it" });
        }

        const date = new Date();
        const localDate = new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));

        let startingDate = times.strDayFirstSecond(localDate);
        let endingDate = times.strDayLastSecond(localDate, duration);

        let trackcol = -1;
        try {
            let sheet = await getSheet(`tasks`);

            for (let col = 0; col < 20; col++) {
                await sheet.loadCells({
                    startRowIndex: 0, endRowIndex: 1,
                    startColumnIndex: col, endColumnIndex: col + 1
                });
                const cell = sheet.getCell(0, col);
                if (cell.value === track) {
                    trackcol = col;
                    break;
                }
            }
            if (trackcol === -1) {
                logger.warn('Command/Deadline', `Track not found in sheet`, { track, user });
                interaction.editReply({ content: `Track not found` });
                return;
            }

            await sheet.loadCells({
                startRowIndex: task, endRowIndex: task + 1,
                startColumnIndex: trackcol, endColumnIndex: trackcol + 1
            });
            const content = await sheet.getCell(task, trackcol).value;

            if (content === null || content === undefined || content === '') {
                logger.warn('Command/Deadline', `Task content empty`, { track, task, user });
                interaction.editReply({ content: "please put your task in the designated area " });
                return;
            }

            const doneChannelId = await config.tasksChannels[track];
            const doneChannel = await client.channels.fetch(doneChannelId);

            const thread = await doneChannel.threads.create({
                name: `Task-${task}`,
                autoArchiveDuration: 60,
                reason: 'Thread for task',
            });

            let instructionText = `**Instruction:** After finishing your task, please use the \`/submit <url>\` command in <#${config.finishTaskChannel[track]}> to submit your work.\n**Example:**\n\`\`\`\n/submit https://github.com/your-repo\`\`\``;

            await thread.send({
                content: `**Deadline:** ${endingDate}\n\n ${instructionText}  \n${content}`
            });
        } catch (e) {
            logger.error('Command/Deadline', `Error processing task sheet`, { track, task, user, error: e.message });
            interaction.editReply({ content: `Error updating the sheet, Mention a bot admin` });
            return;
        }

        const finishedTaskChannel = await client.channels.fetch(config.finishTaskChannel[track]);
        const thread = await finishedTaskChannel.threads.create({
            name: `Done Task-${task}`,
            autoArchiveDuration: 60,
            reason: 'Thread for task',
        });

        await thread.send({ content: `After you finish the task, please use the \`/submit <url>\` command in this thread.\n**Example:**\n\`\`\`\n/submit https://github.com/your-repo\n\`\`\`` });

        try {
            let sheet = await getSheet(`${track}_DL`);
            await sheet.loadCells("A1:C50");

            const taskNumberCell = sheet.getCell(task, 0);
            const startingDateCell = sheet.getCell(task, 1);
            const endingDateCell = sheet.getCell(task, 2);

            startingDate = times.generateDateString(startingDate);
            endingDate = times.generateDateString(endingDate);

            taskNumberCell.value = task.toString();
            startingDateCell.value = startingDate;
            endingDateCell.value = endingDate;

            await sheet.saveUpdatedCells();
        } catch (e) {
            logger.error('Command/Deadline', `Error updating deadline sheet`, { track, task, user, error: e.message });
            interaction.editReply({ content: `Error updating the sheet, Mention a bot admin` });
            return;
        }

        let mention = `<@&${track === 'science' ? config.roles.cs : config.roles[track]}>`;
        announce.announce({ content: `${mention} You got a task from \`${startingDate}\` to \`${endingDate}\`` });

        logger.info('Command/Deadline', `Deadline created successfully`, { track, task, startingDate, endingDate, createdBy: user });
        interaction.editReply({ content: `added ${task} in ${track} from \`${startingDate}\` to \`${endingDate}\`` });
    }
};
