
<h1 align="center" style="color: cyan;">🦉 Raven WhatsApp Bot</h1>

<p align="center">
  <img src="https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif" width="200"/>
</p>

<p align="center" style="color: #00BFFF;">
  <strong>A futuristic WhatsApp bot powered by Node.js + Baileys</strong><br/>
  <strong>Kairox</strong> — proudly owned by <strong>Sey</strong> ⚡
</p>

<p align="center">
  <a href="https://github.com/kairox-sey/Raven-WhatsApp-Bot"><img alt="Repo Stars" src="https://img.shields.io/github/stars/kairox-sey/Raven-WhatsApp-Bot?style=for-the-badge"/></a>
  <a href="https://github.com/kairox-sey"><img alt="Author" src="https://img.shields.io/badge/Author-Kairox_Sey-blueviolet?style=for-the-badge"/></a>
  <img alt="License" src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge"/>
</p>

---

## 🧬 Overview

> **Bot Name**: Raven  
> **Purpose**: A futuristic, multi-functional WhatsApp bot for entertainment, info & control  
> **Features**: Quotes, memes, polls, weather, admin tools & more  
> **GitHub**: [github.com/kairox-sey](https://github.com/kairox-sey)

---

## ⚙️ Features

- 🤖 AI-ready command system  
- 🛰️ API integrations (weather, memes, quotes)  
- 🔐 Private + admin-only modes  
- 💾 Persistent settings  
- 🛠️ Easy to extend  

---

<details>
<summary>🛠️ <strong>Setup Instructions</strong></summary>

### ⚡ Prerequisites

- Node.js v14+  
- npm  
- WhatsApp number for session login

### 🚀 Installation

```bash
git clone https://github.com/kairox-sey/Raven-WhatsApp-Bot.git
cd Raven-WhatsApp-Bot
npm install
```

### 🧠 Config

- Set `ownerJid` in `index.js` (e.g., `233538911895@s.whatsapp.net`)  
- Optional: Add `welcome_image.jpg` in the root directory

### 🔌 Run the Bot

```bash
node index.js
```

- Scan the QR code from the terminal

</details>

---

<details>
<summary>🌐 <strong>Deployment</strong></summary>

### ☁️ Heroku

```bash
heroku login
heroku create raven-bot
git push heroku main
```

Add a `Procfile` with:
```txt
worker: node index.js
```

---

### 🖥️ Render

- Build command: `npm install`  
- Start command: `node index.js`  

---

### 🚀 Koyeb

- Build: `npm install`  
- Run: `node index.js`  
- Scan QR from logs

---

### 🤖 bot-hosting.com

- Upload ZIP with `index.js`, `package.json`, `Procfile`
- Start command: `node index.js`

</details>

---

## 🧪 Usage

> Prefix: `.`

| Command         | Function                |
|-----------------|-------------------------|
| `.menu`         | Show all commands       |
| `.help`         | Help and guidance       |
| `.quote`        | Inspiring quote         |
| `.meme`         | Fetch meme              |
| `.weather <city>` | Check weather       |
| `.groupinfo`    | Show group info         |

### 🔐 Settings

| Command            | Action                    |
|--------------------|---------------------------|
| `.autoviewon/off`  | Toggle status autoview    |
| `.privacy private` | Only owner can use bot    |
| `.privacy public`  | Allow group usage         |

---

## 🧑‍💻 Contributing

- Fork the repo  
- Suggest or add features  
- Submit pull requests

---

## 📜 License

Licensed under **MIT**. See LICENSE file.

---

## 📡 Contact / Support

- 📞 WhatsApp: [+233508517525](https://wa.me/233508517525)  
- 📸 Instagram: [@sey.o2o](https://instagram.com/sey.o2o)  
- 📬 Telegram: [@pwcca_his_highness](https://t.me/pwcca_his_highness)  

<p align="center">
  <img src="https://media.giphy.com/media/2A75RyXVzzSI2bx4Gj/giphy.gif" width="150"/>
</p>

<p align="center"><strong>Last updated: June 09, 2025</strong></p>
