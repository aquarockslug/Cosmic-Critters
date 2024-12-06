// animal scan by Aquarock

setCanvasPixelated(false);
const cameraOffset = vec2(0, -0.5);
const backgroundColor = hsl(0, 0, 0.2);

let levelSize;
const green = rgb(0, 1, 0);

const tileHighlighted = (pos) => level()[pos.x + pos.y * levelSize.x];

const level = () => {
	// a level where none of the tiles are highlighted
	const emptyLevel = (newLevel = []) => {
		for (x = levelSize.x; x--; )
			for (y = levelSize.y; y--; ) newLevel[x + y * levelSize.x] = false;
		return newLevel;
	};
	if (mouseOffLevel()) return emptyLevel(); // mouse not hovering over level area
	l = emptyLevel();
	l[mouse().x + mouse().y * levelSize.x] = true;
	return l;
};

const mouse = () => vec2(Math.floor(mousePos.x), Math.floor(mousePos.y));
const mouseOffLevel = () => {
	return (
		mousePos.x < 0 ||
		mousePos.y < 0 ||
		mousePos.x > levelSize.x ||
		mousePos.y > levelSize.y
	);
};

function gameInit() {
	canvasFixedSize = vec2(720, 720);
	mainCanvas.style.background = backgroundColor;

	levelSize = vec2(5, 5);

	// init animal species list and images
	// TODO: create animal object
	animalSpecies = [];
	animalPositions = [vec2(1, 1), vec2(2, 2)];

	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
}
function gameUpdate() {
	// randomly spawn animal

	if (mouseWasPressed(0)) {
		// TODO: use filter function
		for (animalPos of animalPositions) {
			if (tileHighlighted(animalPos)) console.log("hit");
		}
	}

	// if mouse clicked:
	// getActiveAnimals(), returns filtered animal list where (tileHighlighted(animal.levelPos))
}
function gameUpdatePost() {}
function gameRender() {
	// background
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));
	drawRect(vec2(2.5, 2.5), vec2(8), green);
	drawRect(vec2(2.5, 2.5), vec2(5.25), rgb(0, 0, 0));
	drawRect(vec2(2.5, 2.5), vec2(5), rgb(1, 1, 1));

	// renders a tile with a border if the mouse is over it
	renderTile = (drawPos) => {
		if (mouseOffLevel()) drawRect(drawPos, vec2(1), green);
		else if (tileHighlighted(pos)) drawRect(drawPos, vec2(0.95), green);
		else drawRect(drawPos, vec2(1), green);
	};

	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; ) renderTile(pos.add(vec2(0.5)));
}
function gameRenderPost() {}

engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost);
