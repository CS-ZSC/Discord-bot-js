const strDayFirstSecond = (date) => {
  const newDate = date;
  newDate.setUTCHours(0, 0, 0, 0);
  return date;
};

const strDayLastSecond = (date, duration) => {
  let newDate = new Date(date.getTime() + duration * 24 * 60 * 60 * 1000);
  newDate.setUTCHours(23, 59, 59, 999);
  return newDate;
};

const generateDateString = (date) => {
  return date.toISOString().replace("T", " ").substring(0, 19);
};
module.exports = {
  strDayFirstSecond,
  strDayLastSecond,
  generateDateString,
};
