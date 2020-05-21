// @ts-check

const express = require("express");
const app = express();
const logger = require("morgan");
const internalIp = require("internal-ip");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const axios = require("axios").default;

const PORT = process.env.PORT || 3000;
const HTTP_SERVER = process.env.HTTP_SERVER || "localhost:3001";
const GRPC_SERVER = process.env.GRPC_SERVER || "localhost:3002";

const packageDefinition = protoLoader.loadSync(__dirname + "/echo.proto");
const echo_proto = grpc.loadPackageDefinition(packageDefinition).echo;
const client = new echo_proto.EchoService(
  GRPC_SERVER,
  grpc.credentials.createInsecure()
);

app.use(logger("combined"));

app.get("/", async (req, res) => {
  const ipv4 = await internalIp.v4();
  res.send(`HELLO WORLD! (${ipv4})`);
});

app.get("/http", async (req, res) => {
  const ipv4 = await internalIp.v4();
  try {
    const data = await axios
      .get("http://" + HTTP_SERVER)
      .then((res) => res.data);
    res.send(`${ipv4} -> ${data}`);
  } catch (error) {
    res.status(500).send(`[ERROR] ${error}`);
  }
});

app.get("/grpc", async (req, res) => {
  const ipv4 = await internalIp.v4();
  client.echo({}, (err, response) => {
    if (err) {
      return res.status(500).send(`[ERROR] ${err}`);
    }
    res.send(`${ipv4} -> ${response.message}`);
  });
});

app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
