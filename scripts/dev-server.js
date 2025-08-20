#!/usr/bin/env node

const { exec } = require("child_process");
const net = require("net");

// Starting port
const DEFAULT_PORT = 3000;
const MAX_PORT = 3100;

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true);
    });

    // Listen on all interfaces to properly detect port usage
    server.listen(port, "0.0.0.0");
  });
}

// Function to find an available port
async function findAvailablePort(startPort = DEFAULT_PORT) {
  for (let port = startPort; port <= MAX_PORT; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  throw new Error(
    `No available ports found between ${startPort} and ${MAX_PORT}`
  );
}

// Main function to start the dev server
async function startDevServer() {
  try {
    const port = await findAvailablePort();

    // Set the PORT environment variable and start Next.js
    const command =
      process.platform === "win32"
        ? `set PORT=${port} && next dev`
        : `PORT=${port} next dev`;

    const child = exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Stderr: ${stderr}`);
        return;
      }
    });

    // Forward output to console
    child.stdout?.on("data", (data) => {
      process.stdout.write(data);
    });

    child.stderr?.on("data", (data) => {
      process.stderr.write(data);
    });

    // Handle process termination
    process.on("SIGINT", () => {
      child.kill("SIGINT");
      process.exit();
    });
  } catch (error) {
    console.error("Failed to start development server:", error.message);
    process.exit(1);
  }
}

// Start the server
startDevServer();
