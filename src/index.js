const { app, BrowserWindow, Notification } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");

if (require("electron-squirrel-startup")) {
	app.quit();
}

require("fix-path")();

const location = require.resolve("theatrex/dist/index.mjs");
console.log({ location, env: process.env });

const server = spawn(app.getPath("exe"), [location], {
	stdio: "pipe",
	env: {
		...process.env,
		ELECTRON_RUN_AS_NODE: 1,
	},
	shell: true,
});

server.on("error", (err) => {
	new Notification({ title: "Error", body: err.message }).show();
});

server.once("exit", (code) => {
	console.log("Server exited with code", code);
	if (code !== 0) {
		new Notification({
			title: "Unexpected Exit!",
			body: `Server exited with code ${code}`,
		}).show();
	}
	app.quit();
});

const done = new Promise((resolve) => {
	const handler = (message) => {
		if (message.includes("Listening")) {
			server.stdout.off("data", handler);
			server.stderr.off("data", handler);
			server.stdout.pipe(process.stdout);
			server.stderr.pipe(process.stderr);
			resolve();
		}
	};
	server.stdout.on("data", handler);
	server.stderr.on("data", handler);
});

const open = async () => {
	const window = new BrowserWindow({
		width: 1280,
		height: 800,
		autoHideMenuBar: true,
		backgroundColor: "#2e2d2f",
		frame: process.platform !== "win32",
		icon: path.join(__dirname, "icons/icon.png"),
	});
	await window.loadFile(path.join(__dirname, "launch.html"));
	window.center();

	await done;
	await window.loadURL("http://localhost:3000");

	window.webContents.session.on("will-download", (evt, item) => {
		const name = item.getFilename();
		if (path.extname(name) === ".png") {
			item.setSavePath(path.join(app.getPath("downloads"), name));

			item.on("done", (evt, state) => {
				if (state === "completed") {
					new Notification({
						title: "Captured!",
						body: item.getFilename(),
					}).show();
				}
			});
		}
	});
};

app.on("ready", open)
	.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			open();
		}
	})
	.on("window-all-closed", () => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	})
	.on("before-quit", (evt) => {
		if (server.exitCode === null) {
			server.kill("SIGINT");
			evt.preventDefault();
		}
	});

process.on("SIGINT", app.quit);
