const { generateDateString } = require("../time/handlers");
const { getTask, insertTaskDone } = require('../sheets/index');
const config = require('../../config.json');
const addPointsTo = require("../addPoints/index");
const { getParentChannel } = require("../getParentChannel");
const { client } = require("../../main");
const { alreadyDone } = require("../aleadyDone");
const { doesTaskExists } = require("../sheets");
const { getKeyByValue } = require("../utils");
const logger = require("../logger");

const POINTS_PER_DAY = config.points.tasks.pointsPerDay;
const BONUS = config.points.tasks.bonus;

const calculateTaskPoints = (startDate, endDate, submitDate) => {
    if (submitDate > endDate) {
        const duration = (endDate - startDate) / 1000;
        let days = duration / (24 * 60 * 60);
        days = Math.max(days, 2);
        const taskPointsIntial = days * POINTS_PER_DAY;
        const points = taskPointsIntial * 0.5;
        return parseInt(points);
    }
    const durationFromEnd = (endDate - submitDate) / 1000;
    const duration = (endDate - startDate) / 1000;
    let days = duration / (24 * 60 * 60);
    days = Math.max(days, 2);
    const taskPointsIntial = days * POINTS_PER_DAY;
    let points = taskPointsIntial * (1 + durationFromEnd * BONUS / (duration / 2));
    points = Math.min(points, taskPointsIntial * (1 + BONUS));
    points = Math.max(points, taskPointsIntial * (1 - BONUS));
    points = parseInt(points);
    return points;
};

const doneTask = async (message) => {
    const author = message.author;
    const channelName = message.channel.name;
    
    logger.info('DoneTask', `Processing 'done' message`, { user: author.username, channel: channelName });

    let taskDetails;
    const doneChannel = await getParentChannel(message.channelId);
    const taskNumber = parseInt(channelName.split("-")[1]);

    const track = getKeyByValue(config.finishTaskChannel, doneChannel.id);
    if (!track) {
        logger.warn('DoneTask', `Invalid channel for done message`, { user: author.username, channelId: doneChannel.id });
        message.reply('You entered Done Task in wrong channels')
            .then(msg => setTimeout(() => msg.delete(), 2000))
            .catch(err => logger.error('DoneTask', `Failed to reply`, { error: err.message }));
        setTimeout(() => message.delete(), 3000);
        return;
    }

    const date = new Date(message.createdTimestamp);
    const localDate = new Date(date.toLocaleString("en-US", { timeZone: "Africa/Cairo" }));
    const dateStr = generateDateString(localDate);

    try {
        taskDetails = await getTask(track, taskNumber);
    } catch (e) {
        logger.warn('DoneTask', `Task not found`, { user: author.username, track, taskNumber });
        message.reply('Task doesn\'t exist in the spreadsheet')
            .then(msg => setTimeout(() => msg.delete(), 2000))
            .catch(err => logger.error('DoneTask', `Failed to reply`, { error: err.message }));
        setTimeout(() => message.delete(), 3000);
        return;
    }

    if (await alreadyDone(track, author, taskNumber)) {
        logger.warn('DoneTask', `Duplicate submission attempt`, { user: author.username, track, taskNumber });
        message.reply('User have already done this task')
            .then(msg => setTimeout(() => msg.delete(), 4000))
            .catch(err => logger.error('DoneTask', `Failed to reply`, { error: err.message }));
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
        
        logger.info('DoneTask', `Task completed successfully`, { 
            user: author.username, 
            track, 
            taskNumber, 
            points: taskPoints, 
            isLate,
            submittedAt: dateStr
        });
        
        await addPointsTo.addPointsTo(author, taskPoints);
        await message.channel.send(`${author} has submitted **Task ${taskNumber}** at \`${dateStr}\` and earned **${taskPoints}** points!${lateMessage}`);
        
        try {
            await message.delete();
        } catch (e) {
            logger.warn('DoneTask', `Failed to delete user message`, { user: author.username, error: e.message });
        }
    }
};

module.exports = {
    doneTask,
    calculateTaskPoints,
}