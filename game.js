// animal scan by Aquarock

setCanvasPixelated(false);
const cameraOffset = vec2(0, -0.5);
const scoreTimerDisplay = document.getElementById("scoreTimerDisplay");
const backgroundColor = hsl(0, 0, 0.2);
const grassGreen = rgb(0.34, 0.49, 0.27);
const dirtBrown = rgb(0.61, 0.46, 0.33);

animalTurnRange = 1;
animalPulseLength = 2;
animalSpeed = 3; // distance animals travel in one pulse
animalSize = 0.25; // distance animals travel in one pulse
animalResolution = 72;
animals = []; // animals currently on the screen
scannedSpecies = new Set(); // animals that will appear hightlighted in the tray

animalPulse = null;
scoreTimer = null;
startGame = () => {
	animalPulse = new Timer(animalPulseLength);
	scoreTimer = new Timer(0);
};

const levelSize = vec2(5, 5);
const center = vec2(levelSize.x / 2, levelSize.y / 2);
const animalSpecies = [
	"orangutan",
	"flamingo",
	"crocodile",
	"snake",
	"camel",
	"gorilla",
	"rhino",
	"tiger",
	"leopard",
	"monkey",
	"elephant",
	"turtle",
	"penguin",
	"koala",
	"giraffe",
	"zebra",
	"kangeroo",
	"llama",
];

const gameOver = () => console.log("game over");
const isHighlighted = (pos) => level()[pos.x + pos.y * levelSize.x];
const toLevelPos = (pos) => vec2(Math.floor(pos.x), Math.floor(pos.y));
// return animals on the currently highlighted tile
const scan = (animals) =>
	animals.filter((a) => isHighlighted(toLevelPos(a.pos)));
const level = () => {
	// a level where none of the tiles are highlighted
	l = emptyLevel();
	if (mouseOffLevel()) return l; // mouse not hovering over level area
	l[toLevelPos(mousePos).x + toLevelPos(mousePos).y * levelSize.x] = true;
	return l;
};
const emptyLevel = (newLevel = []) => {
	for (x = levelSize.x; x--; )
		for (y = levelSize.y; y--; ) newLevel[x + y * levelSize.x] = false;
	return newLevel;
};
const mouseOffLevel = () => offLevel(mousePos);
const offLevel = (pos) =>
	pos.x < 0 || pos.y < 0 || pos.x > levelSize.x || pos.y > levelSize.y;
// renders a tile, with a border if the mouse is over it
const drawLevelRect = (pos) => {
	drawPos = pos.add(vec2(0.5));
	if (mouseOffLevel()) drawRect(drawPos, vec2(1), grassGreen);
	else if (isHighlighted(pos)) drawRect(drawPos, vec2(0.95), grassGreen);
	else drawRect(drawPos, vec2(1), grassGreen);
};

// % species %
const drawTraySpecies = (species, trayPos = vec2(0.9, -0.65)) => {
	color = isScanned(species) ? rgb(1, 1, 1) : rgb(0, 0, 0);
	index = animalSpecies.indexOf(species);
	params = [vec2(0.4), animalTile(index), color];

	// top row
	if (index > animalSpecies.length / 2 - 1)
		drawTile(
			vec2(
				trayPos.x + 0.4 * (index - animalSpecies.length / 2),
				trayPos.y - 0.5,
			),
			...params,
		);
	// bottom row
	else drawTile(vec2(trayPos.x + 0.4 * index, trayPos.y), ...params);
};
const isScanned = (species) => scannedSpecies.has(species);
const getSpecies = (animal) =>
	animalSpecies[Math.floor(animal.tileInfo.pos.x / animalResolution)];
const updateScannedSpecies = (animals) => {
	for (species of animals.map((a) => getSpecies(a)))
		scannedSpecies.add(species);
};

// % animals %
const animalTile = (animalIndex = 0) =>
	tile(vec2(animalResolution * animalIndex, 0), animalResolution, 0);
const newAnimal = (pos, spread = 0.5) =>
	new EngineObject(
		pos,
		vec2(0),
		animalTile(randInt(0, animalSpecies.length)),
		rand(Math.PI * (0.5 - spread / 2), Math.PI * (0.5 + spread / 2)) *
			(center.x > pos.x ? 1 : -1),
	);
const withNewAnimal = (animals, pos) => {
	startPos = () =>
		vec2(
			Math.random() < 0.5 ? -0.1 : levelSize.x + 0.1,
			Math.floor(Math.random() * levelSize.y) + 0.5,
		);
	animals.push(newAnimal(pos ? pos : startPos()));
	return [...animals];
};

// lerp to the target position in front of animal according to the animalPulse
const moveAnimal = (animal) => {
	animal.pos = animal.pos.lerp(
		animal.pos.add(new Vector2().setAngle(animal.angle, animalSpeed * 0.01)),
		percent(animalPulse.get() * -1, 0, animalPulseLength),
	);
	return animal;
};

// for turning animals slightly between pulses
const turnAnimal = (animal) => {
	animal.angle += rand(-animalTurnRange / 2, animalTurnRange / 2);
	return animal;
};

const pulseAnimals = (animals) =>
	withNewAnimal(withNewAnimal(withNewAnimal(animals)))
		.filter((a) => !offLevelAnimals.includes(a))
		.map((a) => turnAnimal(a));

const updateScoreTimerDisplay = () => {
	minute = Math.floor(scoreTimer.get() / 60);
	second = Math.floor(scoreTimer.get() % 60);
	scoreTimerDisplay.innerText = `${minute < 10 ? "0" : ""}${minute}:${second < 10 ? "0" : ""}${second}`;
};

// % game %
function gameInit() {
	canvasFixedSize = vec2(720, 720);
	mainCanvas.style.background = backgroundColor;
	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
}
function gameUpdate() {
	if (animalPulse == null) return; // paused
	if (scannedSpecies.size === animalSpecies.length) gameOver();

	// randomly spawn animal at pulse interval
	if (animalPulse?.elapsed()) {
		offLevelAnimals = animals.filter((a) => offLevel(a.pos));
		animals = pulseAnimals(animals);
		offLevelAnimals.map((a) => a.destroy());
		animalPulse.set(animalPulseLength);
	} else animals = animals.map((a) => moveAnimal(a));

	if (mouseWasPressed(0) && animals.length > 0) {
		scanned = scan(animals);
		if (scanned.length > 0) updateScannedSpecies(scanned);
	}

	updateScoreTimerDisplay();
}
function gameUpdatePost() {}
function gameRender() {
	// background
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));
	drawRect(center, vec2(10), grassGreen);
	drawRect(center, vec2(5.1), dirtBrown);
	drawRect(center, vec2(5), rgb(1, 1, 1)); // highlight tiles
	// TODO jungle leaves covering sides where animals spawn

	// level
	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; ) drawLevelRect(pos);

	for (animal of animals) drawTile(animal.pos, vec2(0.5), animal.tileInfo);
}
function gameRenderPost() {
	drawRect(vec2(center.x, -0.9), vec2(10, 1.6), grassGreen); // ui area
	drawRect(vec2(center.x, -1.1), vec2(4.05, 1.65), rgb(0, 0, 0)); // tray border
	drawRect(vec2(center.x, -1.1), vec2(4, 1.6), dirtBrown); // tray
	for (let i = 0; i < animalSpecies.length; i++)
		drawTraySpecies(animalSpecies[i]);
}
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
	"animals.png",
]);
// startGame();
