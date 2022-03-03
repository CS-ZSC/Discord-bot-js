// const { getTask } = require("../helpers/sheets/index");

// module.exports = {
//   name: "messageCreate",
//   once: false,
//   execute(message) {
//     if (message.author.bot) return;

//     let track = "";

//     switch (message.channel.name) {
//       case "science-tasks-done":
//         track = "science";
//         break;
//       case "competitor-done":
//         track = "competitor";
//         break;
//       default:
//         break;
//     }

//     getTask(track, 1);

//     // task_start_date, task_end_date = get_task_start_end_date(track, task_number)
//     // if (task_end_date and task_start_date):
//     //   task_points = calculate_task_points(task_start_date, task_end_date, time_zoned_date, _TASK_POINT_INITAL, _TASK_BONUS_RATIO)
//     //   old_points, new_points = googlesheet.add_points_to(author, task_points)
//     //   if (test_if_announce(old_points, new_points)):
//     //     await announce(f"{msg.author.mention} you have {new_points} points now, yay")
//     // else:
//     //   print("Can't get start date or end date, done_task aborted")
//     //   return

//     // googlesheet.insert_task_done(track, author, task_number, created_at)
//   },
// };
