if (process.argv.length != 3) {
  console.error("invalid argument");
  process.exit();
}

if (process.argv[2] === "server") {
  require("./server");
} else if (process.argv[2] === "client") {
  require("./client");
} else {
  console.error("invalid argument");
  process.exit();
}
