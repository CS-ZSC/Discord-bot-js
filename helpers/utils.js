https = require("https");

async function getBufferFromUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (response) => {
      const body = [];
      response
        .on("data", (chunk) => {
          body.push(chunk);
        })
        .on("end", () => {
          resolve(Buffer.concat(body));
        });
    });
  });
}



const _SCIENCE_XP = 5;
let channelsPoints = {
  math: _SCIENCE_XP,
  "machine-learning": _SCIENCE_XP,
  android: _SCIENCE_XP,
  flutter: _SCIENCE_XP,
  "main-concepts": _SCIENCE_XP,
  "front-end": _SCIENCE_XP,
  "back-end": _SCIENCE_XP,
  "blogs-and-podcasts": _SCIENCE_XP,
};

module.exports = {
  getBufferFromUrl,
  channelsPoints,
};
