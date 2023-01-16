const os = require("node:os");

module.exports = {
	packagerConfig: {
		name: "TheatreX",
		executableName: "TheatreX",
		icon: "./src/icons/icon",
	},
	makers: [
		{
			name: "@electron-forge/maker-squirrel",
			config: {
				setupIcon: "./src/icons/icon.ico",
			},
		},
		{
			name: "@electron-forge/maker-zip",
			platforms: ["darwin"],
		},
		{
			name: "@electron-forge/maker-dmg",
			config: {
				icon: "./src/icons/icon.icns",
			},
		},
		{
			name: "@electron-forge/maker-deb",
			config: {
				options: {
					icon: "./src/icons/icon.png",
				},
			},
		},
	],
	publishers: [
		{
			name: "@electron-forge/publisher-github",
			config: {
				repository: {
					owner: "JacobLinCool",
					name: "TheatreX-Desktop",
				},
				draft: true,
				prerelease: false,
			},
		},
	],
};
