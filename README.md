# Discord Bot Repository Readme

Welcome to CS discord bot repository. This repository contains the code for the Discord bot that is used in the CS discord server. The bot is built using [Discord.js](https://discord.js.org/) and uses [Google Sheets](https://developers.google.com/sheets/api) and [MongoDB](https://www.mongodb.com/) as its database.

## Prerequisites

Before you begin, make sure you have the following installed:

- Node.js: [Download and install Node.js](https://nodejs.org/).
- npm: npm is the package manager for Node.js and comes bundled with it.

## Steps to Set Up Your Discord Bot

### 1. Install Dependencies

Before running the bot, install the required dependencies by running:

```bash
npm install
```

### 2. Create a Discord Bot

- Visit the [Discord Developer Portal](https://discord.com/developers/applications).
- Click on "New Application" to create a new Discord application.
- In the "Bot" tab, click on "Add Bot" to create a bot user.
- Copy the token generated for your bot and paste it into the `.env` file under the key `BOT_TOKEN`.

### 3. Set Up Google APIs

- Create a new project on the [Google Cloud Console](https://console.cloud.google.com/).
- Enable the Google Sheets API for your project.
- Create credentials for your project and download the JSON file.
- Place the downloaded `creds.json` file in the root of your repository.
- Run `npm run encrypt` to encrypt the credentials for security.

### 4. Create a Google Spreadsheet

- Create a new Google Spreadsheet in your Google Drive.
- Share the spreadsheet with the email address of your bot user.
- Copy the Spreadsheet ID from the URL and paste it into the `.env` file under the key `GOOGLE_SHEET_ID`.

### 5. Set Up MongoDB

- Create a MongoDB cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get the connection string for your cluster.
- Paste the connection string into the `.env` file under the key `MONGODB_URI`.
- don't forget to add your password and database name to the connection string.
- don't forget to open your IP address in the network access tab or it for all IP.


### 6. Run the Bot

Now that everything is set up, you can run the bot using:

```bash
npm run dev
```

Your bot should now be active on Discord, connected to Google Sheets, and using MongoDB as its database.

Feel free to explore the code, customize the bot to your liking, and add more features as needed. Happy coding!
