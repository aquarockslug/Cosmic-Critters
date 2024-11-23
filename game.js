// black hole puzzle

setCanvasPixelated(false);
const cameraOffset = vec2(0, -0.5);
const backgroundColor = hsl(0, 0, 0.2);

// biome-ignore format:
let level, levelSize, levelFall, fallTimer, dragStartPos, comboCount,
	score, bestScore, sound_goodMove, sound_badMove, sound_fall;

// biome-ignore format:
{
sound_goodMove = new Sound([.4,.2,250,.04,,.04,,,1,,,,,3]);
sound_badMove = new Sound([,,700,,,.07,,,,3.7,,,,3,,,.1]);
sound_fall = new Sound([.2,,1900,,,.01,,1.4,,91,,,,,,,,,,.7]);
}

// tiles
const tileColors = [
	rgb(1, 0, 0),
	rgb(1, 1, 1),
	rgb(1, 1, 0),
	rgb(0, 1, 0),
	rgb(0, 0.6, 1),
	rgb(0.6, 0, 1),
	rgb(0.5, 0.5, 0.5),
];
const tileTypeCount = tileColors.length;

const getTile = (pos) => level[pos.x + pos.y * levelSize.x];
const setTile = (pos, data) => {
	level[pos.x + pos.y * levelSize.x] = data;
};

function gameInit() {
	// setup canvas
	canvasFixedSize = vec2(1920, 1080);
	mainCanvas.style.background = backgroundColor;

	// randomize level
	level = [];
	levelSize = vec2(5, 5);
	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; )
			setTile(pos, randInt(tileColors.length));

	// setup game
	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
}
function gameUpdate() {}
function gameUpdatePost() {}
function gameRender() {
	// draw a black square for the background
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));

	// draw the blocks
	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; ) {
			const data = getTile(pos);
			if (data === -1) continue;
			const drawPos = pos.add(vec2(0.5));

			// draw background
			const color = tileColors[data];
			drawRect(drawPos, vec2(0.95), color);

			// use darker color for icon
			const color2 = color.scale(0.8, 1);
			drawTile(drawPos, vec2(0.5), tile(data, 64), color2);
		}

	// draw a grey square at top to cover up incomming tiles
	drawRect(
		cameraPos.subtract(cameraOffset).add(vec2(0, levelSize.y)),
		levelSize,
		backgroundColor,
	);
}
function gameRenderPost() {}

// Startup LittleJS Engine
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
