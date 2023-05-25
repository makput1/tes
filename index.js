const {
  default: makeWASocket,
  useSingleFileAuthState,
  makeInMemoryStore,
  DisconnectReason,
} = require("@adiwajshing/baileys");
const pino = require("pino");
const { Boom, boomify } = require("@hapi/boom");

let session = "session.json";

const startBot = async () => {
  const store = makeInMemoryStore({
    logger: pino().child({ level: "silent", stream: "store" }),
  });
  const { state, saveCreds } = await useSingleFileAuthState(session);

  const bot = makeWASocket({
    logger: pino({ level: "silent" }),
    printQRInTerminal: true,
    browser: ["Putra Multi Device", "Safari", "1.0.0"],
    auth: state,
  });
  bot.ev.on("creds.update", saveCreds);
  bot.ev.on("connection.update", async (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
      if (reason === DisconnectReason.badSession) {
        console.log("Bad session file, please delete session and scan again");
        bot.logout();
      } else if (reason === DisconnectReason.connectionClosed) {
        console.log("Connection closed, reconnecting");
        startBot();
      } else if (reason === DisconnectReason.connectionLost) {
        console.log("Connection lost from server, reconnecting..");
        startBot();
      } else if (reason === DisconnectReason.connectionReplaced) {
        console.log(
          "Connection replaced, another new session opened, please close Current session on first"
        );
        bot.logout();
      } else if (reason === DisconnectReason.restartRequired) {
        console.log("Restart required, Restarting...");
        startBot();
      } else if (reason === DisconnectReason.timedOut) {
        console.log("Connection timedOut, reconnecting....");
        startBot();
      } else bot.end("Unknown DisconnectReason: " + reason + "|" + connection);
    }
    if (connection === "open") {
      console.log("Connect, welcome owner");
      console.log("Connected to = " + JSON.stringify(bot.user, null, 2));
    }
  });
};

startBot();
