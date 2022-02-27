const times = require("../helpers/time/handlers");
const { getSheet } = require("../helpers/sheets/index");

module.exports = {
  name: "deadlinejs",
  description: "Replies with pong", // Required for slash commands
  testOnly: true,

  options: [
    {
      name: "track",
      description: "Choose the track which you want to create a deadline",
      required: true,
      type: 3,
      choices: [
        {
          name: "Web",
          value: "web",
        },
        {
          name: "Mobile",
          value: "mobile",
        },
        {
          name: "AI",
          value: "ai",
        },
      ],
    },
    {
      name: "duration",
      description: "Please enter the duration in days [7 Days Recommended]",
      required: true,
      type: 4,
    },
    {
      name: "task",
      description: "Please enter the task number",
      required: true,
      type: 4,
    },
  ],
  slash: true,
  callback: async ({ interaction, args }) => {
    const track = args[0];
    const duration = args[1];
    const task = args[2];

    // Intializing start and end date
    const date = new Date();
    let startingDate = times.strDayFirstSecond(date);
    let endingDate = times.strDayLastSecond(date, duration);

    try {
      // Get the sheet and load It's cells
      let sheet = await getSheet(`${track}_DL`);
      await sheet.loadCells();

      // Get  cells to insert the task
      const taskNumberCell = sheet.getCell(task, 0);
      const startingDateCell = sheet.getCell(task, 1);
      const endingDateCell = sheet.getCell(task, 2);

      startingDate = times.generateDateString(startingDate);
      endingDate = times.generateDateString(endingDate);

      // insert the task
      taskNumberCell.value = task.toString();
      startingDateCell.value = startingDate;
      endingDateCell.value = endingDate;

      // Commit the changes
      await sheet.saveUpdatedCells();
    } catch (e) {
      console.log("Error updating the sheet");
    }

    // interaction is provided only for a slash command
    interaction.reply({
      content: `added ${task} in ${track} from ${startingDate} to ${endingDate}`,
    });
  },
};
