// animal scan by Aquarock

const cameraOffset = vec2(0, -0.5);
const scoreTimerDisplay = document.getElementById("scoreTimerDisplay");
const backgroundColor = hsl(0, 0, 0.2);
const grassGreen = rgb(0.34, 0.49, 0.27);
const dirtBrown = rgb(0.61, 0.46, 0.33);
const spaceBlue = rgb(0.32, 0.61, 0.6);
const levelSize = vec2(5, 5);
const center = vec2(levelSize.x / 2, levelSize.y / 2);
const animalTurnRange = 1;
const animalPulseLength = 2;
const animalSpeed = 4; // distance animals travel in one pulse
const animalSize = 0.25; // distance animals travel in one pulse
const animalResolution = 72;
const treeResolution = 618;
const newAnimalCount = 6; // amount of animals that appear each pulse
let animals = []; // animals currently on the screen
let scanned = []; // animals currently being scanned
let scannedSpecies = new Set(); // animals that will appear hightlighted in the tray
let ufoPos = center;
let animalPulse = null;
let scoreTimer = null;
const startGame = () => {
	animalPulse = new Timer(animalPulseLength / 2);
	scoreTimer = new Timer(0);
	scannedSpecies = new Set();
};
const endGame = () => {
	animalPulse = null;
	animals = [];
};
const sourceImages = ["animals.png", "ufo.png", "tree2.png"];
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
// biome-ignore format: zzfx sounds
const sfx = {
	"scan": new Sound([1,,994,.01,.03,.02,,3.3,-1,-74,249,.04,,,,,,.71,.03,,-1248]),
	"newSpecies": new Sound([.2,,531,.08,.29,.36,,.2,,,472,.06,.09,,,,,.8,.16,,846]),
	"buttonPress": new Sound([.5,,635,.01,.04,.02,3,4.3,,,,,.05,,,,,.61,.01,,-1312])
}
const isHighlighted = (pos) => level()[pos.x + pos.y * levelSize.x];
const toLevelPos = (pos) => vec2(Math.floor(pos.x), Math.floor(pos.y));
const mouseOffLevel = () => offLevel(mousePos);
// return animals which are on the currently highlighted tile
const scan = (animals) =>
	animals.filter((a) => isHighlighted(toLevelPos(a.pos)));
const offLevel = (pos) =>
	pos.x < 0 || pos.y < 0 || pos.x > levelSize.x || pos.y > levelSize.y;
const level = () => {
	l = emptyLevel();
	if (mouseOffLevel()) return l;
	l[toLevelPos(mousePos).x + toLevelPos(mousePos).y * levelSize.x] = true;
	return l;
};
// a level where none of the tiles are highlighted
const emptyLevel = (newLevel = []) => {
	for (x = levelSize.x; x--; )
		for (y = levelSize.y; y--; ) newLevel[x + y * levelSize.x] = false;
	return newLevel;
};
// renders a tile, with a border if the mouse is over it
const drawLevelRect = (pos) => {
	drawPos = pos.add(vec2(0.5));
	if (mouseOffLevel() || animalPulse == null)
		drawRect(drawPos, vec2(1), grassGreen);
	else if (isHighlighted(pos)) drawRect(drawPos, vec2(0.95), grassGreen);
	else drawRect(drawPos, vec2(1), grassGreen);
};
const updateScoreTimerDisplay = () => {
	minute = Math.floor(scoreTimer.get() / 60);
	second = Math.floor(scoreTimer.get() % 60);
	scoreTimerDisplay.innerText = `${minute < 10 ? "0" : ""}${minute}:${second < 10 ? "0" : ""}${second}`;
};
const drawTree = (pos) =>
	drawTile(
		pos.add(vec2(0, 0.5)),
		vec2(1.5),
		tile(vec2(0), vec2(treeResolution), 2),
	);
const plantTrees = (pos, row, trees = [], spread = vec2(0.75, 1.25)) =>
	row
		? plantTrees(
				pos,
				row - 1,
				trees.concat(
					[
						rand(-spread.x, -0.25), // left side
						rand(levelSize.x, levelSize.x + spread.x + 0.25), // right side
					].map((randX) =>
						vec2(randX + pos.x, spread.y * row + pos.y + rand(-0.25, 0.25)),
					),
				),
			)
		: trees;

// % species %
const isScanned = (species) => scannedSpecies.has(species);
const getSpecies = (animal) =>
	animalSpecies[Math.floor(animal.tileInfo.pos.x / animalResolution)];
const updateScannedSpecies = (animals) => {
	const oldSize = scannedSpecies.size;
	for (species of animals.map((a) => getSpecies(a)))
		scannedSpecies.add(species);
	if (scannedSpecies.size - oldSize > 0) sfx.newSpecies.play();
};
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

// % animals %
const animalTile = (animalIndex = 0) =>
	tile(vec2(animalResolution * animalIndex, 0), animalResolution, 0);
const addAnimals = (animals, amount) =>
	amount ? addAnimals(withNewAnimal(animals), amount - 1) : animals;
const animal = (pos, angleSpread = 0.5) =>
	new EngineObject(
		pos,
		vec2(0),
		animalTile(randInt(0, animalSpecies.length)),
		rand(Math.PI * (0.5 - angleSpread / 2), Math.PI * (0.5 + angleSpread / 2)) *
			(center.x > pos.x ? 1 : -1),
	);
const withNewAnimal = (animals, pos) => [
	...animals,
	animal(
		pos
			? pos
			: vec2(
					Math.random() < 0.5 ? -0.1 : levelSize.x + 0.1,
					Math.floor(Math.random() * levelSize.y) + 0.5,
				),
	),
];

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

// adds and updates animals
const pulseAnimals = (animals) =>
	addAnimals(animals, newAnimalCount)
		.filter((a) => !offLevelAnimals.includes(a))
		.map((a) => turnAnimal(a));

// % game %
function gameInit() {
	canvasFixedSize = vec2(720, 720);
	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
	trees = [
		...plantTrees(vec2(0, rand(-3, -2.5)), 6),
		vec2(center.add(vec2(rand(-2, -1), rand(2, 2.5)))),
		vec2(center.add(vec2(rand(1, 2), rand(2, 2.5)))),
	];
}
function gameUpdate() {
	if (!animalPulse) {
		ufoPos = center.subtract(vec2(0, 1.5)); // paused
		return;
	}
	ufoPos = mousePos;
	if (scannedSpecies.size === animalSpecies.length) gameOver();

	if (animalPulse?.elapsed()) {
		offLevelAnimals = animals.filter((a) => offLevel(a.pos));
		animals = pulseAnimals(animals);
		animals.filter((a) => offLevel(a.pos)).map((a) => a.destroy());
		animalPulse.set(animalPulseLength);
	} else animals = animals.map((a) => moveAnimal(a));

	if (mouseWasPressed(0) && !mouseOffLevel() && animals.length > 0) {
		scanned = scan(animals);
		if (scanned.length > 0) updateScannedSpecies(scanned);
		else scanned = [-1]; // no animals found
	}

	updateScoreTimerDisplay();
}
function gameUpdatePost() {}
function gameRender() {
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));
	drawRect(center, vec2(10), grassGreen);
	drawRect(center, vec2(5.05), dirtBrown);
	drawRect(center, vec2(5), spaceBlue); // tile highlighting

	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; ) drawLevelRect(pos);
	animals.map((a) => drawTile(a.pos, vec2(0.5), a.tileInfo));
	drawTile(ufoPos, vec2(0.5), tile(vec2(0), animalResolution, 1)); // ufo is the same resolution as the animals
	if (scanned.length === 0) return;

	// player scanned the level
	drawPos = toLevelPos(mousePos).add(vec2(0.5));
	drawRect(drawPos, vec2(1), spaceBlue); // flash effect
	if (scanned[0] === -1) sfx.scan.play(vec2(2.5), 0.5);
	else sfx.scan.play(); // louder if animal has been scanned
	scanned = [];
}
function gameRenderPost() {
	drawRect(vec2(center.x, -1.1), vec2(4.02, 1.62), rgb(0, 0, 0)); // tray border
	drawRect(vec2(center.x, -1.1), vec2(4, 1.6), dirtBrown); // tray
	animalSpecies.map((a) => drawTraySpecies(a));
	trees.map((v) => drawTree(v));
}
setCanvasPixelated(false);
// biome-ignore format: engineInit
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, sourceImages);
