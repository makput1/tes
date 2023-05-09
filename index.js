const {
  default: makeWASocket,
  DisconnectReason,
  useSingleFileAuthState,
  extractMessageContent,
  makeInMemoryStore,
} = require("@adiwajshing/baileys");
const { Boom } = require("@hapi/boom");
const logg = require("pino");
const { state, saveState } = useSingleFileAuthState("sesi.json");

const startBot = () => {
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: logg({ level: "silent" }),
  });

  sock.ev.on("creds.update", saveState);
  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === "close") {
      const shouldReconnect = (lastDisconnect.error =
        Boom?.output?.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) {
        startBot();
      }
    } else if (connection === "open") {
      console.log("koneksi berhasil");
    }
  });

  sock.ev.on("messages.upsert", async (chatUpdate) => {
    var msg = chatUpdate.messages[0];
    var chat = msg.message.conversation;
    var sender = msg.key.remoteJid;
    const keys = {
      remoteJid: msg.key.remoteJid,
      id: msg.key.id,
    };
    if (chat) {
      sock.readMessages([keys]);
    }
    if (chat === ".start") {
      sock.sendMessage(sender, { text: "selamat datang" });
    }
    //console.log(msg);
  });
};

startBot();
