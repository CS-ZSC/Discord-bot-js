// Description: This file contains the code for the schedule command

const times = require("../helpers/time/handlers");
const { getSheet } = require("../helpers/sheets/index");
const { getMembers } = require("../helpers/getTrackMembers/index");
const announce = require("../helpers/announce");
const config = require("../config.json");
const { client } = require("../main");
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
        console.log(`[command/deadline] args: ${args}`);


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

        // Initializing start and end date
        const date = new Date();
        let startingDate = times.strDayFirstSecond(date);
        let endingDate = times.strDayLastSecond(date, duration);
        
        let trackcol = -1;
        try {
            // Get the sheet and load Its cells
            let sheet = await getSheet(`tasks`);

            // WARNING: if you wan to increase the number of tracks, you should increase the number of columns that be checked here.
            for (let col = 0; col < 10; col++) {
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
                console.log("Track not found");
                interaction.editReply({
                    content: `Track not found`,
                });
                return;
            }
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
                interaction.editReply({ content: "please put your task in the designated area " });
                return;
            }
            const thread = await doneChannel.threads.create({
                name: `Task-${task}`,
                autoArchiveDuration: 60,
                reason: 'Tread for task',
            });
            await thread.send({
                content: `**Deadline:** ${endingDate}\n\n **Instruction:** After finishing your task, you should write \`Done\` in <#${config.finishTaskChannel[track]}>  \n${content}`
            });
        } catch (e) {
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
        await thread.send({ content: `After you finish the task, please write done in this thread` });



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
        } catch (e) {
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
