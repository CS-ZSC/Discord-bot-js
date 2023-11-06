/**
 * Gets the start of a day
 * @param {date} date the date that you need the start of
 * @returns the start of the day
 */
const strDayFirstSecond = (date) => {
  const newDate = date;
  newDate.setUTCHours(0, 0, 0, 0);
  return date;
};

/**
 * Adds x amount of days to the intial date and returns the end of the new date
 * @param {date} date the date that you need the end of
 * @param {integar} duration The number of days
 * @returns the end of the new date
 */
const strDayLastSecond = (date, duration) => {
  let newDate = new Date(date.getTime() + duration * 24 * 60 * 60 * 1000);
  newDate.setUTCHours(23, 59, 59, 999);
  return newDate;
};

/**
 * Gets the string from a date
 * @param {Date} date the date that you want to convert into string
 * @returns string string of the date
 */
const generateDateString = (date) => {
  return date.toISOString().replace("T", " ").substring(0, 19);
};
module.exports = {
  strDayFirstSecond,
  strDayLastSecond,
  generateDateString,
};
