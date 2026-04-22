/**
 * restart-wrapper.js
 *
 * A lightweight, zero-dependency production process manager.
 * Spawns server.js as a child process and automatically restarts it
 * if it exits unexpectedly (crash, uncaught exception, etc.).
 *
 * Usage:  node restart-wrapper.js
 * npm script: "start:prod": "node restart-wrapper.js"
 *
 * Features
 * ─────────
 * • Exponential back-off between restarts (prevents rapid crash-loops)
 * • Gives up after MAX_RESTARTS consecutive failures within RESET_WINDOW ms
 * • Forwards SIGTERM / SIGINT to the child so it can shut down gracefully
 * • All child stdout/stderr are piped to the parent terminal
 */

const { spawn } = require('child_process');
const path = require('path');

const SERVER_SCRIPT = path.join(__dirname, 'server.js');
const MAX_RESTARTS = 10;        // Give up after this many consecutive crashes
const RESET_WINDOW = 60_000;    // Reset crash counter if stable for 60 s
const BASE_DELAY_MS = 1_000;    // First retry waits 1 s
const MAX_DELAY_MS = 30_000;    // Cap back-off at 30 s

let restartCount = 0;
let lastCrashTime = Date.now();
let child = null;

function timestamp() {
  return new Date().toISOString();
}

function startServer() {
  console.log(`\n🚀 [${timestamp()}] Starting server.js (attempt ${restartCount + 1})…`);

  child = spawn(process.execPath, [SERVER_SCRIPT], {
    stdio: 'inherit',           // Pipe child output straight to this terminal
    env: process.env,
  });

  child.on('error', (err) => {
    console.error(`❌ [${timestamp()}] Failed to spawn child process: ${err.message}`);
  });

  child.on('exit', (code, signal) => {
    const now = Date.now();

    // If the child was alive long enough, treat it as a fresh start
    if (now - lastCrashTime > RESET_WINDOW) {
      restartCount = 0;
    }

    lastCrashTime = now;
    restartCount++;

    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      // Intentional shutdown — do not restart
      console.log(`\n🛑 [${timestamp()}] Server stopped (${signal}). Exiting wrapper.`);
      process.exit(0);
    }

    if (code === 0) {
      // Clean exit — do not restart
      console.log(`\n✅ [${timestamp()}] Server exited cleanly (code 0). Exiting wrapper.`);
      process.exit(0);
    }

    console.error(
      `\n💥 [${timestamp()}] Server crashed (exit code: ${code ?? 'none'}, signal: ${signal ?? 'none'}). ` +
      `Restart ${restartCount}/${MAX_RESTARTS}.`
    );

    if (restartCount >= MAX_RESTARTS) {
      console.error(
        `🚨 [${timestamp()}] Reached max restarts (${MAX_RESTARTS}). ` +
        'Check logs and fix the underlying issue before restarting manually.'
      );
      process.exit(1);
    }

    // Exponential back-off: 1s, 2s, 4s, 8s … capped at MAX_DELAY_MS
    const delay = Math.min(BASE_DELAY_MS * 2 ** (restartCount - 1), MAX_DELAY_MS);
    console.log(`⏳ [${timestamp()}] Restarting in ${delay / 1000}s…`);
    setTimeout(startServer, delay);
  });
}

// ─── Forward signals to child so it shuts down gracefully ────────────────────
['SIGTERM', 'SIGINT'].forEach((sig) => {
  process.on(sig, () => {
    console.log(`\n🛑 [${timestamp()}] Wrapper received ${sig}, forwarding to child…`);
    if (child && !child.killed) child.kill(sig);
  });
});

// ─── Boot ────────────────────────────────────────────────────────────────────
startServer();
