const { GoogleSpreadsheet } = require("google-spreadsheet");
const { decryptToString } = require("../../auth/secure-file");
const { JWT } = require('google-auth-library');
const logger = require("../logger");
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

    await doc.loadInfo();
    return doc;
  } catch (err) {
    logger.error('Sheets', `Connection failed`, { error: err.message });
    throw err;
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
    const sheet = doc.sheetsByTitle[sheetName];
    if (!sheet) {
      logger.warn('Sheets', `Sheet not found`, { sheetName });
    }
    return sheet;
  } catch (err) {
    logger.error('Sheets', `Failed to get sheet`, { sheetName, error: err.message });
    throw err;
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

// Helper to check if a value is empty (undefined, null, or empty string)
const isEmpty = (val) => val === undefined || val === null || val === '';

/**
 * Gets the user row by Discord Tag
 * @param {string} track
 * @param {string} username - The username (in Discord)
 * @returns {object} The user row
 */
const getUser = async (track, username) => {
  try {
    const sheet = await getSheet(track);
    if (!sheet) {
      logger.error('Sheets/GetUser', `Track sheet not found`, { track, user: username });
      throw new Error(`Track '${track}' not found`);
    }
    
    const rows = await sheet.getRows();
    const res = rows.find((row) => row._rawData[2] === username);
    
    if (!res) {
      logger.warn('Sheets/GetUser', `User not found in track`, { user: username, track });
      throw new Error("Couldn't find the user in the spreadsheet");
    }
    
    return res;
  } catch (err) {
    if (!err.message.includes("Couldn't find")) {
      logger.error('Sheets/GetUser', `Failed to get user`, { user: username, track, error: err.message });
    }
    throw err;
  }
};

const getTask = async (track, task) => {
  try {
    const sheet = await getSheet(`${track}_DL`);
    if (!sheet) {
      logger.error('Sheets/GetTask', `Deadline sheet not found`, { track, task });
      throw new Error(`This task doesn't exist yet`);
    }
    
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

    if (isEmpty(endDate) || isEmpty(startDate) || isEmpty(taskCell)) {
      logger.warn('Sheets/GetTask', `Task has missing data`, { track, task });
      throw new Error(`This task doesn't exist yet`);
    }

    return {
      track,
      task,
      startingDate: startDate,
      endingDate: endDate,
    };
  } catch (err) {
    if (!err.message.includes("doesn't exist")) {
      logger.error('Sheets/GetTask', `Failed to get task`, { track, task, error: err.message });
    }
    throw err;
  }
};

const insertTaskDone = async (track, author, taskNumber, dateStr, isLate = false) => {
  const username = author.username;
  
  try {
    const userRow = await getUser(track, username);

    userRow.set(`Task_${taskNumber}`, `Done ${dateStr}`);
    await userRow.save();

    if (isLate) {
      const sheet = userRow._worksheet;
      await sheet.loadHeaderRow();
      const headers = sheet.headerValues;
      const columnIndex = headers.indexOf(`Task_${taskNumber}`);

      if (columnIndex !== -1) {
        const rowIndex = userRow.rowIndex - 1;
        await sheet.loadCells({
          startRowIndex: rowIndex,
          endRowIndex: rowIndex + 1,
          startColumnIndex: columnIndex,
          endColumnIndex: columnIndex + 1
        });
        const cell = sheet.getCell(rowIndex, columnIndex);
        cell.backgroundColor = { red: 1, green: 0.8, blue: 0.8 };
        await sheet.saveUpdatedCells();
      }
    }

    logger.info('Sheets/InsertTaskDone', `Task marked as done`, { user: username, track, taskNumber, isLate });
    return true;
  } catch (err) {
    logger.error('Sheets/InsertTaskDone', `Failed to mark task done`, { user: username, track, taskNumber, error: err.message });
    return false;
  }
};

/**
 * Check if the user has done a specific task in the specified track
 * @param {int} taskNumber - The task number
 * @param {object} author - The user object
 * @param {string} track - The track of the user
 */
const userDoneTask = async (taskNumber, author, track) => {
  const username = author.username;
  
  try {
    const userRow = await getUser(track, username);

    const cellValue = userRow.get(`Task_${taskNumber}`);
    const isDone = !isEmpty(cellValue);
    
    return isDone;
  } catch (err) {
    logger.error('Sheets/UserDoneTask', `Failed to check task status`, { user: username, track, taskNumber, error: err.message });
    return false;
  }
};

/**
 * Get feedback for a specific task in the specified track
 * @param {string} track - The track name
 * @param {string} username - The username to identify the row
 * @param {int} taskNumber - The task number
 */
const getTaskFeedback = async (track, username, taskNumber) => {
  try {
    const sheet = await getSheet(`${track}_FB`);
    
    if (!sheet) {
      logger.error('Sheets/GetTaskFeedback', `Feedback sheet not found`, { user: username, track });
      throw new Error(`Feedback sheet for track '${track}' not found`);
    }

    // Verify that the task exists
    await getTask(track, taskNumber);

    // Check if the user has completed the task
    const is_user_done = await userDoneTask(taskNumber, { username }, track);

    if (!is_user_done) {
      logger.warn('Sheets/GetTaskFeedback', `User hasn't completed task`, { user: username, track, taskNumber });
      throw new Error(`You didn't finish this task yet`);
    }

    // Get the user row from the feedback sheet
    const rows = await sheet.getRows();
    const userRow = rows.find((row) => row._rawData[2] === username);

    if (!userRow) {
      logger.warn('Sheets/GetTaskFeedback', `User not found in feedback sheet`, { user: username, track });
      throw new Error(`Looks like you are not in the ${track.replace(/_/g, ' ')} track`);
    }
    
    const feedbackColumnName = `Task_${taskNumber}`;
    const feedback = userRow.get(feedbackColumnName);
  
    if (isEmpty(feedback)) {
      logger.info('Sheets/GetTaskFeedback', `Feedback not ready`, { user: username, track, taskNumber });
      throw new Error(`Looks like your feedback for task ${taskNumber} is not ready yet`);
    }
  
    logger.info('Sheets/GetTaskFeedback', `Feedback retrieved`, { user: username, track, taskNumber });
    return feedback;
  } catch (err) {
      logger.error('Sheets/GetTaskFeedback', `Failed to get feedback`, { user: username, track, taskNumber, error: err.message });
  }
};

const submitTask = async (track, author, taskNumber, dateStr, url, isLate = false) => {
  const username = author.username;
  
  try {
    const userRow = await getUser(track, username);

    userRow.set(`Task_${taskNumber}`, isLate ? `**Late Submission**\n${url}` : `${url}`);
    await userRow.save();
   
    logger.info('Sheets/SubmitTask', `Task submitted`, { user: username, track, taskNumber, isLate });
    return true;
  } catch (err) {
    logger.error('Sheets/SubmitTask', `Failed to submit task`, { user: username, track, taskNumber, error: err.message });
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