const { GoogleSpreadsheet } = require("google-spreadsheet");
const { decryptToString } = require("./secure-file");
require("dotenv").config();

/**
 * Decrypts the secure file to return the Google sheet credentials
 * @returns {object} The Google sheet credentials
 */
async function decrypt() {
  const secureFileName = './helpers/sheets/creds.json.secure';
  const jsonStr = await decryptToString(secureFileName);
  return JSON.parse(jsonStr);
}

/**
 * Connects to Google sheet and returns the document
 * @returns {object} The Google sheet document
 */
const connect = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
  const creds = await decrypt();
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo(); // loads document properties and worksheets
  return doc;
};

/**
 * Get a sheet by name
 * @param {string} sheetName - The name of the sheet
 * @returns {object} The sheet
 */
const getSheet = async (sheetName) => {
  const doc = await connect();
  return doc.sheetsByTitle[sheetName];
};

/**
 * Search a range of rows by column
 * @param {object} rows - Range of rows that you want to search in
 * @param {string} columnName - The name of the column you want to search in
 * @param {string} searchValue - The value that you want to find
 * @returns {array} Array of rows that have the search value
 */
const searchRows = (rows, columnName, searchValue) => {
  return rows.filter((row) => row[columnName]?.toLowerCase() === searchValue.toLowerCase());
};

/**
 * Gets the user row by Discord Tag
 * @param {string} sheetName
 * @param {string} userId - The user id (username in Discord + #userdescriminator)
 * @returns {object} The user row
 */
const getUser = async (sheetName, userId) => {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const columnName = "Discord Tag";
  return searchRows(rows, columnName, userId)[0];
};

// const getUserPoints = async (userId) => {
//   const sheet = await getSheet("points");
//   const rows = await sheet.getRows();
//   const columnName = "Discord Tag";
//   return searchRows(rows, columnName, userId)[0];
// };

const getTask = async (track, task) => {
  const sheet = await getSheet(`${track}_DL`);
  const task_row = task;
  const task_col = 0;
  await sheet.loadCells({
    startRowIndex: task_row,
    endRowIndex: task_row + 1,
    startColumnIndex: task_col,
    endColumnIndex: task_col + 3,
  });
  const taskCell = sheet.getCell(task_row, task_col).value;
  const startDate = sheet.getCell(task_row, task_col + 1).value;
  const endDate = sheet.getCell(task_row, task_col + 2).value;

  if (endDate == null || startDate == null || taskCell == null) {
    throw new Error(`This task doesn't exist yet`);
  }

  return {
    track,
    task,
    startingDate: startDate,
    endingDate: endDate,
  };
};

const insertTaskDone = async (track, author, taskNumber, dateStr) => {
  const userRow = await getUser(track, author.username);

  if (!userRow || userRow === '') {
    console.log("Couldn't find the author in the spreadsheet");
    return false;
  }

  userRow[`Task_${taskNumber}`] = `Done ${dateStr}`;
  await userRow.save();
  return true;
};

/**
 * Check if the user has done a specific task in the specified track
 * @param {int} taskNumber - The task number
 * @param {object} author - The user object
 * @param {string} track - The track of the user
 */
const userDoneTask = async (taskNumber, author, track) => {
  const sheet = await getSheet(track);
  const rows = await sheet.getRows();
  const userRow = rows.find((row) => row._rawData[2] === author.username);

  if (!userRow) {
    console.log("Couldn't find the author in the spreadsheet");
    return false;
  }

  return userRow[`Task_${taskNumber}`] !== undefined;
};

/**
 * Get feedback for a specific task in the specified track
 * @param {string} track - The track name
 * @param {string} username - The username to identify the row
 * @param {int} taskNumber - The task number
 */
const getTaskFeedback = async (track, username, taskNumber) => {
  const sheet = await getSheet(`${track}_FB`);

  try {
    await getTask(track, taskNumber);
  } catch (e) {
    throw new Error(e.message);
  }

  if (!await userDoneTask(taskNumber, { username }, track)) {
    throw new Error(`You didn't finish this task yet`);
  }

  const rows = await sheet.getRows();
  const userRow = rows.find((row) => row._rawData[2] === username);

  if (!userRow) {
    throw new Error(`Looks like you are not in the ${track} track`);
  }

  const taskRow = userRow.rowIndex;
  const taskCol = parseInt(taskNumber) + 2;

  await sheet.loadCells({
    startRowIndex: taskRow - 1,
    endRowIndex: taskRow,
    startColumnIndex: taskCol,
    endColumnIndex: taskCol + 1,
  });

  const feedback = sheet.getCell(taskRow - 1, taskCol).value;

  if (!feedback) {
    throw new Error(`Looks like your feedback for task ${taskNumber} is not ready yet`);
  }

  return feedback;
};

module.exports = {
  getSheet,
  getTask,
  getUser,
  insertTaskDone,
  userDoneTask,
  getTaskFeedback,
};