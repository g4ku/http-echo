// @ts-check

const express = require("express");
const app = express();
const logger = require("morgan");
const internalIp = require("internal-ip");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const GRPC_PORT = process.env.GRPC_PORT || 3002;

app.use(logger("combined"));

app.get("/", async (req, res) => {
  const ipv4 = await internalIp.v4();
  res.send(`(HTTP#${HTTP_PORT}) IP Address: ${ipv4}`);
});

const packageDefinition = protoLoader.loadSync(__dirname + "/echo.proto");
const echo_proto = grpc.loadPackageDefinition(packageDefinition).echo;
const server = new grpc.Server();

server.addService(echo_proto.EchoService.service, {
  echo: async (call, callback) => {
    const ipv4 = await internalIp.v4();
    console.log(JSON.stringify(call));
    callback(null, { message: `(gRPC#${GRPC_PORT}) IP Address: ${ipv4}` });
  },
});

server.bind(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure());
server.start();
console.log(`(gRPC) Listening on port ${GRPC_PORT}`);

app.listen(HTTP_PORT, () =>
  console.log(`(HTTP) Listening on port ${HTTP_PORT}`)
);
