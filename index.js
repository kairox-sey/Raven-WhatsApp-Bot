const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, downloadMediaMessage } = require('@whiskeysockets/baileys');
const P = require('pino');
const qrcode = require('qrcode-terminal');
const fs = require('fs');
const axios = require('axios');

// === CONFIGURATION ===
const botName = 'Raven';
const companyName = 'Kairox';
const commandPrefix = '.';
let settings = {
    autoViewStatus: true,
    privacyMode: 'public' // Default to public
};
const welcomeImagePath = './welcome_image.jpg'; // Path to the image file
const ownerJid = '233538911895@s.whatsapp.net'; // Fixed owner number

// === UTILITIES ===
const quotes = [
    "Be the change you wish to see in the world. - Mahatma Gandhi",
    "Stay hungry, stay foolish. - Steve Jobs",
    "The only limit is your imagination. 🌟"
];
const jokes = [
    "Why did the scarecrow become a programmer? Because he was outstanding in his field! 😄",
    "Why don't eggs tell jokes? They'd crack up! 🥚"
];
const facts = [
    "Honey never spoils. Archeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible. 🍯",
    "Octopuses have three hearts and can change color to blend into their surroundings. 🐙"
];
const eightBallResponses = [
    "It is certain. 🎱",
    "Ask again later. 🤔",
    "Don't count on it. 😕"
];
const horoscopes = {
    leo: "Today, your confidence will shine, Leo! Take bold steps toward your goals. 🦁"
    // Add more signs as needed
};

function getRandom(array) {
    return array[Math.floor(Math.random() * array.length)];
}

async function getMeme() {
    try {
        return "https://i.imgflip.com/1g8my4.jpg"; // Placeholder
    } catch (error) {
        console.error('Error fetching meme:', error);
        return 'Oops, couldn’t grab a meme! Try again. 😅';
    }
}

function translateText(text, toLang) {
    return `Translated to ${toLang}: ${text}`; // Placeholder
}

async function getWeather(city) {
    try {
        return `Weather in ${city}: Sunny, 25°C ☀️`; // Placeholder
    } catch (error) {
        console.error('Error fetching weather:', error);
        return 'Couldn’t get weather. Try again! 🌦️';
    }
}

function generateQR(text) {
    return `QR code for ${text}: [Imagine a cool QR here] 📷`; // Placeholder
}

async function shortenURL(url) {
    try {
        return `Shortened: ${url.slice(0, 20)}... 🔗`; // Placeholder
    } catch (error) {
        console.error('Error shortening URL:', error);
        return 'Couldn’t shorten URL. Try again! 🔗';
    }
}

// === COMMANDS ===
async function handleCommand(sock, msg, ownerJid) {
    const text = (msg.message?.conversation || msg.message?.extendedTextMessage?.text || '').toLowerCase();
    if (!text.startsWith(commandPrefix)) return;
    
    const sender = msg.key.remoteJid;
    console.log(`Command received from ${sender} (Owner: ${ownerJid})`);
    
    if (settings.privacyMode === 'private' && sender !== ownerJid) {
        console.log(`Blocked command from ${sender} (private mode)`);
        await sock.sendMessage(sender, { text: `*OOPS* 🔒 ${botName} is in private mode. Only the owner (233538911895) can use commands.` });
        return;
    }
    
    const args = text.slice(commandPrefix.length).split(' ');
    const command = args[0];
    const param = args[1];
    const params = args.slice(1).join(' ');

    // Menu
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
                        `🔧 *${commandPrefix}WEATHER <city>*: Weather check\n` +
                        `🔧 *${commandPrefix}QR <text>*: QR creation\n` +
                        `🔧 *${commandPrefix}SHORTEN <url>*: Link trim\n\n` +
                        `*👥 GROUP TOOLS*\n` +
                        `🤝 *${commandPrefix}GROUPINFO*: Group stats\n` +
                        `🤝 *${commandPrefix}KICK @user*: Boot out\n` +
                        `🤝 *${commandPrefix}PROMOTE @user*: Elevate role\n` +
                        `🤝 *${commandPrefix}TAGALL*: Call everyone\n\n` +
                        `*⚙️ STATUS*\n` +
                        `- *AUTO-VIEW*: ${settings.autoViewStatus ? '✅ ON' : '❌ OFF'}\n` +
                        `- *PRIVACY*: ${settings.privacyMode.toUpperCase() === 'PRIVATE' ? '🔒 PRIVATE' : '🌍 PUBLIC'}\n\n` +
                        `_Dive deeper with *${commandPrefix}HELP*!_ 😄`;
        if (fs.existsSync(welcomeImagePath)) {
            const imageBuffer = fs.readFileSync(welcomeImagePath);
            await sock.sendMessage(sender, {
                image: imageBuffer,
                caption: menuText
            });
            console.log(`Sent menu image to ${sender}`);
        } else {
            console.error('Menu image not found at:', welcomeImagePath);
            await sock.sendMessage(sender, { text: menuText });
        }
    }
    // Help
    else if (command === 'help') {
        const helpText = `*🤖 ${botName.toUpperCase()} USER VIBES 🤖*\n` +
                        `_From ${companyName}, owned and created by Sey_ 🎉\n` +
                        `_Check me out: https://github.com/kairox-sey_\n\n` +
                        `*MASTER ${botName.toUpperCase()}*\n` +
                        `- Use *"${commandPrefix}"* prefix\n` +
                        `- *${commandPrefix}MENU*: All commands\n` +
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
                        `- *${commandPrefix}TRANSLATE*: Language swap\n` +
                        `- *${commandPrefix}WEATHER*: Weather check\n` +
                        `- *${commandPrefix}QR*: QR maker\n` +
                        `- *${commandPrefix}SHORTEN*: Short links\n` +
                        `- *${commandPrefix}GROUPINFO/KICK/PROMOTE/TAGALL*: Group tools\n\n` +
                        `*HEADS UP* ⚠️\n` +
                        `- Mode: ${settings.privacyMode.toUpperCase()}\n` +
                        `- View once needs consent.\n` +
                        `_Rock on with ${botName}!_ 😎`;
        await sock.sendMessage(sender, { text: helpText });
    }
    // View Once
    else if (command === 'vv') {
        const content = msg.message;
        const from = msg.key.remoteJid;

        const quoted = content?.extendedTextMessage?.contextInfo?.quotedMessage;
        const quotedKey = content?.extendedTextMessage?.contextInfo?.stanzaId;
        const quotedParticipant = content?.extendedTextMessage?.contextInfo?.participant;

        if (!quoted || !quotedKey || !quotedParticipant) {
          await sock.sendMessage(from, {
            text: '⚠️ Please reply to a view-once message with `.vv`.',
          });
          return;
        }

        // Check if it's a view-once message
        const viewOnceMessage = quoted?.viewOnceMessageV2?.message;
        if (!viewOnceMessage) {
          await sock.sendMessage(from, {
            text: '❌ That is not a view-once message.',
          });
          return;
        }

        // Use full key to re-fetch if needed
        const quotedFullMessage = {
          key: {
            remoteJid: from,
            id: quotedKey,
            fromMe: false,
            participant: quotedParticipant,
          },
          message: quoted,
        };

        const mediaType = viewOnceMessage?.imageMessage
          ? 'image'
          : viewOnceMessage?.videoMessage
          ? 'video'
          : null;

        if (!mediaType) {
          await sock.sendMessage(from, {
            text: '❌ Unsupported view-once media type.',
          });
          return;
        }

        try {
          const buffer = await downloadMediaMessage(
            quotedFullMessage,
            'buffer',
            {},
            { reuploadRequest: sock.updateMediaMessage }
          );

          await sock.sendMessage(from, {
            [mediaType]: buffer,
            caption: '📥 Recovered view-once media',
          });
        } catch (err) {
          console.error('Error:', err);
          await sock.sendMessage(from, {
            text: '❌ Failed to decrypt the view-once message.',
          });
        }
    }
    // Like Status (Automatic with new WhatsApp feature)
    else if (command === 'like') {
        await sock.sendMessage(sender, { text: `*OOPS* ❌ Use auto-view to like statuses automatically. Enable with *.AUTOVIEWON*` });
    }
    // Auto-View
    else if (command === 'autoviewon') {
        settings.autoViewStatus = true;
        await sock.sendMessage(sender, { text: `*AUTO-VIEW ON* ✅ Statuses will be viewed and liked automatically.` });
    } else if (command === 'autoviewoff') {
        settings.autoViewStatus = false;
        await sock.sendMessage(sender, { text: `*AUTO-VIEW OFF* ❌ Statuses won’t be viewed or liked automatically.` });
    }
    // Privacy
    else if (command === 'privacy' && param) {
        if (param === 'private') {
            settings.privacyMode = 'private';
            await sock.sendMessage(sender, { text: `*PRIVACY SET* 🔒 ${botName} is now private. Only the owner (233538911895) can use commands.` });
        } else if (param === 'public') {
            settings.privacyMode = 'public';
            await sock.sendMessage(sender, { text: `*PRIVACY SET* 🌍 ${botName} is now public. Anyone can use commands.` });
        } else {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}PRIVACY [PRIVATE|PUBLIC]*` });
        }
    }
    // Quote
    else if (command === 'quote') {
        await sock.sendMessage(sender, { text: `*QUOTE* 🌟\n${getRandom(quotes)}` });
    }
    // Meme
    else if (command === 'meme') {
        const meme = await getMeme();
        await sock.sendMessage(sender, { text: `*MEME* 😂\n${meme}` });
    }
    // Joke
    else if (command === 'joke') {
        await sock.sendMessage(sender, { text: `*JOKE* 😄\n${getRandom(jokes)}` });
    }
    // Trivia
    else if (command === 'trivia') {
        const trivia = "What’s the capital of France?\n1. Paris\n2. Florida\n3. Narnia\nReply with number!";
        await sock.sendMessage(sender, { text: `*TRIVIA* 🧠\n${trivia}` });
    }
    // Poll
    else if (command === 'poll' && params) {
        const [question, options] = params.split('?');
        if (!question || !options) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}POLL Question? Opt1, Opt2, ...*` });
            return;
        }
        const opts = options.split(',').map(o => o.trim()).slice(0, 5);
        if (opts.length < 2) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Need at least 2 options!` });
            return;
        }
        const pollText = `*POLL* 📊 ${question.trim()}\n` + opts.map((o, i) => `${i + 1}. ${o}`).join('\n') + '\nReply with number!';
        await sock.sendMessage(sender, { text: pollText });
    }
    // Dice
    else if (command === 'dice') {
        const result = Math.floor(Math.random() * 6) + 1;
        await sock.sendMessage(sender, { text: `*DICE* 🎲 You rolled a ${result}!` });
    }
    // Coin
    else if (command === 'coin') {
        const result = Math.random() < 0.5 ? 'Heads' : 'Tails';
        await sock.sendMessage(sender, { text: `*COIN* 🪙 It’s ${result}!` });
    }
    // Rock-Paper-Scissors
    else if (command === 'rps' && param) {
        const choices = ['rock', 'paper', 'scissors'];
        if (!choices.includes(param)) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}RPS rock/paper/scissors*` });
            return;
        }
        const botChoice = getRandom(choices);
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
    // Fact
    else if (command === 'fact') {
        await sock.sendMessage(sender, { text: `*FACT* 📚\n${getRandom(facts)}` });
    }
    // 8-Ball
    else if (command === '8ball' && params) {
        await sock.sendMessage(sender, { text: `*8BALL* 🎱\n${params}\n${getRandom(eightBallResponses)}` });
    }
    // Horoscope
    else if (command === 'horoscope' && param) {
        const sign = param.toLowerCase();
        const horoscope = horoscopes[sign] || 'Invalid sign! Try leo. 🌟';
        await sock.sendMessage(sender, { text: `*HOROSCOPE* 🌌\n${sign.toUpperCase()}: ${horoscope}` });
    }
    // Nickname
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
    // Reminder
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
    // Translate
    else if (command === 'translate' && params) {
        const match = params.match(/(.+?)\s+to\s+(\w+)/i);
        if (!match) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}TRANSLATE text to lang*` });
            return;
        }
        const [, textToTranslate, lang] = match;
        const translated = translateText(textToTranslate, lang);
        await sock.sendMessage(sender, { text: `*TRANSLATE* 🌐\n${translated}` });
    }
    // Weather
    else if (command === 'weather' && params) {
        const weather = await getWeather(params);
        await sock.sendMessage(sender, { text: `*WEATHER* 🌞\n${weather}` });
    }
    // QR Code
    else if (command === 'qr' && params) {
        const qr = generateQR(params);
        await sock.sendMessage(sender, { text: `*QR CODE* 📷\n${qr}` });
    }
    // Shorten URL
    else if (command === 'shorten' && params) {
        const shortUrl = await shortenURL(params);
        await sock.sendMessage(sender, { text: `*SHORTEN* 🔗\n${shortUrl}` });
    }
    // Group Info
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
    // Kick
    else if (command === 'kick' && params && msg.key.remoteJid.endsWith('@g.us')) {
        if (!params.startsWith('@')) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}KICK @user*` });
            return;
        }
        try {
            const target = params.slice(1) + '@s.whatsapp.net';
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'remove');
            await sock.sendMessage(sender, { text: `*KICK* 👟\n@${params.slice(1)} kicked!` });
        } catch (error) {
            console.error('Error kicking user:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to kick user. Am I admin?` });
        }
    }
    // Promote
    else if (command === 'promote' && params && msg.key.remoteJid.endsWith('@g.us')) {
        if (!params.startsWith('@')) {
            await sock.sendMessage(sender, { text: `*OOPS* ❌ Use *${commandPrefix}PROMOTE @user*` });
            return;
        }
        try {
            const target = params.slice(1) + '@s.whatsapp.net';
            await sock.groupParticipantsUpdate(msg.key.remoteJid, [target], 'promote');
            await sock.sendMessage(sender, { text: `*PROMOTE* 🌟\n@${params.slice(1)} promoted to admin!` });
        } catch (error) {
            console.error('Error promoting user:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to promote user. Am I admin?` });
        }
    }
    // Tag All
    else if (command === 'tagall' && msg.key.remoteJid.endsWith('@g.us')) {
        try {
            const groupMetadata = await sock.groupMetadata(msg.key.remoteJid);
            const participants = groupMetadata.participants.map(p => p.id);
            const mentionsText = participants.map(id => `@${id.split('@')[0]}`).join(' ');
            await sock.sendMessage(msg.key.remoteJid, {
                text: `*GROUP TAG* 📢\n${mentionsText}`,
                mentions: participants
            });
            console.log(`Tagged all in group ${msg.key.remoteJid}`);
        } catch (error) {
            console.error('Error tagging group members:', error);
            await sock.sendMessage(sender, { text: `*ERROR* ❌ Failed to tag group members.` });
        }
    }
}

// === BOT LOGIC ===
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        auth: state,
        version,
        printQRInTerminal: false,
        getMessage: async (key) => {
            return { conversation: "Fallback message" };
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            console.log(`Scan this QR code with your WhatsApp app (Settings > Linked Devices > Link a Device):`);
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('Connection closed, reconnecting...');
                startBot();
            } else {
                console.log('Connection closed. You are logged out. Delete "auth_info" folder and restart.');
            }
        } else if (connection === 'open') {
            console.log(`✅ ${botName} is connected to WhatsApp!`);
            console.log(`Owner: ${ownerJid}`);
            try {
                // Send welcome image and menu
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
                                    `🔧 *${commandPrefix}WEATHER <city>*: Weather check\n` +
                                    `🔧 *${commandPrefix}QR <text>*: QR creation\n` +
                                    `🔧 *${commandPrefix}SHORTEN <url>*: Link trim\n\n` +
                                    `*👥 GROUP TOOLS*\n` +
                                    `🤝 *${commandPrefix}GROUPINFO*: Group stats\n` +
                                    `🤝 *${commandPrefix}KICK @user*: Boot out\n` +
                                    `🤝 *${commandPrefix}PROMOTE @user*: Elevate role\n` +
                                    `🤝 *${commandPrefix}TAGALL*: Call everyone\n\n` +
                                    `*⚙️ STATUS*\n` +
                                    `- *AUTO-VIEW*: ${settings.autoViewStatus ? '✅ ON' : '❌ OFF'}\n` +
                                    `- *PRIVACY*: ${settings.privacyMode.toUpperCase() === 'PRIVATE' ? '🔒 PRIVATE' : '🌍 PUBLIC'}\n\n` +
                                    `_Drop a *${commandPrefix}HELP* for more!_ 😄`;
                    await sock.sendMessage(ownerJid, {
                        image: imageBuffer,
                        caption: menuText
                    });
                    console.log(`Sent welcome image and menu to ${ownerJid}`);
                } else {
                    console.error('Welcome image not found at:', welcomeImagePath);
                    await sock.sendMessage(ownerJid, { text: `*HEY, ${botName.toUpperCase()} IS LIVE!* 😎\n\nImage not found. Check menu with *.MENU*` });
                }
            } catch (error) {
                console.error('Error sending welcome message:', error);
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
                    // Automatically like the status using the new WhatsApp reaction feature
                    await sock.sendMessage(msg.key.remoteJid, {
                        react: {
                            key: msg.key,
                            text: '❤️' // WhatsApp's like reaction
                        }
                    });
                    console.log(`Liked status from ${msg.key.participant}`);
                } catch (error) {
                    console.error('Error viewing or liking status:', error);
                }
            }
            if (msg.message?.conversation || msg.message?.extendedTextMessage?.text) {
                await handleCommand(sock, msg, ownerJid);
            }
        }
    });

    return sock;
}

// === START BOT ===
startBot().catch(error => {
    console.error(`Failed to start ${botName}:`, error);
});