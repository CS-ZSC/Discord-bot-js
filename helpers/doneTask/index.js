const { generateDateString } = require("../time/handlers");
const { getTask, insertTaskDone  } = require('../sheets/index');
const config = require('../../config.json');
const addPointsTo = require("../addPoints/index");
const {getParentChannel} = require("../getParentChannel");

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
  //Checking if the message is in the correct syntax & get the track
  const task = message.channel.name.toLowerCase().replace("-", " ").split(" ");
  if (task.length != 3 || task[0] != "done") {
    return;
  }
  const trackChannel  = await getParentChannel(message.channelId)
  track = config.doneChannels[trackChannel.id];

  if (!track) {
    console.log("User entered Done Task in wrong channels, or config.json is incorrect");
    return
  }
  const taskNumber = parseInt(task[2]);
  const author = message.author;
  const date = new Date(message.createdTimestamp);
  const dateStr = generateDateString(date);

  const taskDetails = await getTask(track, taskNumber);
  await insertTaskDone(track, author, taskNumber, dateStr);
  const taskPoints = calculateTaskPoints(taskDetails.startingDate, taskDetails.endingDate, date);
  await addPointsTo.addPointsTo(author, taskPoints);
  console.log(`Added ${taskPoints} to ${author.username} for completing task ${taskNumber} in track ${track}`);
  message.react("❤️");
};

module.exports = {
  doneTask,
}