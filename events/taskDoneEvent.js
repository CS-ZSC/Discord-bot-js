const config = require('../config.json');

module.exports = {
  name: "messageCreate",
  once: false,
  execute(message) {
    if (message.author.bot) return;

    //Checking if the message is in the correct syntax & get the track
    task = message.content.toLowerCase().replace(" ", " ").split(" ")
    if (task.length != 3 || task[0] != "done") {
      return
    }
    track = config.doneChannels[message.channelId]
    if (!track) {
      console.log("User entered Done Task in wrong channels, or config.json is incorrect")
    }
  },
};

/*
<ref *1> Message {
  channelId: '945195764408262690',
  guildId: '945195764408262687',
  id: '949155517052379186',
  createdTimestamp: 1646366709722,
  type: 'DEFAULT',
  system: false,
  content: 'dd',
  author: User {
    id: '500727789025230878',
    bot: false,
    system: false,
    flags: UserFlags { bitfield: 128 },
    username: 'Phoenixx',
    discriminator: '3399',
    avatar: '4ef49d1095e4e0f203aad6de1a11022a',
    banner: undefined,
    accentColor: undefined
  },
  pinned: false,
  tts: false,
  nonce: '949155515454193664',
  embeds: [],
  components: [],
  attachments: Collection(0) [Map] {},
  stickers: Collection(0) [Map] {},
  editedTimestamp: null,
  reactions: ReactionManager { message: [Circular *1] },
  mentions: MessageMentions {
    everyone: false,
    users: Collection(0) [Map] {},
    roles: Collection(0) [Map] {},
    _members: null,
    _channels: null,
    crosspostedChannels: Collection(0) [Map] {},
    repliedUser: null
  },
  webhookId: null,
  groupActivityApplication: null,
  applicationId: null,
  activity: null,
  flags: MessageFlags { bitfield: 0 },
  reference: null,
  interaction: null
}
*/