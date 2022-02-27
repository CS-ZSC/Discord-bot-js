module.exports = {
  name: "potato",
  description: "Replies with pong", // Required for slash commands
  testOnly: true,

  options: [
    {
      name: "track",
      description: "Choose the track which you want to create a deadling",
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
      description: "Please enter the duration in days",
      required: true,
      type: 4,
    },
  ],
  slash: true,
  callback: ({ interaction, args }) => {
    const track = args[0];
    const duration = args[1];

    // interaction is provided only for a slash command
    interaction.reply({
      content: `You have made ${track} deadline for ${duration} days`,
    });
  },
};
