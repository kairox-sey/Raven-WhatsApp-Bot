<h1 align="center">🦉 Raven WhatsApp Bot</h1>

<p align="center">
  <img src="https://media.giphy.com/media/QBd2kLB5qDmysEXre9/giphy.gif" width="200"/>
</p>

<p align="center">
  <strong>A versatile, modular WhatsApp bot powered by Node.js + Baileys</strong><br/>
  Created by <a href="https://github.com/kairox-sey">Sey</a> from Kairox 💡
</p>

<p align="center">
  <a href="https://github.com/kairox-sey/Raven-WhatsApp-Bot"><img alt="Repo Stars" src="https://img.shields.io/github/stars/kairox-sey/Raven-WhatsApp-Bot?style=for-the-badge"/></a>
  <a href="https://github.com/kairox-sey"><img alt="Author" src="https://img.shields.io/badge/Author-Kairox_Sey-blueviolet?style=for-the-badge"/></a>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

## 📜 Overview

> **Bot Name**: Raven  
> **Purpose**: A multi-functional WhatsApp bot for entertainment, information & group admin  
> **Features**: Quotes, memes, polls, weather, tools & more  
> **GitHub**: [github.com/kairox-sey](https://github.com/kairox-sey)

---

## 🚀 Features

- 🧠 Intelligent group commands
- 🎭 Fun: memes, quotes, jokes
- ☁️ Live weather updates
- ⚙️ Auto-view status toggle
- 🔒 Private mode (owner only)
- 🔧 Admin & permission system
- 🌐 Deployable on any platform
- 🧩 Extensible & modular structure

---

<details>
<summary>🧰 <strong>Setup Instructions</strong></summary>

### 🔧 Prerequisites

- Node.js v14.x or higher  
- npm installed  
- A WhatsApp number (to log in)

### 📦 Clone & Install

```bash
git clone https://github.com/kairox-sey/Raven-WhatsApp-Bot.git
cd Raven-WhatsApp-Bot
npm install
⚙️ Configure the Bot
Set your ownerJid in index.js
Example: 233538911895@s.whatsapp.net

Optionally, add welcome_image.jpg for welcome messages.

🟢 Run the Bot
bash
Copy
Edit
node index.js
Scan the QR code shown in terminal with your WhatsApp.

</details>
<details> <summary>🌍 <strong>Deployment Guides</strong></summary>
☁️ Heroku
bash
Copy
Edit
heroku login
heroku create raven-bot
git push heroku main
Add a Procfile: worker: node index.js

Enable worker dyno in dashboard.

🖥️ Render
Connect repo, set:

Build command: npm install

Start command: node index.js

⚡ Koyeb
Deploy GitHub repo

Build: npm install, Run: node index.js

Authenticate using QR in logs

📡 bot-hosting.com
Upload ZIP (with index.js, package.json, Procfile)

Start command: node index.js

</details>
📖 Usage
Prefix: . (dot)

🔹 Sample Commands
Command	Description
.menu	View all commands
.help	Usage guide
.quote	Get a random quote
.meme	Fetch a fresh meme
.weather <city>	Check live weather
.groupinfo	View group info

🔐 Settings
Command	Description
.autoviewon/off	Auto-view WhatsApp statuses
.privacy private	Restrict bot to owner only
.privacy public	Allow group use

🤝 Contributing
Pull requests are welcome!
Feel free to fork, suggest features, or report bugs.
Let’s build the most 🔥 WhatsApp bot together.

📄 License
This project is open-source under the MIT License.
See LICENSE for more details.

📬 Support
For help or contributions:

Contact Sey via GitHub

Community/Support group coming soon!

<p align="center"> <img src="https://media.giphy.com/media/fdLRfjKdJtL5XzfnDZ/giphy.gif" width="100"/> </p> <p align="center"><strong>Last updated: June 09, 2025</strong></p> ```
