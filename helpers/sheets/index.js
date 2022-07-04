const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./creds.json");
require("dotenv").config();

/**
 * Connects to googlesheet and returns the doc
 * @returns The google sheet document
 */
const connect = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo(); // loads document properties and worksheets
  return doc;
};

/**
 *  Get a sheet by name
 * @param {string} sheetName the name of the sheet
 * @returns the sheet
 */
const getSheet = async (sheetName) => {
  const doc = await connect();
  const sheet = doc.sheetsByTitle[sheetName]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  return sheet;
};

/**
 * Search a range of rows by column
 * @param {object} rows Range of rows that you want to search in
 * @param {string} columnName the name of column you want to search in
 * @param {string} searchValue the value that you want to find
 * @returns array of rows taht has the search value
 */
const searchRows = (rows, columnName, searchValue) => {
  const row = rows.filter(
    (row) => { 
      if (row[columnName]) {
        return row[columnName].toLowerCase() === searchValue.toLowerCase()
      }
    }
  );
  return row;
};

/**
 * Gets the user row by Discord Tag
 * @param {string} userId The user id which means username in discord + #userdescriminator
 * @returns returns the user row
 */
const getUser = async (sheetName, userId) => {
  const sheet = await getSheet(sheetName);
  const rows = await sheet.getRows();
  const columnName = "Discord Tag";
  const searchValue = userId;
  const userRow = searchRows(rows, columnName, searchValue);
  return userRow;
};


const getUserPoints = async (userId) => {
  const sheet = await getSheet("points");
  const rows = await sheet.getRows();
  const columnName = "Discord Tag";
  const searchValue = userId;
  const userRow = searchRows(rows, columnName, searchValue);
  return userRow;
};

const getTask = async (track, task) => {
  let sheet = await getSheet(track + "_DL");
  let task_row = task;
  let task_col = 0;
  await sheet.loadCells({
    startRowIndex: task_row,
    endRowIndex: task_row + 1,
    startColumnIndex: task_col,
    endColumnIndex: task_col + 3,
  });
  const startDate = new Date(sheet.getCell(task_row, task_col + 1).value);
  const endDate = new Date(sheet.getCell(task_row, task_col + 2).value);
  if (endDate == null || startDate == null) {
    // print("Task Deadline doesn't exist in the spreadsheet")
    return null;
  }
  return {
    track,
    task,
    startingDate: startDate,
    endingDate: endDate,
  };
};


const insertTaskDone = async (track, author, taskNumber, dateStr) => {
  const [userRow] = await getUser(track, author.username + " #" + author.discriminator);
  if (!userRow || userRow == '') {
    console.log("Couldn't find the author in the spreadsheet");
    return;
  }
  userRow[`Task_${taskNumber}`] = "Done " + dateStr;
  await userRow.save();
};

module.exports = {
  getSheet,
  getTask,
  getUser,
  insertTaskDone
};