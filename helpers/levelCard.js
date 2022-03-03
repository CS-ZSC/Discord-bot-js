const { getBufferFromUrl } = require("../helpers/utils");
const canvacord = require("canvacord");
const Levels = require("discord-xp");

const backgroundImg = async () => {
  return await getBufferFromUrl(
    "https://media-exp1.licdn.com/dms/image/C5616AQFObxClmyrJCQ/profile-displaybackgroundimage-shrink_350_1400/0/1639796115609?e=1651708800&v=beta&t=Usy7ESxs3ct0aXg39Kg3smRiHVj8FcT3ie3VvyBnIPU"
  );
};

const fonts = [
  {
    path: "./assets/Quantico-Bold.ttf",
    face: {
      family: "Quantico",
      weight: "bold",
      style: "normal",
    },
  },
  {
    path: "./assets/Quantico-Regular.ttf",
    face: {
      family: "Quantico",
      weight: "regular",
      style: "normal",
    },
  },
];

const card = async (message, user) => {
  const levelUser = await Levels.fetch(message.author.id, message.guild.id);
  const leaderboard = await Levels.fetchLeaderboard(message.guild.id, 10);
  const userRank =
    leaderboard.findIndex(
      (leaderboardUser) => leaderboardUser.userID == message.author.id
    ) + 1;
  const requiredXp = Levels.xpFor(levelUser.level + 1);
  const bgImg = await backgroundImg();
  const img = user.displayAvatarURL({ dynamic: false, format: "png" });
  const rank = new canvacord.Rank()
    .setAvatar(img)
    .setCurrentXP(levelUser.xp, "#ffffff")
    .setRequiredXP(requiredXp, "#FFC000")
    .setBackground("IMAGE", bgImg)
    .setRank(userRank, "RANK #")
    .setRankColor("#FFFFFF", "#FFC000")
    .setOverlay("#0f0f0f", "0.7")
    .setProgressBar("#FFC000")
    .setUsername(user.username)
    .setLevel(levelUser.level)
    .setLevelColor("#FFFFFF", "#FFC000")
    .setDiscriminator(user.discriminator, "rgba(255, 255, 255, 1)")
    .registerFonts(fonts);

  return rank;
};

module.exports = card;
