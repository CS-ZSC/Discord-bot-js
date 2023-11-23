// runFunction.js
const path = require('path');
const {encryptFile} = require("./helpers/sheets/secure-file");

// Get the file path from the command line arguments or use the default
const filePath = process.argv[2] || 'creds.json';

// Construct the absolute path by joining with the current working directory
const absoluteFilePath = path.resolve(filePath);


// Call the specific function (e.g., encryptFile) with the file path

try {
    encryptFile(absoluteFilePath).then(r => r);
} catch (e) {
    console.error(e);
}

