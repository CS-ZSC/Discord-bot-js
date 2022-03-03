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
    (row) => row[columnName].toLowerCase() == searchValue.toLowerCase()
  );
  return row;
};

/**
 * Gets the user row by Discord Tag
 * @param {string} userId The user id which means username in discord + #userdescriminator
 * @returns returns the user row
 */
const getUser = async (userId) => {
  const sheet = await getSheet("points");
  const rows = await sheet.getRows();
  const columnName = "Discord Tag";
  const searchValue = userId;
  const userRow = searchRows(rows, columnName, searchValue);
  return userRow;
};

module.exports = {
  getSheet,
  getUser,
};
