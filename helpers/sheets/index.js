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

module.exports = {
  getSheet,
};
