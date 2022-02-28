const { GoogleSpreadsheet } = require("google-spreadsheet");
const creds = require("./creds.json");
require("dotenv").config();

const connect = async () => {
  const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEETS_ID);
  await doc.useServiceAccountAuth(creds);
  await doc.loadInfo(); // loads document properties and worksheets
  return doc;
};

const getSheet = async (sheetName) => {
  const doc = await connect();
  const sheet = doc.sheetsByTitle[sheetName]; // or use doc.sheetsById[id] or doc.sheetsByTitle[title]
  return sheet;
};

const searchRows = (rows, columnName, searchValue) => {
  const row = rows.filter(
    (row) => row[columnName].toLowerCase() == searchValue.toLowerCase()
  );
  return row;
};

const getUserPoints = async (userId) => {
  const sheet = await getSheet("points");
  const rows = await sheet.getRows();
  const columnName = "Discord Tag";
  const searchValue = userId;
  const userRow = searchRows(rows, columnName, searchValue);
  return userRow;
};

module.exports = {
  getSheet,
  getUserPoints,
};
