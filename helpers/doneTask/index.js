const { generateDateString } = require("../time/handlers");
const { getTask, insertTaskDone  } = require('../sheets/index');
const config = require('../../config.json');
const addPointsTo = require("../addPoints/index");
const {getParentChannel} = require("../getParentChannel");
const {client} = require("../../main");
const {alreadyDone} = require("../aleadyDone");
const {doesTaskExists} = require("../sheets");

const POINTS_PER_DAY = config.points.tasks.pointsPerDay;
const BONUS = config.points.tasks.bonus;

const calculateTaskPoints = (startDate, endDate, submitDate) => {
  const durationFromEnd = (endDate - submitDate)/1000;
  const duration = (endDate - startDate)/1000;
  let days = duration / (24*60*60);
  days = Math.max(days, 2);     //Min score is 2 * Points per day
  const taskPointsIntial = days * POINTS_PER_DAY;
  let points = taskPointsIntial * (1 + durationFromEnd*BONUS/ (duration / 2));
  points = Math.min(points, taskPointsIntial * (1 + BONUS));
  points = Math.max(points, taskPointsIntial * (1 - BONUS));
  points = parseInt(points);
  return points;
};

const doneTask = async (message) => {

  //Get the parent channel of the thread
  const doneChannel = await getParentChannel(message.channelId)

    //Get the task number from the name of the thread "Done Task-<taskNumber>"
  const taskNumber = parseInt(message.channel.name.split("-")[1]);


  //Get the track from the config file
  const track = config.doneChannels[doneChannel.id];
  if (!track) {
    console.log("User entered Done Task in wrong channels, or config.json is incorrect");
    return
  }

  const author = message.author;
  const timeOfMessage = new Date(message.createdTimestamp);
  const dateStr = generateDateString(timeOfMessage);

  const taskDetails = await getTask(track, taskNumber);
  //Check if the task exists
  if (await getTask(track, taskNumber) == null) {
    console.log("Task doesn't exist in the spreadsheet");
    return;
  }
  if (await alreadyDone(track, author, taskNumber)) {
    await console.log("User have already done this task");
    return;
  }
  if (await insertTaskDone(track, author, taskNumber, dateStr)){
    const taskPoints = calculateTaskPoints(taskDetails.startingDate, taskDetails.endingDate, timeOfMessage);
    await addPointsTo.addPointsTo(author, taskPoints);
    console.log(`Added ${taskPoints} to ${author}`)
    await message.react("❤️");
  }
};

module.exports = {
  doneTask,
}