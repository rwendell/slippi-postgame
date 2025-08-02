const { SlippiGame, characters: characterUtils } = require("@slippi/slippi-js");
const chokidar = require("chokidar");
const _ = require("lodash");

const listenPath = process.argv[2];
console.log(`Listening at: ${listenPath}`);

const watcher = chokidar.watch(listenPath, {
	ignored: "!*.slp", // TODO: This doesn't work. Use regex?
	depth: 0,
	persistent: true,
	usePolling: true,
	ignoreInitial: true,
});

const gameByPath = {};
watcher.on("change", (path) => {

	let gameState, settings, stats, frames, latestFrame, gameEnd;
	try {
		let game = _.get(gameByPath, [path, "game"]);
		if (!game) {
			game = new SlippiGame(path, { processOnTheFly: false });
			gameByPath[path] = {
				game: game,
				state: {
					settings: null,
					detectedPunishes: {},
				},
			};
		}

		gameState = _.get(gameByPath, [path, "state"]);
		settings = game.getSettings();
		stats = game.getStats();
		frames = game.getFrames();
		latestFrame = game.getLatestFrame();
		gameEnd = game.getGameEnd();
	} catch (err) {
		console.log(err);
		return;
	}

	if (!gameState.settings && settings) {
		console.log(`[Game Start] New game has started`);
		gameState.settings = settings;
	}


	if (gameEnd) {
		console.clear();

		const report = {};
		report.p1 = new Report(settings.players[0].displayName, stats.actionCounts[0].lCancelCount.fail, stats.actionCounts[0].groundTechCount.fail)
		report.p2 = new Report(settings.players[1].displayName, stats.actionCounts[1].lCancelCount.fail, stats.actionCounts[1].groundTechCount.fail)
		console.table(report);


	}
});

function Report(name, missed_lcancel, missed_tech) {
	this.name = name;
	this.missed_lcancel = missed_lcancel;
	this.missed_tech = missed_tech;
}
