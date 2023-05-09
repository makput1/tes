const {
  default: makeWASocket,
  useSingleFileAuthState,
} = require("@adiwajshing/baileys");
const pino = require("pino");
const { state, saveState } = useSingleFileAuthState("session.json");

const startBot = async () => {
  const sock = makeWASocket({
    printQRInTerminal: true,
    auth: state,
    logger: pino({ level: "silent" }),
  });
  sock.ev.on("creds.update", saveState);
};

startBot();
