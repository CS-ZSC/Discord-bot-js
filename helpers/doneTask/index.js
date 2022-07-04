const { generateDateString } = require("../time/handlers");
const { getTask, insertTaskDone  } = require('../sheets/index');
const config = require('../../config.json');
<<<<<<< HEAD
const { addPointsTo } = require("../addPoints");
=======
const addPointsTo = require("../addPoints/index");
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd

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
<<<<<<< HEAD
  const task = message.content.toLowerCase().replace(" ", " ").split(" ");
=======
  const task = message.content.toLowerCase().replace("-", " ").split(" ");
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd
  if (task.length != 3 || task[0] != "done") {
    return;
  }
  track = config.doneChannels[message.channelId];
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
<<<<<<< HEAD

  const taskPoints = calculateTaskPoints(taskDetails.startingDate, taskDetails.endingDate, date);
  await addPointsTo(author, taskPoints);
=======
  const taskPoints = calculateTaskPoints(taskDetails.startingDate, taskDetails.endingDate, date);
  await addPointsTo.addPointsTo(author, taskPoints);
  console.log(`Added ${taskPoints} to ${author}`)
>>>>>>> 3d7f5cd6762cfa95158164d160b423808a3ed8dd
  message.react("👍");
};

module.exports = {
  doneTask,
}