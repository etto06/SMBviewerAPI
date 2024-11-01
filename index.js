const express = require("express");
const bodyParser = require("body-parser");
const SMB2 = require("smb2"); // Pacchetto per la connessione a Samba
var cors = require("cors");
const app = express();
app.use(bodyParser.json());
app.use(cors());

function createSambaClient({
  serverAddress,
  username,
  password,
  sharePath,
  ntdomain,
}) {
  if (ntdomain) {
    ntdomain = ntdomain.toUpperCase(); // Controlla se ntdomain è definito
  } else {
    ntdomain = "WORKGROUP"; // Assegna un valore di default se è undefined
  }

  return new SMB2({
    share: `\\\\${serverAddress}\\${sharePath}`, // Converte l'indirizzo del server in formato UNC
    username: username,
    password: password,
    domain: ntdomain, // Aggiungi il dominio se necessario
  });
}

// Endpoint per connettersi al server Samba
app.post("/samba/connect", async (req, res) => {
  console.log("connection...");
  const { serverAddress, username, password, sharePath } = req.body;

  try {
    // Crea un client SMB per il server Samba
    const smbClient = createSambaClient({
      serverAddress,
      username,
      password,
      sharePath,
    });

    // Prova a leggere la directory di root del percorso condiviso
    smbClient.readdir("", (err, files) => {
      if (err) {
        console.error("Errore nella connessione a Samba:", err);
        return res
          .status(500)
          .json({ error: "Errore nella connessione a Samba." });
      }
      console.log("File trovati:", files);
      res.json({ message: "Connessione riuscita a Samba.", files });
    });
  } catch (error) {
    console.error("Errore:", error);
    res.status(500).json({ error: "Connessione fallita a Samba." });
  }
});

// Avvia il server
app.listen(3000, () => {
  console.log("Server in esecuzione su http://localhost:3000");
});
