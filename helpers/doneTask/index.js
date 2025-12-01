const { generateDateString } = require("../time/handlers");
const { getTask, insertTaskDone } = require('../sheets/index');
const config = require('../../config.json');
const addPointsTo = require("../addPoints/index");
const { getParentChannel } = require("../getParentChannel");
const { client } = require("../../main");
const { alreadyDone } = require("../aleadyDone");
const { doesTaskExists } = require("../sheets");
const { getKeyByValue } = require("../utils");

const POINTS_PER_DAY = config.points.tasks.pointsPerDay;
const BONUS = config.points.tasks.bonus;

const calculateTaskPoints = (startDate, endDate, submitDate) => {
    const durationFromEnd = (endDate - submitDate) / 1000;
    const duration = (endDate - startDate) / 1000;
    let days = duration / (24 * 60 * 60);
    days = Math.max(days, 2);     //Min score is 2 * Points per day
    const taskPointsIntial = days * POINTS_PER_DAY;
    let points = taskPointsIntial * (1 + durationFromEnd * BONUS / (duration / 2));
    points = Math.min(points, taskPointsIntial * (1 + BONUS));
    points = Math.max(points, taskPointsIntial * (1 - BONUS));
    points = parseInt(points);
    return points;
};

const doneTask = async (message) => {
    console.log(`[DoneTask] Processing message from ${message.author.username} in ${message.channel.name}`);

    let taskDetails; // Declare taskDetails outside the try block
    //Get the parent channel of the thread
    const doneChannel = await getParentChannel(message.channelId)

    //Get the task number from the name of the thread "Done Task-<taskNumber>"
    const taskNumber = parseInt(message.channel.name.split("-")[1]);
    console.log(`[DoneTask] Extracted task number: ${taskNumber}`);


    //Get the track from the config file
    const track = getKeyByValue(config.finishTaskChannel, doneChannel.id);
    if (!track) {
        console.warn(`[DoneTask] Track not found for channel ${doneChannel.id}`);
        console.log("User entered Done Task in wrong channels, or config.json is incorrect");
        message.reply('You entered Done Task in wrong channels')
            .then(msg => {
                setTimeout(() => msg.delete(), 2000)
            })
            .catch(console.error);
        setTimeout(() => message.delete(), 3000);
        message.delete();
        return
    }
    console.log(`[DoneTask] Track identified: ${track}`);

    const author = message.author;
    const date = new Date(message.createdTimestamp);
    // Convert to Cairo time (handles DST automatically)
    const localDate = new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    const dateStr = generateDateString(localDate);

    //Check if the task exists
    try {
        taskDetails = await getTask(track, taskNumber);
    } catch (e) {
        console.error(`[DoneTask] Task retrieval failed: ${e.message}`);
        console.log("Task doesn't exist in the spreadsheet");
        message.reply('Task doesn\'t exist in the spreadsheet')
            .then(msg => {
                setTimeout(() => msg.delete(), 2000)
            })
            .catch(console.error);
        setTimeout(() => message.delete(), 3000);
        return;
    }

    if (await alreadyDone(track, author, taskNumber)) {
        await console.log(`[DoneTask] User ${author.username} already done task ${taskNumber}`);
        message.reply('User have already done this task')
            .then(msg => {
                setTimeout(() => msg.delete(), 4000)
            })
            .catch(console.error);
        setTimeout(() => message.delete(), 5000);
        return;
    }

    const submitDate = localDate;
    const endDate = new Date(taskDetails.endingDate);
    const isLate = submitDate > endDate;
    const lateMessage = isLate ? "\n**(Late Submission ⚠️)**" : "";
    const sheetDateStr = isLate ? `${dateStr} (Late Submission)` : dateStr;

    if (await insertTaskDone(track, author, taskNumber, sheetDateStr, isLate)) {
        const taskPoints = calculateTaskPoints(new Date(taskDetails.startingDate), endDate, submitDate);
        console.log(`[DoneTask] Points calculated: ${taskPoints}`);
        await addPointsTo.addPointsTo(author, taskPoints);
        console.log(`[DoneTask] Added ${taskPoints} to ${author}`)
        
        await message.channel.send(`${author} has submitted **Task ${taskNumber}** at \`${dateStr}\` and earned **${taskPoints}** points!${lateMessage}`);
        
        try {
            await message.delete();
        } catch (e) {
            console.error(`[DoneTask] Failed to delete message: ${e}`);
        }
    }
};

module.exports = {
    doneTask,
    calculateTaskPoints,
}