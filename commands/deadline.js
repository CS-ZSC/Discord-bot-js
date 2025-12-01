// Description: This file contains the code for the schedule command

const times = require("../helpers/time/handlers");
const { getSheet } = require("../helpers/sheets/index");
const { getMembers } = require("../helpers/getTrackMembers/index");
const announce = require("../helpers/announce");
const config = require("../config.json");
const { Interaction } = require("discord.js");

module.exports = {
    name: "deadline",
    description: "Make a deadline for specific track", // Required for slash commands
    category: "Deadline",

    options: [
        {
            name: "track",
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
    callback: async ({ interaction, args }) => {
        const client = interaction.client;
        console.log(`[Command/Deadline] Args: ${args}, User: ${interaction.user.username}`);

        const member = interaction.member;
        if (!member?.permissions.has("ADMINISTRATOR")) {
            interaction.reply({
                content: "You don't have the permissions to run this command. Please, don't play",
                ephemeral: true,
            });
        }

        if (!interaction.replied) {
            interaction.reply({
                content: "Working on it",
                ephemeral: true,
            });
        } else {
            interaction.editReply({
                content: "Working on it",
            });
        }

        const track = args[0];
        const duration = args[1];
        const task = args[2];
        const submissionType = args[3];
        console.log(`[Command/Deadline] Track: ${track}, Duration: ${duration}, Task: ${task}, Type: ${submissionType}`);

        // Initializing start and end date
        const date = new Date();
        // Convert to Cairo time (handles DST automatically)
        const localDate = new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));

        let startingDate = times.strDayFirstSecond(localDate);
        let endingDate = times.strDayLastSecond(localDate, duration);

        let trackcol = -1;
        try {
            // Get the sheet and load Its cells
            let sheet = await getSheet(`tasks`);

            // WARNING: if you wan to increase the number of tracks, you should increase the number of columns that be checked here.
            for (let col = 0; col < 20; col++) {
                await sheet.loadCells({
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: col,
                    endColumnIndex: col + 1
                });
                const cell = sheet.getCell(0, col);
                if (cell.value === track) {
                    trackcol = col;
                    break;
                }
            }
            if (trackcol === -1) {
                console.warn(`[Command/Deadline] Track '${track}' not found in sheet headers`);
                console.log("Track not found");
                interaction.editReply({
                    content: `Track not found`,
                });
                return;
            }
            console.log(`[Command/Deadline] Track column found at index ${trackcol}`);
            await sheet.loadCells({
                startRowIndex: task,
                endRowIndex: task + 1,
                startColumnIndex: trackcol,
                endColumnIndex: trackcol + 1
            });
            const contentCell = sheet.getCell(task, trackcol);
            const content = await contentCell.value;
            const doneChannelId = await config.tasksChannels[track];
            const doneChannel = await client.channels.fetch(doneChannelId);
            if (content === null || content === undefined || content === '') {
                console.warn(`[Command/Deadline] Task content empty for task ${task} in track ${track}`);
                interaction.editReply({ content: "please put your task in the designated area " });
                return;
            }
            const thread = await doneChannel.threads.create({
                name: `Task-${task}`,
                autoArchiveDuration: 60,
                reason: 'Tread for task',
            });

            let instructionText = "";
            if (submissionType === 'submit') {
                instructionText = `**Instruction:** After finishing your task, please use the \`/submit <url>\` command in <#${config.finishTaskChannel[track]}> to submit your work.\n**Example:**\n\`\`\`\n/submit https://github.com/your-repo\`\`\``;
            } else {
                instructionText = `**Instruction:** After finishing your task, you should write \`Done\` in <#${config.finishTaskChannel[track]}>`;
            }

            await thread.send({
                content: `**Deadline:** ${endingDate}\n\n ${instructionText}  \n${content}`
            });
        } catch (e) {
            console.error(`[Command/Deadline] Error processing task sheet: ${e}`);
            console.log("Error updating the sheet", e);
            interaction.editReply({
                content: `Error updating the sheet, Mention a bot admin`,
            });
            return;
        }

        const finishedTaskChannel = await client.channels.fetch(config.finishTaskChannel[track]);
        const thread = await finishedTaskChannel.threads.create({
            name: `Done Task-${task}`,
            autoArchiveDuration: 60,
            reason: 'Tread for task',
        });

        if (submissionType === 'submit') {
            await thread.send({ content: `After you finish the task, please use the \`/submit <url>\` command in this thread.\n**Example:**\n\`\`\`\n/submit https://github.com/your-repo\n\`\`\`` });
        } else {
            await thread.send({ content: `After you finish the task, please write done in this thread` });
        }

        try {
            // Get the sheet and load Its cells
            let sheet = await getSheet(`${track}_DL`);

            // Range is specified so things speeds up
            await sheet.loadCells("A1:C50");

            // Get  cells to insert the task
            const taskNumberCell = sheet.getCell(task, 0);
            const startingDateCell = sheet.getCell(task, 1);
            const endingDateCell = sheet.getCell(task, 2);

            startingDate = times.generateDateString(startingDate);
            endingDate = times.generateDateString(endingDate);

            // insert the task
            taskNumberCell.value = task.toString();
            startingDateCell.value = startingDate;
            endingDateCell.value = endingDate;

            // Commit the changes
            await sheet.saveUpdatedCells();
            console.log(`[Command/Deadline] Sheet updated successfully for task ${task}`);
        } catch (e) {
            console.error(`[Command/Deadline] Error updating deadline sheet: ${e}`);
            console.log("Error updating the sheet", e);
            interaction.editReply({
                content: `Error updating the sheet, Mention a bot admin`,
            });
            return;
        }

        let mention = `<@&${track === 'science' ? config.roles.cs : config.roles[track]}>`

        announce.announce({
            content: `${mention} You got a task from \`${startingDate}\` to \`${endingDate}\``,
        });

        // interaction is provided only for a slash command
        interaction.editReply({
            content: `added ${task} in ${track} from \`${startingDate}\` to \`${endingDate}\``,
        });
    }
};
