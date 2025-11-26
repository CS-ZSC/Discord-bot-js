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
        await interaction.deferReply();
        const url = interaction.options.getString('url');
        const author = interaction.user;

        try {
            const doneChannel = await getParentChannel(interaction.channelId);

            if (!interaction.channel.name.includes("Done Task-")) {
                return interaction.editReply("This command can only be used in 'Done Task' threads.");
            }

            const taskNumber = parseInt(interaction.channel.name.split("-")[1]);

            const track = getKeyByValue(config.finishTaskChannel, doneChannel.id);
            if (!track) {
                return interaction.editReply('You entered Done Task in wrong channels, or config.json is incorrect');
            }

            const dateStr = generateDateString(new Date(interaction.createdTimestamp));

            let taskDetails;
            try {
                taskDetails = await getTask(track, taskNumber);
            } catch (e) {
                return interaction.editReply("Task doesn't exist in the spreadsheet");
            }

            const isResubmission = await userDoneTask(taskNumber, author, track);

            await submitTask(track, author, taskNumber, dateStr, url);

            if (isResubmission) {
                await interaction.editReply(`Task ${taskNumber} resubmitted successfully! Link updated.`);
            } else {
                const taskPoints = calculateTaskPoints(new Date(taskDetails.startingDate), new Date(taskDetails.endingDate), new Date(dateStr));
                await addPointsTo.addPointsTo(author, taskPoints);
                await interaction.editReply(`Task ${taskNumber} submitted successfully! You earned ${taskPoints} points.`);
            }

        } catch (error) {
            console.error(error);
            await interaction.editReply(`An error occurred: ${error.message}`);
        }
    },
};
