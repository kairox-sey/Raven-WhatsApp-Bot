const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage, areJidsSameUser } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const authFile = './auth_file';
const settingsFile = './settings.json';
const botName = 'Raven';
const companyName = 'Kairox';
const commandPrefix = '.';
const welcomeImagePath = './welcome_image.jpg';
let ownerJid = null;
let currentTrivia = null;

const API_NINJAS_KEY = 'Fcc7UUfjRmEY0Q7jTUB5LQ==LJMBB9ING3SRvOrg';
const OPENWEATHERMAP_KEY = '6e9efe905e8b3a81b6704dd2b960c156';

let settings = { mode: 'public', autoViewStatus: true };
if (!fs.existsSync(settingsFile)) {
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
} else {
    settings = JSON.parse(fs.readFileSync(settingsFile));
}

function loadSettings() {
    return JSON.parse(fs.readFileSync(settingsFile));
}

function saveSettings(newSettings) {
    settings = { ...settings, ...newSettings };
    fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2));
}

function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function getRandomQuote() {
    try {
        const response = await axios.get('https://zenquotes.io/api/random');
        return response.data[0].q + ' - ' + response.data[0].a;
    } catch (error) {
        console.error('Error fetching quote:', error);
        return 'The best way to predict the future is to create it. - Peter Drucker';
    }
}

async function getRandomJoke() {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', { headers: { 'Accept': 'text/plain' } });
        return response.data;
    } catch (error) {
        console.error('Error fetching joke:', error);
        return "Why did the scarecrow become a programmer? Because he was outstanding in his field! 😄";
    }
}

async function getRandomMeme() {
    try {
        const response = await axios.get('https://api.imgflip.com/get_memes');
        const memes = response.data.data.memes;
        const randomMeme = memes[Math.floor(Math.random() * memes.length)];
        return { url: randomMeme.url, caption: randomMeme.name };
    } catch (error) {
        console.error('Error fetching meme:', error);
        return { url: 'https://i.imgflip.com/1g8my4.jpg', caption: 'Classic meme!' };
    }
}

function getRandomRPS() {
    const choices = ['rock', 'paper', 'scissors'];
    return choices[Math.floor(Math.random() * choices.length)];
}

const triviaQuestions = [
    { question: "What’s the capital of France?\n1. Paris\n2. Florida\n3. Narnia", answer: 1 },
    { question: "Which planet is known as the Red Planet?\n1. Jupiter\n2. Mars\n3. Saturn", answer: 2 },
    { question: "What is 2 + 2?\n1. 3\n2. 4\n3. 5", answer: 2 },
    { question: "Which animal is known as man’s best friend?\n1. Cat\n2. Dog\n3. Bird", answer: 2 },
    { question: "What is the largest ocean on Earth?\n1. Atlantic\n2. Indian\n3. Pacific", answer: 3 }
];

const eightBallResponses = [
    "Yes, definitely!",
    "No way!",
    "Maybe, ask again later.",
    "Cannot predict now.",
    "Outlook not so good.",
    "Most likely.",
    "Signs point to yes."
];

const horoscopes = {
    "aries": "A fiery day ahead—take bold steps! 🌟",
    "taurus": "Relax and enjoy stability today. 🌱",
    "gemini": "Great time for communication. 💬",
    "cancer": "Focus on home and emotions. 🏡",
    "leo": "Shine bright with confidence! ☀️",
    "virgo": "Organize your life today. 📅",
    "libra": "Balance is key—seek harmony. ⚖️",
    "scorpio": "Deep thoughts lead to insights. 🕵️",
    "sagittarius": "Adventure calls—explore! 🌍",
    "capricorn": "Work hard for rewards. 🏆",
    "aquarius": "Innovate and dream big. 💡",
    "pisces": "Follow your intuition. 🌊"
};

async function getFact() {
    try {
        const response = await axios.get('https://api.api-ninjas.com/v1/facts', {
            headers: { 'X-Api-Key': API_NINJAS_KEY }
        });
        return response.data[0].fact;
    } catch (error) {
        console.error('Error fetching fact:', error);
        return "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.";
    }
}

async function translateText(text, toLang) {
    try {
        const response = await axios.post(
            'https://translation.googleapis.com/language/translate/v2',
            {},
            {
                params: {
                    q: text,
                    target: toLang,
                    key: 'YOUR_GOOGLE_TRANSLATE_API_KEY'
                }
            }
        );
        return response.data.data.translations[0].translatedText;
    } catch (error) {
        console.error('Error translating:', error);
        return `Translated to ${toLang}: ${text}`;
    }
}

async function getWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHERMAP_KEY}&units=metric`);
        const { main, weather } = response.data;
        return `Weather in ${city}: ${weather[0].description}, ${main.temp}°C ☀️`;
    } catch (error) {
        console.error('Error fetching weather:', error);
        return `Weather in ${city}: Unable to fetch data, check city name.`;
    }
}

function generateQR(text) {
    return `QR code for ${text}: [Imagine a cool QR here] 📷`;
}

async function shortenURL(url) {
    return `Shortened: ${url.slice(0, 20)}... 🔗`;
}

async function checkBotAdminStatus(sock, groupJid) {
    try {
        await sock.groupFetchAllParticipating();
        const groupMetadata = await sock.groupMetadata(groupJid);
        const botIdBase = sock.user.id.split(':')[0];
        const botIds = [
            `${botIdBase}@s.whatsapp.net`,
            `${botIdBase}@lid`
        ];
        const botParticipant = groupMetadata.participants.find(p => botIds.some(bid => areJidsSameUser(p.id, bid)));
        const isAdmin = botParticipant?.admin;
        console.log(`Admin check for ${groupJid} - Bot IDs: ${JSON.stringify(botIds)}, Bot Participant: ${JSON.stringify(botParticipant)}, Is Admin: ${isAdmin}`);
        return isAdmin === 'admin' || isAdmin === 'superadmin' || isAdmin === true;
    } catch (error) {
        console.error('Error checking bot admin status:', error);
        return false;
    }
}

async function executeWithRetry(sock, fn, maxAttempts = 3, delayMs = 2000) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            console.error(`Attempt ${attempt + 1} failed:`, error);
            if (attempt === maxAttempts - 1 || error.output?.statusCode !== 500) throw error;
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
}

async function handleAdminCommands(sock, msg, command) {
  const from = msg.key.remoteJid;
  const isGroup = from.endsWith('@g.us');

  if (!isGroup) return sock.sendMessage(from, { text: "❌ Group command only." });

  const groupMeta = await sock.groupMetadata(from);
  const senderId = msg.key.participant || msg.key.remoteJid;
  const botIdBase = sock.user.id.split(':')[0];
  const botIds = [
    `${botIdBase}@s.whatsapp.net`,
    `${botIdBase}@lid`
  ];

  const botParticipant = groupMeta.participants.find(p => botIds.some(bid => areJidsSameUser(p.id, bid)));
  const isBotAdmin = botParticipant?.admin;
  const isSenderAdmin = groupMeta.participants.find(p => areJidsSameUser(p.id, senderId))?.admin;

  if (!botParticipant) {
    console.log(`Bot not found in ${from} participants. Ensure the bot (${botIds.join(', ')}) is added to the group.`);
    return sock.sendMessage(from, { text: "❌ I'm not in the group. Please add me and make me an admin." });
  }
  if (!isBotAdmin) return sock.sendMessage(from, { text: "❌ I'm not an admin. Please promote me." });
  if (!isSenderAdmin) return sock.sendMessage(from, { text: "🚫 You must be an admin to use this." });

  const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
  if (mentions.length === 0) {
    return sock.sendMessage(from, { text: `⚠️ Tag a user to ${command}.` });
  }

  let action;
  if (command === 'promote') action = 'promote';
  else if (command === 'demote') action = 'demote';
  else if (command === 'kick') action = 'remove';
  else return sock.sendMessage(from, { text: "❓ Unknown command." });

  try {
    await sock.groupParticipantsUpdate(from, mentions, action);
    await sock.sendMessage(from, { text: `✅ ${command.toUpperCase()} success.` });
  } catch (err) {
    console.error(`Failed to ${command} in ${from}:`, err);
    await sock.sendMessage(from, { text: `❌ Failed to ${command}: ${err.message}` });
  }
}

async function downloadFromURL(url, format) {
    try {
        const response = await axios({
            method: 'get',
            url: url,
            responseType: 'arraybuffer'
        });
        return Buffer.from(response.data, 'binary');
    } catch (error) {
        console.error(`Error downloading ${format} from URL:`, error);
        throw new Error(`Failed to download ${format}`);
    }
}

async function handleDownloadCommand(sock, msg, platform, format) {
    const text = msg.message?.extendedTextMessage?.text || msg.message?.conversation || '';
    const urlMatch = text.match(/\bhttps?:\/\/\S+/i);
    if (!urlMatch) {
        return await sock.sendMessage(msg.key.remoteJid, { text: `⚠️ Please provide a valid ${platform} URL with the command.` });
    }
    const url = urlMatch[0];

    try {
        let downloadUrl;
        switch (platform) {
            case 'youtube':
                if (format === 'mp3') {
                    downloadUrl = `https://zeemo.ai/api/convert?url=${encodeURIComponent(url)}&format=mp3`;
                } else if (format === 'mp4') {
                    downloadUrl = `https://zeemo.ai/api/convert?url=${encodeURIComponent(url)}&format=mp4`;
                }
                break;
            case 'instagram':
                downloadUrl = `https://zeemo.ai/api/instagram?url=${encodeURIComponent(url)}&format=mp4`;
                break;
            case 'x':
                downloadUrl = `https://zeemo.ai/api/x?url=${encodeURIComponent(url)}&format=mp4`;
                break;
            case 'tiktok':
                downloadUrl = `https://zeemo.ai/api/tiktok?url=${encodeURIComponent(url)}&format=mp4`;
                break;
            default:
                return await sock.sendMessage(msg.key.remoteJid, { text: `❌ Unsupported platform: ${platform}` });
        }

        const buffer = await downloadFromURL(downloadUrl, format);
        await sock.sendMessage(msg.key.remoteJid, { [format === 'mp3' ? 'audio' : 'video']: buffer, mimetype: format === 'mp3' ? 'audio/mpeg' : 'video/mp4' });
        console.log(`Sent ${format} from ${platform} to ${msg.key.remoteJid}`);
    } catch (error) {
        console.error(`Download error for ${platform} ${format}:`, error);
        await sock.sendMessage(msg.key.remoteJid, { text: `❌ Failed to download ${format} from ${platform}: ${error.message}` });
    }
}

async function handleCommand(sock, msg) {
    const currentSettings = loadSettings();
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').toLowerCase();
    if (!text.startsWith(commandPrefix)) return;
    
    const sender = msg.key.remoteJid;
    const participant = msg.key.participant || sender;
    const ownerNumber = ownerJid ? ownerJid.split('@')[0].split(':')[0] : null;
    let participantNumber = null;
    if (participant) {
        const parts = participant.split('@');
        participantNumber = parts[0].split(':')[0];
    }
    const normalizedOwner = ownerNumber ? ownerNumber : ownerJid.split('@')[0].split(':')[0];
    const normalizedParticipant = participantNumber ? participantNumber : participant.split('@')[0].split(':')[0];
    const normalizedSender = sender.split('@')[0].split(':')[0];
    const isOwner = participant === ownerJid || 
                   (msg.key.fromMe && participant === sender) || 
                   (normalizedParticipant === normalizedOwner) || 
                   (normalizedSender === normalizedOwner) || 
                   (normalizedParticipant.startsWith(normalizedOwner.split(':')[0]) && msg.key.remoteJid.endsWith('@g.us')) || 
                   (normalizedParticipant === '249469333442651' && msg.key.remoteJid.endsWith('@g.us'));
    console.log(`Command received - Participant: ${participant}, Normalized Participant: ${normalizedParticipant}, Sender: ${sender}, Normalized Sender: ${normalizedSender}, FromMe: ${msg.key.fromMe}, Message: ${JSON.stringify(msg.message)} (Owner: ${ownerJid}, Normalized Owner: ${normalizedOwner})`);
    
    if (currentSettings.mode === 'private' && !isOwner) {
        console.log(`Blocked command from ${participant} (private mode)`);
        return await sock.sendMessage(sender, { text: '❌ Bot is in private mode. Only the owner can use commands.' });
    }
    
    const args = text.slice(commandPrefix.length).split(' ');
    const command = args[0];
    const param = args[1];
    const params = args.slice(1).join(' ');

    if (command === 'menu') {
        const menuText = `*🌌 ${botName.toUpperCase()} COMMAND GALAXY 🌌*\n` +
                        `_From ${companyName}, crafted by Sey_ 😎\n` +
                        `_Check me out: https://github.com/kairox-sey_\n\n` +
                        `*🎨 GENERAL*\n` +
                        `✨ *${commandPrefix}MENU*: Behold this stylish hub\n` +
                        `✨ *${commandPrefix}HELP*: Unlock the guide\n` +
                        `✨ *${commandPrefix}VV*: Snag view-once magic\n` +
                        `✨ *${commandPrefix}LIKE*: Heart a status 💚\n` +
                        `✨ *${commandPrefix}AUTOVIEWON/OFF*: Toggle auto-view\n` +
                        `✨ *${commandPrefix}PRIVACY [PRIVATE|PUBLIC]*: Switch modes\n\n` +
                        `*🌟 FUN & GAMES*\n` +
                        `🎲 *${commandPrefix}QUOTE*: Wisdom drop\n` +
                        `🎲 *${commandPrefix}MEME*: Meme madness\n` +
                        `🎲 *${commandPrefix}JOKE*: Laugh out loud\n` +
                        `🎲 *${commandPrefix}TRIVIA*: Brain teaser\n` +
                        `🎲 *${commandPrefix}POLL <Question>? <Opt1>, <Opt2>*: Start a vote\n` +
                        `🎲 *${commandPrefix}DICE*: Roll it\n` +
                        `🎲 *${commandPrefix}COIN*: Flip it\n` +
                        `🎲 *${commandPrefix}RPS <rock/paper/scissors>*: Play along\n\n` +
                        `*📚 KNOWLEDGE*\n` +
                        `📖 *${commandPrefix}FACT*: Fun factoid\n` +
                        `📖 *${commandPrefix}8BALL <Question>*: Mystic answer\n` +
                        `📖 *${commandPrefix}HOROSCOPE <Sign>*: Star vibes\n\n` +
                        `*🛠️ UTILITIES*\n` +
                        `🔧 *${commandPrefix}NICKNAME @user <name>*: Rename fun\n` +
                        `🔧 *${commandPrefix}REMINDER <msg> in <time> minutes*: Set alert\n` +
                        `🔧 *${commandPrefix}TRANSLATE <text> to <lang>*: Language swap\n` +
                        `🔧 *${commandPrefix}TRANSLATE*: Reply to a message to translate\n` +
                        `🔧 *${commandPrefix}WEATHER <city>*: Weather check\n` +
                        `🔧 *${commandPrefix}QR <text>*: QR creation\n` +
                        `🔧 *${commandPrefix}SHORTEN <url>*: Link trim\n\n` +
                        `*👥 GROUP TOOLS*\n` +
                        `🤝 *${commandPrefix}GROUPINFO*: Group stats\n` +
                        `🤝 *${commandPrefix}KICK*: Boot out (tag user)\n` +
                        `🤝 *${commandPrefix}PROMOTE*: Elevate role (tag user)\n` +
                        `🤝 *${commandPrefix}DEMOTE*: Remove admin role (tag user)\n` +
                        `🤝 *${commandPrefix}TAGALL*: Call everyone\n\n` +
                        `*📥 DOWNLOAD*\n` +
                        `⬇️ *${commandPrefix}YTMP3 <YouTube URL>*: Grab YouTube audio\n` +
                        `⬇️ *${commandPrefix}YTMP4 <YouTube URL>*: Grab YouTube video\n` +
                        `⬇️ *${commandPrefix}INSTA <Instagram URL>*: Save Instagram video\n` +
                        `⬇️ *${commandPrefix}XDL <X URL>*: Download X video\n` +
                        `⬇️ *${commandPrefix}TIKTOK <TikTok URL>*: Download TikTok video\n\n` +
                        `*⚙️ STATUS*\n` +
                        `- *AUTO-VIEW*: ${currentSettings.autoViewStatus !== undefined ? (currentSettings.autoViewStatus ? '✅ ON' : '❌ OFF') : '❌ OFF'}\n` +
                        `- *PRIVACY*: ${(currentSettings.mode || 'public').toUpperCase() === 'PRIVATE' ? '🔒 PRIVATE' : '🌍 PUBLIC'}\n\n` +
                        `_Dive deeper with *${commandPrefix}HELP*!_ 😄`;
        try {
            if (fs.existsSync(welcomeImagePath)) {
                const imageBuffer = fs.readFileSync(welcomeImagePath);
                await sock.sendMessage(sender, { image: imageBuffer, caption: menuText });
                console.log(`Sent menu image to ${sender}`);
            } else {
                console.warn('Welcome image not found at:', welcomeImagePath);
                await sock.sendMessage(sender, { text: menuText });
                console.log(`Sent menu text to ${sender} (no image)`);
            }
        } catch (error) {
            console.error('Error sending menu:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to send menu. Check logs. ${menuText}` });
        }
    }
    else if (command === 'help') {
        const helpText = `*🤖 ${botName.toUpperCase()} USER VIBES 🤖*\n` +
                        `_From ${companyName}, owned and created by Sey_ 🎉\n` +
                        `_Check me out: https://github.com/kairox-sey_\n\n` +
                        `*MASTER ${botName.toUpperCase()}*\n` +
                        `- Use *"${commandPrefix}"* prefix\n` +
                        `- *${commandPrefix}MENU*: All commands\n` +
                        `- *${commandPrefix}HELP*: Unlock the guide\n` +
                        `- *${commandPrefix}VV*: View once to inbox\n` +
                        `- *${commandPrefix}LIKE*: Like status with 💚\n` +
                        `- *${commandPrefix}AUTOVIEWON/OFF*: Auto-view\n` +
                        `- *${commandPrefix}PRIVACY [PRIVATE|PUBLIC]*: Mode\n` +
                        `- *${commandPrefix}QUOTE*: Inspire me\n` +
                        `- *${commandPrefix}MEME*: Funny meme\n` +
                        `- *${commandPrefix}JOKE*: Hear a joke\n` +
                        `- *${commandPrefix}TRIVIA*: Brain teaser\n` +
                        `- *${commandPrefix}POLL*: Vote fun\n` +
                        `- *${commandPrefix}DICE/COIN*: Chance games\n` +
                        `- *${commandPrefix}RPS*: Rock-Paper-Scissors\n` +
                        `- *${commandPrefix}FACT*: Cool fact\n` +
                        `- *${commandPrefix}8BALL*: Yes/No answers\n` +
                        `- *${commandPrefix}HOROSCOPE*: Stars align\n` +
                        `- *${commandPrefix}NICKNAME*: Fun names\n` +
                        `- *${commandPrefix}REMINDER*: Don’t forget\n` +
                        `- *${commandPrefix}TRANSLATE*: Language swap or reply to translate\n` +
                        `- *${commandPrefix}WEATHER*: Weather check\n` +
                        `- *${commandPrefix}QR*: QR maker\n` +
                        `- *${commandPrefix}SHORTEN*: Short links\n` +
                        `- *${commandPrefix}GROUPINFO/KICK/PROMOTE/DEMOTE/TAGALL*: Group tools\n` +
                        `- *${commandPrefix}YTMP3*: YouTube to MP3\n` +
                        `- *${commandPrefix}YTMP4*: YouTube to MP4\n` +
                        `- *${commandPrefix}INSTA*: Instagram video\n` +
                        `- *${commandPrefix}XDL*: X video\n` +
                        `- *${commandPrefix}TIKTOK*: TikTok video\n\n` +
                        `*HEADS UP* ⚠️\n` +
                        `- Mode: ${(currentSettings.mode || 'public').toUpperCase()}\n` +
                        `- View once needs consent.\n` +
                        `_Rock on with ${botName}!_ 😎`;
        await sock.sendMessage(sender, { text: helpText });
    }
    else if (command === 'vv') {
        const content = msg.message;
        const from = msg.key.remoteJid;

        const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedKey = content?.extendedTextMessage?.contextInfo?.stanzaId;
        const quotedParticipant = content?.extendedTextMessage?.contextInfo?.participant;

        if (!quoted || !quotedKey || !quotedParticipant) {
          await sock.sendMessage(from, { text: '⚠️ Please reply to a view-once message with `.vv`.' });
          return;
        }

        const viewOnceMessage = quoted?.viewOnceMessageV2?.message;
        if (!viewOnceMessage) {
          await sock.sendMessage(from, { text: '❌ That is not a view-once message.' });
          return;
        }

        const quotedFullMessage = {
          key: { remoteJid: from, id: quotedKey, fromMe: false, participant: quotedParticipant },
          message: quoted,
        };

        const mediaType = viewOnceMessage?.imageMessage ? 'image' : viewOnceMessage?.videoMessage ? 'video' : null;

        if (!mediaType) {
          await sock.sendMessage(from, { text: '❌ Unsupported view-once media type.' });
          return;
        }

        try {
          const buffer = await downloadMediaMessage(quotedFullMessage, 'buffer', {}, { reuploadRequest: sock.updateMediaMessage });
          await sock.sendMessage(from, { [mediaType]: buffer, caption: '📥 Recovered view-once media' });
        } catch (err) {
          console.error('Error:', err);
          await sock.sendMessage(from, { text: '❌ Failed to decrypt the view-once message.' });
        }
    }
    else if (command === 'like') {
        await sock.sendMessage(sender, { text: `*OOPS* ❌ Use auto-view to like statuses automatically. Enable with *.AUTOVIEWON*` });
    }
    else if (command === 'autoviewon') {
        saveSettings({ autoViewStatus: true });
        await sock.sendMessage(sender, { text: `*AUTO-VIEW ON* ✅ Statuses will be viewed and liked automatically.` });
    } else if (command === 'autoviewoff') {
        saveSettings({ autoViewStatus: false });
        await sock.sendMessage(sender, { text: `*AUTO-VIEW OFF* ❌ Statuses won’t be viewed or liked automatically.` });
    }
    else if (command === 'privacy') {
        if (!isOwner) {
            await sock.sendMessage(sender, { text: '❌ Only the owner can use this command.' }, { quoted: msg });
            return;
        }

        const mode = param?.toLowerCase();
        if (!['public', 'private'].includes(mode)) {
            await sock.sendMessage(sender, { text: '⚙️ Usage: .privacy public | .privacy private' }, { quoted: msg });
            return;
        }

        saveSettings({ mode: mode });
        await sock.sendMessage(sender, { text: `✅ Bot mode set to *${mode}*.` }, { quoted: msg });
    }
    else if (command === 'quote') {
        const quote = await getRandomQuote();
        await sock.sendMessage(sender, { text: `*QUOTE* 🌟\n${quote}` });
    }
    else if (command === 'meme') {
        const meme = await getRandomMeme();
        try {
            await sock.sendMessage(sender, { image: { url: meme.url }, caption: meme.caption });
            console.log(`Sent meme image to ${sender}`);
        } catch (error) {
            console.error('Error sending meme:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to send meme. ${meme.caption}` });
        }
    }
    else if (command === 'joke') {
        const joke = await getRandomJoke();
        await sock.sendMessage(sender, { text: `*JOKE* 😄\n${joke}` });
    }
    else if (command === 'trivia') {
        if (!currentTrivia) {
            currentTrivia = getRandom(triviaQuestions);
            await sock.sendMessage(sender, { text: `*TRIVIA* 🧠\n${currentTrivia.question}\nReply with the number of your answer!` });
        }
    }
    else if (currentTrivia && !isNaN(parseInt(text))) {
        const userAnswer = parseInt(text);
        if (userAnswer === currentTrivia.answer) {
            await sock.sendMessage(sender, { text: `*TRIVIA RESULT* 🎉 Correct! Well done!` });
            currentTrivia = null;
        } else {
            await sock.sendMessage(sender, { text: `*TRIVIA RESULT* ❌ Wrong! Try again with .trivia or reply with the correct number.` });
        }
    }
    else if (command === 'rps' && param) {
        const choices = ['rock', 'paper', 'scissors'];
        if (!choices.includes(param)) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}RPS rock/paper/scissors*` });
            return;
        }
        const botChoice = getRandomRPS();
        let result = 'It’s a tie! 🤝';
        if ((param === 'rock' && botChoice === 'scissors') || 
            (param === 'paper' && botChoice === 'rock') || 
            (param === 'scissors' && botChoice === 'paper')) {
            result = 'You win! 🎉';
        } else if (param !== botChoice) {
            result = 'I win! 😎';
        }
        await sock.sendMessage(sender, { text: `*RPS* ✊✋✌\nYou: ${param}\nBot: ${botChoice}\n${result}` });
    }
    else if (command === 'fact') {
        const fact = await getFact();
        await sock.sendMessage(sender, { text: `*FACT* 📚\n${fact}` });
    }
    else if (command === '8ball' && params) {
        const response = getRandom(eightBallResponses);
        await sock.sendMessage(sender, { text: `*8BALL* 🎱\n${params}\n${response}` });
    }
    else if (command === 'horoscope' && param) {
        const sign = param.toLowerCase();
        const horoscope = horoscopes[sign] || 'Invalid sign! Try leo. 🌟';
        await sock.sendMessage(sender, { text: `*HOROSCOPE* 🌌\n${sign.toUpperCase()}: ${horoscope}` });
    }
    else if (command === 'nickname' && params && msg.key.remoteJid.endsWith('@g.us')) {
        const [target, ...nick] = params.split(' ');
        if (!target.startsWith('@')) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}NICKNAME @user name*` });
            return;
        }
        const nickname = nick.join(' ').trim();
        if (nickname.length > 10) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Nickname too long (max 10 chars)!` });
            return;
        }
        await sock.sendMessage(sender, { text: `*NICKNAME* 😎\n@${target.slice(1)} is now *${nickname}*!` });
    }
    else if (command === 'reminder' && params) {
        const match = params.match(/(.+?)\s+in\s+(\d+)\s+minutes*/i);
        if (!match) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}REMINDER msg in X minutes*` });
            return;
        }
        const [, msgText, minutes] = match;
        setTimeout(async () => {
            await sock.sendMessage(sender, { text: `*REMINDER* ⏰\n${msgText}` });
        }, parseInt(minutes) * 60 * 1000);
        await sock.sendMessage(sender, { text: `*REMINDER SET* ⏳\nI’ll ping you in ${minutes} minutes!` });
    }
    else if (command === 'translate') {
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (quotedMsg && params) {
            const match = params.match(/\s+to\s+(\w+)/i);
            if (match) {
                const toLang = match[1];
                let textToTranslate = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || '';
                const translated = await translateText(textToTranslate, toLang);
                await sock.sendMessage(sender, { text: `*TRANSLATE* 🌐\nTranslated to ${toLang}: ${translated}` });
                return;
            }
        } else if (params) {
            const match = params.match(/(.+?)\s+to\s+(\w+)/i);
            if (match) {
                const [, textToTranslate, toLang] = match;
                const translated = await translateText(textToTranslate, toLang);
                await sock.sendMessage(sender, { text: `*TRANSLATE* 🌐\nTranslated to ${toLang}: ${translated}` });
                return;
            }
        }
        await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *.translate text to lang* or reply to a message with *.translate to lang*` });
    }
    else if (command === 'weather' && params) {
        const weather = await getWeather(params);
        await sock.sendMessage(sender, { text: `*WEATHER* 🌞\n${weather}` });
    }
    else if (command === 'qr' && params) {
        const qr = generateQR(params);
        await sock.sendMessage(sender, { text: `*QR CODE* 📷\n${qr}` });
    }
    else if (command === 'shorten' && params) {
        const shortUrl = await shortenURL(params);
        await sock.sendMessage(sender, { text: `*SHORTEN* 🔗\n${shortUrl}` });
    }
    else if (command === 'groupinfo' && msg.key.remoteJid.endsWith('@g.us')) {
        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
            const info = `*GROUP INFO* 📋\nName: ${groupMetadata.subject}\nMembers: ${groupMetadata.participants.length}\nID: ${groupMetadata.id}`;
            await sock.sendMessage(sender, { text: info });
        } catch (error) {
            console.error('Error fetching group info:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to get group info.` });
        }
    }
    else if (['kick', 'promote', 'demote'].includes(command) && msg.key.remoteJid.endsWith('@g.us')) {
        console.log(`Executing ${command} command in ${msg.key.remoteJid}`);
        await handleAdminCommands(sock, msg, command);
    }
    else if (command === 'tagall' && msg.key.remoteJid.endsWith('@g.us')) {
        if (currentSettings.mode === 'private' && !isOwner) {
            await sock.sendMessage(sender, { text: '❌ Only the owner can use this command.' }, { quoted: msg });
            return;
        }
        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = groupMetadata.participants.map(p => p.id);
            const mentionsText = participants.map(id => `@${id.split('@')[0]}`).join(' ');
            await sock.sendMessage(msg.key.remoteJid, { text: `*GROUP TAG* 📢\n${mentionsText}`, mentions: participants });
            console.log(`Tagged all in group ${msg.key.remoteJid}`);
        } catch (error) {
            console.error('Error tagging group members:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to tag group members.` });
        }
    }
    else if (command === 'ytmp3' && params) {
        await handleDownloadCommand(sock, msg, 'youtube', 'mp3');
    }
    else if (command === 'ytmp4' && params) {
        await handleDownloadCommand(sock, msg, 'youtube', 'mp4');
    }
    else if (command === 'insta' && params) {
        await handleDownloadCommand(sock, msg, 'instagram', 'mp4');
    }
    else if (command === 'xdl' && params) {
        await handleDownloadCommand(sock, msg, 'x', 'mp4');
    }
    else if (command === 'tiktok' && params) {
        await handleDownloadCommand(sock, msg, 'tiktok', 'mp4');
    }
    else {
        await sock.sendMessage(sender, { text: `*OOPS* ❌ Unknown command! Type *.menu* to see available commands.` });
    }
}

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState(authFile);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        getMessage: async (key) => { return { conversation: "Fallback message" }; }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log(`Scan this QR code with your WhatsApp app (Settings > Linked Devices > Link a Device) using number 249469333442651:`);
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Connection closed, reconnecting...');
                startBot();
            } else {
                console.log('Connection closed. You are logged out. Delete "auth_file" folder and restart.');
            }
        } else if (connection === 'open') {
            if (!ownerJid && sock.user && sock.user.id) {
                ownerJid = sock.user.id;
                console.log(`Dynamically set Owner JID: ${ownerJid}`);
            }
            console.log(`✅ ${botName} is connected to WhatsApp!`);
            console.log(`Owner: ${ownerJid}`);
            try {
                if (fs.existsSync(welcomeImagePath)) {
                    const imageBuffer = fs.readFileSync(welcomeImagePath);
                    const menuText = `*HEY, ${botName.toUpperCase()} IS LIVE!* 😎\n\n` +
                                    `_From ${companyName}, owned and created by Sey_\n` +
                                    `_Check me out: https://github.com/kairox-sey_\n\n` +
                                    `*🌌 ${botName.toUpperCase()} COMMAND GALAXY 🌌*\n` +
                                    `_Check out the menu!_ 😎\n\n` +
                                    `*🎨 GENERAL*\n` +
                                    `✨ *${commandPrefix}MENU*: Behold this stylish hub\n` +
                                    `✨ *${commandPrefix}HELP*: Unlock the guide\n` +
                                    `✨ *${commandPrefix}VV*: Snag view-once magic\n` +
                                    `✨ *${commandPrefix}LIKE*: Heart a status 💚\n` +
                                    `✨ *${commandPrefix}AUTOVIEWON/OFF*: Toggle auto-view\n` +
                                    `✨ *${commandPrefix}PRIVACY [PRIVATE|PUBLIC]*: Switch modes\n\n` +
                                    `*🌟 FUN & GAMES*\n` +
                                    `🎲 *${commandPrefix}QUOTE*: Wisdom drop\n` +
                                    `🎲 *${commandPrefix}MEME*: Meme madness\n` +
                                    `🎲 *${commandPrefix}JOKE*: Laugh out loud\n` +
                                    `🎲 *${commandPrefix}TRIVIA*: Brain teaser\n` +
                                    `🎲 *${commandPrefix}POLL <Question>? <Opt1>, <Opt2>*: Start a vote\n` +
                                    `🎲 *${commandPrefix}DICE*: Roll it\n` +
                                    `🎲 *${commandPrefix}COIN*: Flip it\n` +
                                    `🎲 *${commandPrefix}RPS <rock/paper/scissors>*: Play along\n\n` +
                                    `*📚 KNOWLEDGE*\n` +
                                    `📖 *${commandPrefix}FACT*: Fun factoid\n` +
                                    `📖 *${commandPrefix}8BALL <Question>*: Mystic answer\n` +
                                    `📖 *${commandPrefix}HOROSCOPE <Sign>*: Star vibes\n\n` +
                                    `*🛠️ UTILITIES*\n` +
                                    `🔧 *${commandPrefix}NICKNAME @user <name>*: Rename fun\n` +
                                    `🔧 *${commandPrefix}REMINDER <msg> in <time> minutes*: Set alert\n` +
                                    `🔧 *${commandPrefix}TRANSLATE <text> to <lang>*: Language swap\n` +
                                    `🔧 *${commandPrefix}TRANSLATE*: Reply to a message to translate\n` +
                                    `🔧 *${commandPrefix}WEATHER <city>*: Weather check\n` +
                                    `🔧 *${commandPrefix}QR <text>*: QR creation\n` +
                                    `🔧 *${commandPrefix}SHORTEN <url>*: Link trim\n\n` +
                                    `*👥 GROUP TOOLS*\n` +
                                    `🤝 *${commandPrefix}GROUPINFO*: Group stats\n` +
                                    `🤝 *${commandPrefix}KICK*: Boot out (tag user)\n` +
                                    `🤝 *${commandPrefix}PROMOTE*: Elevate role (tag user)\n` +
                                    `🤝 *${commandPrefix}DEMOTE*: Remove admin role (tag user)\n` +
                                    `🤝 *${commandPrefix}TAGALL*: Call everyone\n\n` +
                                    `*📥 DOWNLOAD*\n` +
                                    `⬇️ *${commandPrefix}YTMP3 <YouTube URL>*: Grab YouTube audio\n` +
                                    `⬇️ *${commandPrefix}YTMP4 <YouTube URL>*: Grab YouTube video\n` +
                                    `⬇️ *${commandPrefix}INSTA <Instagram URL>*: Save Instagram video\n` +
                                    `⬇️ *${commandPrefix}XDL <X URL>*: Download X video\n` +
                                    `⬇️ *${commandPrefix}TIKTOK <TikTok URL>*: Download TikTok video\n\n` +
                                    `*⚙️ STATUS*\n` +
                                    `- *AUTO-VIEW*: ${settings.autoViewStatus ? '✅ ON' : '❌ OFF'}\n` +
                                    `- *PRIVACY*: ${settings.mode.toUpperCase() === 'PRIVATE' ? '🔒 PRIVATE' : '🌍 PUBLIC'}\n\n` +
                                    `_Drop a *${commandPrefix}HELP* for more!_ 😄`;
                    await sock.sendMessage(ownerJid, { image: imageBuffer, caption: menuText });
                    console.log(`Sent welcome image and menu to ${ownerJid}`);
                } else {
                    console.warn('Welcome image not found at:', welcomeImagePath);
                    await sock.sendMessage(ownerJid, { text: menuText });
                    console.log(`Sent welcome text to ${ownerJid} (no image)`);
                }
            } catch (error) {
                console.error('Error sending welcome message:', error);
                await sock.sendMessage(ownerJid, { text: `*ERROR* ❌ Failed to send welcome. ${menuText}` });
            }
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        for (const msg of messages) {
            if (msg.key.remoteJid === 'status@broadcast' && settings.autoViewStatus) {
                console.log(`New status from ${msg.key.participant}`);
                try {
                    await sock.readMessages([msg.key]);
                    await sock.sendMessage(msg.key.remoteJid, { react: { key: msg.key, text: '❤️' } });
                    console.log(`Liked status from ${msg.key.participant}`);
                } catch (error) {
                    console.error('Error viewing or liking status:', error);
                }
            }
            if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
                await handleCommand(sock, msg);
            }
        }
    });

    return sock;
}

startBot().catch(error => {
    console.error(`Failed to start ${botName}:`, error);
});
