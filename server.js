// @ts-check

const express = require("express");
const app = express();
const logger = require("morgan");
const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const health = require("grpc-health-check");
const healthMessages = require("grpc-health-check/v1/health_pb");
const ServingStatus = healthMessages.HealthCheckResponse.ServingStatus;
const utility = require("./utility");

const HTTP_PORT = process.env.HTTP_PORT || 3001;
const GRPC_PORT = process.env.GRPC_PORT || 3002;

app.use(logger("combined"));

app.get("/", async (req, res) => {
  res.send(`(HTTP#${HTTP_PORT}) IP Address: ${await utility.ipv4}`);
});

const packageDefinition = protoLoader.loadSync(__dirname + "/echo.proto");
const echo_proto = grpc.loadPackageDefinition(packageDefinition).echo;
const server = new grpc.Server();

server.addService(echo_proto.EchoService.service, {
  echo: async (call, callback) => {
    console.log(JSON.stringify(call));
    callback(null, {
      message: `(gRPC#${GRPC_PORT}) IP Address: ${await utility.ipv4}`,
    });
  },
});

const statusMap = {
  EchoService: ServingStatus.SERVING,
  "": ServingStatus.NOT_SERVING,
};
let healthImpl = new health.Implementation(statusMap);

server.addService(health.service, healthImpl);

server.bind(`0.0.0.0:${GRPC_PORT}`, grpc.ServerCredentials.createInsecure());
server.start();
console.log(`(gRPC) Listening on port ${GRPC_PORT}`);

app.listen(HTTP_PORT, () =>
  console.log(`(HTTP) Listening on port ${HTTP_PORT}`)
);
