const times = require("../helpers/time/handlers");
const { getSheet } = require("../helpers/sheets/index");
const { getMembers } = require("../helpers/getTrackMembers/index");
const announce = require("../helpers/announce");

module.exports = {
  name: "deadline",
  description: "Make a deadline for specific track", // Required for slash commands
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
        {
          name: "Science",
          value: "science",
        },
        /*
        {
          name: "Competitor",
          value: "competitor",
        },
        */
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
    interaction.reply({
      content: "Working on it",
      //content: `added ${task} in ${track} from ${startingDate} to ${endingDate}`,
    });

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

      // Range is specefied so things speeds up
      await sheet.loadCells("A1:C50");

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
      //startingDateCell.numberFormat = {type: 'DATE_TIME'};
      //endingDateCell.numberFormat = {type: 'DATE_TIME'};

      // Commit the changes
      await sheet.saveUpdatedCells();
    } catch (e) {
      console.log("Error updating the sheet", e);
      interaction.editReply({
        content: `Error updating the sheet, Mention a bot admin`,
      });
      return;
    }
    let members;
    if (track === 'science') {
      members = await getMembers(interaction, 'cs');
    }
    else {
      members = await getMembers(interaction, track);
    }
    announce.announce({
      content: `${members} You got a task from ${startingDate} to ${endingDate}`,
    });

    // interaction is provided only for a slash command
    interaction.editReply({
      content: `added ${task} in ${track} from ${startingDate} to ${endingDate}`,
    });
  },
};

