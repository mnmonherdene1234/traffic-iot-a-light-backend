import express from "express";
import dgram from "dgram";
import dotenv from "dotenv";

dotenv.config();

let isOn = false;

const serverPort = process.env.PORT ?? 3000;
const udpPort = process.env.UDP_PORT ?? 56;

const udpServer = dgram.createSocket("udp4");

udpServer.on("error", (err) => {
  console.error(`Server error:\n${err.stack}`);
  udpServer.close();
});

udpServer.on("message", (buffer, remoteInfo) => {
  console.log(`${buffer} - ${remoteInfo.address}:${remoteInfo.port}`);

  const sendNumber = isOn ? 1 : 0;

  udpServer.send(
    sendNumber.toString(),
    remoteInfo.port,
    remoteInfo.address,
    (err, bytes) => {
      if (err) {
        console.log(err);
      } else {
        console.log(`sent bytes count: ${bytes}`);
      }
    }
  );
});

udpServer.on("listening", () => {
  const address = udpServer.address();
  console.log(
    `${address.family} UDP server listening on ${address.address}:${address.port}`
  );
});

udpServer.bind(udpPort);

const app = express();

app.use(express.static("public"));

app.get("/light", (req, res) => {
  res.json({
    on: isOn,
  });
});

app.post("/light", (req, res) => {
  isOn = !isOn;

  res.json({
    on: isOn,
  });
});

app.listen(serverPort, () => {
  console.log(`Server is running on port ${serverPort}`);
});
