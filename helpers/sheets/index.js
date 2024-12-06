const { GoogleSpreadsheet } = require("google-spreadsheet");
const { decryptToString } = require("../../auth/secure-file");
const { JWT } = require('google-auth-library');
require("dotenv").config();

/**
 * Connects to Google sheet and returns the document
 * @returns {object} The Google sheet document
 */
const connect = async () => {
  try {
    let { creds } = require("../../events/ready");

    const jwt = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID, jwt);

    await doc.loadInfo(); // loads document properties and worksheets
    return doc;
  } catch (err) {
    console.error(`Couldn't connect to Google Spreadsheet: ${err.toString()}`)
  }
};

/**
 * Get a sheet by name
 * @param {string} sheetName - The name of the sheet
 * @returns {object} The sheet
 */
const getSheet = async (sheetName) => {
  try {
    const doc = await connect();
    return doc.sheetsByTitle[sheetName];
  } catch (err) {
    console.error(`Couldn't get the sheet: ${err.toString()}`)
  }
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
 * @param {string} track
 * @param {string} username - The username (in Discord)
 * @returns {object} The user row
 */
const getUser = async (track, username) => {
  const sheet = await getSheet(track);
  const rows = await sheet.getRows();
  const res = rows.find((row) => row._rawData[2] === username);
  if (!res) {
    throw new Error("Couldn't find the user in the spreadsheet")
    return -1;
  }
  return res;

};

// const getUserPoints = async (userId) => {
//   const sheet = await getSheet("points");
//   const rows = await sheet.getRows();
//   const columnName = "Discord Tag";
//   return searchRows(rows, columnName, userId)[0];
// };

const getTask = async (track, task) => {
  try {

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
  } catch (err) {
    console.error(`Couldn't get the task: ${err.toString()}`)
  }
};

const insertTaskDone = async (track, author, taskNumber, dateStr) => {
  try {
    const userRow = await getUser(track, author.username);

    if (userRow === -1 || userRow === '') {
      throw new Error("Couldn't find the author in the spreadsheet");
    }

    userRow.set(`Task_${taskNumber}`, `Done ${dateStr}`)
    await userRow.save()
    return true;
  } catch (err) {
    console.error(`[Marking the user as having done the task]: ${err}`);
  }
};

/**
 * Check if the user has done a specific task in the specified track
 * @param {int} taskNumber - The task number
 * @param {object} author - The user object
 * @param {string} track - The track of the user
 */
const userDoneTask = async (taskNumber, author, track) => {
  try {
    const userRow = await getUser(track, author.username);

    if (userRow === -1) {
      console.log();
      throw new Error("Couldn't find the author in the spreadsheet")
    }

    return userRow[`Task_${taskNumber}`] !== undefined;
  } catch (err) {
    console.error(`[Checking the user has done the task]: ${err}`);
  }
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