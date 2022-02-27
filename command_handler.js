const fs = require('fs');

function registerCommands(client, Discord) {
    client.commands = new Discord.Collection();
    const cmdHandlers = fs.readdirSync("./commands/").filter(file => file.endsWith(".js"));
    for (let handler of cmdHandlers) {
        let cmd = require(`./commands/${handler}`);
        client.commands.set(cmd.name, cmd);
    }
}

module.exports = {
    registerCommands: registerCommands,
}