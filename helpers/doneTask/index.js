const { generateDateString } = require("../time/handlers");

const _TASK_POINT_INITAL = 100;
const _TASK_BONUS_RATIO = 0.5;
const _ANNOUNCE_WHEN = 50;

const calculateTaskPoints = (startDate, endDate, submitDate) => {
  const secondsFromEnd = (endDate - submitDate).getTime();
  const duration = (endDate - startDate).getTime();

  let points = _TASK_POINT_INITAL(
    1 + (secondsFromEnd / (duration / 2)) * _TASK_BONUS_RATIO
  );
  points = Math.min(points, _TASK_POINT_INITAL * (1 + _TASK_BONUS_RATIO));
  points = Math.min(points, _TASK_POINT_INITAL * (1 - _TASK_BONUS_RATIO));
  points = parseInt(points);

  return points;
};

const testIfAnnounce = (oldPoints, newPoints) => {
  if (
    Math.floor(newPoints / _ANNOUNCE_WHEN) >
    Math.floor(oldPoints / _ANNOUNCE_WHEN)
  ) {
    return true;
  }
  return false;
};

const getTaskNumber = (msgContent) => {
  return msgContent.split("-")[-1].split(" ")[-1];
};

const getTrack = (msg) => {
  let track = msg.channel.category.name.toLower();
  if (track == "science tasks"){
    if (msg.channel == "science-tasks-done"){
      track = "science-tasks";
    }else if(msg.channel == 'competitor-done'){
      track = "competitor-tasks";
    }else{
      return false
    }
  }
  return track
}

const doneTask = async (message) => {
  const taskNumber = getTaskNumber(message.content);
  const author = `${message.author.name} #${message.author.discriminator}`;
  const createdAt = generateDateString(message.created_at);

  let track = getTrack(msg)
  if (track == false){
    console.log("Unrocognized channel");
    return
  }

  
};
