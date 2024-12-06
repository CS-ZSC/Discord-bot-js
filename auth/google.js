const { decryptToString, SECURE_FOLDER_ABSOLUTE_PATH } = require("./secure-file");

async function credentials() {
    let creds = JSON.parse(await decryptToString(`${SECURE_FOLDER_ABSOLUTE_PATH}/creds.json.secure`));
    return creds;
}


module.exports = {
    credentials
}