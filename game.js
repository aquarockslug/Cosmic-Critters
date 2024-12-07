// animal scan by Aquarock

setCanvasPixelated(false);
const cameraOffset = vec2(0, -0.5);
const backgroundColor = hsl(0, 0, 0.2);
const green = rgb(0, 1, 0);

const levelSize = vec2(5, 5);
const center = vec2(levelSize.x / 2, levelSize.y / 2);
const animals = [];

// % level %
const tileHighlighted = (pos) => level()[pos.x + pos.y * levelSize.x];
const level = () => {
	// a level where none of the tiles are highlighted
	const emptyLevel = (newLevel = []) => {
		for (x = levelSize.x; x--; )
			for (y = levelSize.y; y--; ) newLevel[x + y * levelSize.x] = false;
		return newLevel;
	};
	l = emptyLevel();
	if (mouseOffLevel()) return l; // mouse not hovering over level area
	l[levelPos(mousePos).x + levelPos(mousePos).y * levelSize.x] = true;
	return l;
};
const levelPos = (pos) => vec2(Math.floor(pos.x), Math.floor(pos.y));
const mouse = () => levelPos(mousePos);
const mouseOffLevel = () =>
	mousePos.x < 0 ||
	mousePos.y < 0 ||
	mousePos.x > levelSize.x ||
	mousePos.y > levelSize.y;

// % animals %
const newAnimal = (pos) => {
	animalSpecies = ["turtle", "cow", "snake", "worm"];
	species = animalSpecies[Math.floor(Math.random() * animalSpecies.length)];
	// TODO get image according to choosen species
	startPos = () =>
		vec2(
			Math.random() < 0.5 ? -0.5 : levelSize.x + 0.5,
			Math.floor(Math.random() * levelSize.y) + 0.5,
		);
	animals.push(new EngineObject(pos ? pos : startPos(), vec2(0.2, 0.2)));
};

const scan = (scannedAnimals = []) => {
	for (animal of animals) {
		// TODO use a filter function
		pos = vec2(Math.floor(animal.pos.x), Math.floor(animal.pos.y));
		if (tileHighlighted(pos)) scannedAnimals.push(animal);
	}
	return scannedAnimals;
};

// % game %
function gameInit() {
	canvasFixedSize = vec2(720, 720);
	mainCanvas.style.background = backgroundColor;

	newAnimal();
	newAnimal(vec2(2.5, 2.5));

	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
}
function gameUpdate() {
	// randomly spawn animal at interval

	// move all animals in animals list

	if (mouseWasPressed(0)) {
		scannedNow = scan();
		console.log(scannedNow);
		// compare scannedNow to the set of all scanned species
	}

	// if mouse clicked:
	// getActiveAnimals(), returns filtered animal list where (tileHighlighted(animal.levelPos))
}
function gameUpdatePost() {}
function gameRender() {
	// background
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));
	drawRect(center, vec2(8), green);
	drawRect(center, vec2(5.1), rgb(0, 0, 0));
	drawRect(center, vec2(5), rgb(1, 1, 1));

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
