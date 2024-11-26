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

function getKeyByValue(object, value) {
  for (const [key, val] of Object.entries(object)) {
    if (val === value) {
      return key;
    }
  }
  return undefined;
}

function prevMonthName() {
  const previousMonth = new Date();
  previousMonth.setMonth(previousMonth.getMonth() - 1);
  const previousMonthName = previousMonth.toLocaleString('default', { month: 'long' });


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
  getKeyByValue,
  prevMonthName
};
