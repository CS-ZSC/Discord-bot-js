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
    console.log(`[Sheets] Connected to ${doc.title}`);
    return doc;
  } catch (err) {
    console.error(`[Sheets] Couldn't connect to Google Spreadsheet: ${err.toString()}`)
  }
};

/**
 * Get a sheet by name
 * @param {string} sheetName - The name of the sheet
 * @returns {object} The sheet
 */
const getSheet = async (sheetName) => {
  try {
    console.log(`[Sheets] Getting sheet: ${sheetName}`);
    const doc = await connect();
    return doc.sheetsByTitle[sheetName];
  } catch (err) {
    console.error(`[Sheets] Couldn't get the sheet '${sheetName}': ${err.toString()}`)
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
  console.log(`[Sheets] Getting user ${username} in track ${track}`);
  const sheet = await getSheet(track);
  const rows = await sheet.getRows();
  const res = rows.find((row) => row._rawData[2] === username);
  if (!res) {
    console.warn(`[Sheets] User ${username} not found in ${track}`);
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
    console.log(`[Sheets] Getting task ${task} for track ${track}`);

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
      console.warn(`[Sheets] Task ${task} in ${track} has missing data`);
      throw new Error(`This task doesn't exist yet`);
    }

    return {
      track,
      task,
      startingDate: startDate,
      endingDate: endDate,
    };
  } catch (err) {
    console.error(`[Sheets] Couldn't get the task ${task} in ${track}: ${err.toString()}`)
  }
};

const insertTaskDone = async (track, author, taskNumber, dateStr, isLate = false) => {
  try {
    console.log(`[Sheets] Inserting task done: ${track}, User: ${author.username}, Task: ${taskNumber}, Date: ${dateStr}, Late: ${isLate}`);
    const userRow = await getUser(track, author.username);

    if (userRow === -1 || userRow === '') {
      throw new Error("Couldn't find the author in the spreadsheet");
    }

    userRow.set(`Task_${taskNumber}`, `Done ${dateStr}`)
    await userRow.save()

    if (isLate) {
      const sheet = userRow._worksheet;
      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;
      const columnIndex = headers.indexOf(`Task_${taskNumber}`);

      if (columnIndex !== -1) {
        const rowIndex = userRow.rowIndex - 1; // 0-based index
        await sheet.loadCells({
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: columnIndex,
          endColumnIndex: columnIndex + 1
        });
        const cell = sheet.getCell(rowIndex, columnIndex);
        cell.backgroundColor = { red: 1, green: 0.8, blue: 0.8 }; // Light red background
        await sheet.saveUpdatedCells();
      }
    }

    console.log(`[Sheets] Task ${taskNumber} marked as done for ${author.username}`);
    return true;
  } catch (err) {
    console.error(`[Sheets] Error marking user ${author.username} done task ${taskNumber}: ${err}`);
  }
};

/**
 * Check if the user has done a specific task in the specified track
 * @param {int} taskNumber - The task number
 * @param {object} author - The user object
 * @param {string} track - The track of the user
 */
const userDoneTask = async (taskNumber, author, track) => {
  console.log(`[Sheets] Checking if user ${author.username} done task ${taskNumber} in ${track}`);
  try {
    const userRow = await getUser(track, author.username);

    if (userRow === -1) {
      console.log();
      throw new Error("Couldn't find the author in the spreadsheet")
    }

    const isDone = [undefined, null, ""].includes(userRow.get(`Task_${taskNumber}`));
    console.log(`[Sheets] Task_${taskNumber} value for user ${author.username}: ${userRow.get(`Task_${taskNumber}`)}`);
    console.log(`[Sheets] User ${author.username} done task ${taskNumber}? ${isDone}`);
    return isDone;
  } catch (err) {
    console.error(`[Sheets] Error checking user done task: ${err}`);
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
  console.debug(`[Sheets] Getting feedback for: "${username}"\n track: ${track}\n taskNumber: ${taskNumber}`);
  try {
    await getTask(track, taskNumber);
  } catch (e) {
    throw new Error(e.message);
  }

  let is_user_done = await userDoneTask(taskNumber, { username }, track);
  console.log("[Sheets] is_user_done? ", is_user_done);

  if (!is_user_done) {
    throw new Error(`You didn't finish this task yet`);
  }

  const rows = await sheet.getRows();
  const userRow = rows.find((row) => row._rawData[2] === username);

  if (!userRow) {
    throw new Error(`Looks like you are not in the ${track} track`);
  }
  try {
    const taskRow = userRow._rowNumber;
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
  } catch (e) {
    console.error(`[Sheets] Couldn't load cells Internal Error: ${e}`, { taskRow, taskCol });
    return
  }

};

const submitTask = async (track, author, taskNumber, dateStr, url, isLate = false) => {
  try {
    console.log(`[Sheets] Submitting task: ${track}, User: ${author.username}, Task: ${taskNumber}, URL: ${url}, Late: ${isLate}`);
    const userRow = await getUser(track, author.username);

    if (userRow === -1 || userRow === '') {
      throw new Error("Couldn't find the author in the spreadsheet");
    }

    userRow.set(`Task_${taskNumber}`, `${url}\n${dateStr}`)
    await userRow.save()

    if (isLate) {
      const sheet = userRow._worksheet;
      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;
      const columnIndex = headers.indexOf(`Task_${taskNumber}`);

      if (columnIndex !== -1) {
        const rowIndex = userRow.rowIndex - 1; // 0-based index
        await sheet.loadCells({
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: columnIndex,
          endColumnIndex: columnIndex + 1
        });
        const cell = sheet.getCell(rowIndex, columnIndex);
        cell.backgroundColor = { red: 1, green: 0.8, blue: 0.8 }; // Light red background
        await sheet.saveUpdatedCells();
      }
    }

    console.log(`[Sheets] Task ${taskNumber} submitted for ${author.username}`);
    return true;
  } catch (err) {
    console.error(`[Sheets] Error submitting user task: ${err}`);
    throw err;
  }
};

module.exports = {
  getSheet,
  getTask,
  getUser,
  insertTaskDone,
  userDoneTask,
  getTaskFeedback,
  submitTask,
};