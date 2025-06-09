Raven WhatsApp Bot
Welcome to Raven, a versatile WhatsApp bot built with Node.js and the Baileys library. Created by Sey from Kairox, this bot offers a range of commands for fun, utility, and group management, with a stylish and interactive interface.
Overview

Bot Name: Raven
Purpose: A multi-functional WhatsApp bot for entertainment, information, and group administration.
Features: Quotes, memes, polls, weather updates, group tools, and more.
GitHub: https://github.com/kairox-sey

Prerequisites

Node.js (v14.x or higher)
npm (Node Package Manager)
A WhatsApp account for authentication

Setup Instructions

Clone the Repository:
git clone https://github.com/kairox-sey/Raven-WhatsApp-Bot.git
cd Raven-WhatsApp-Bot


Install Dependencies:
npm install


Configure the Bot:

Ensure index.js is present with the correct ownerJid (e.g., 233538911895@s.whatsapp.net).
Create a welcome_image.jpg in the root directory for the welcome message (optional).


Run Locally:
node index.js


Scan the QR code displayed in the terminal with your WhatsApp to authenticate.



Deployment
Raven can be deployed on various platforms. Below are quick guides:
Heroku

Install Heroku CLI.
Create an app: heroku create raven-bot.
Push code: git push heroku main.
Set Procfile with worker: node index.js.
Enable worker dyno in the Heroku Dashboard.

Render

Sign up at Render.
Connect GitHub repo, set build command to npm install, and start command to node index.js.
Deploy and authenticate via QR code.

Koyeb

Sign up at Koyeb.
Deploy from GitHub, use npm install as build command and node index.js as run command.
Monitor logs for QR code.

bot-hosting.com

Sign up at bot-hosting.com.
Upload a ZIP with index.js, package.json, and Procfile.
Set start command to node index.js and deploy.

Usage

Prefix: Use . before commands (e.g., .menu).
Commands:
.menu: Display the command galaxy.
.help: Get usage tips.
.quote: Receive a random quote.
.meme: Fetch a meme.
.weather <city>: Check weather.
.groupinfo: View group details.
And more—see .menu for the full list!


Settings:
.autoviewon/off: Toggle auto-view of statuses.
.privacy [private/public]: Restrict commands to owner.



Contributing
Feel free to fork this repo, make improvements, and submit pull requests. Issues and suggestions are welcome!
License
This project is open-source. See LICENSE (if added) for details.
Support
For help, contact Sey via the GitHub profile or join the community (TBD).
Last updated: June 09, 2025
