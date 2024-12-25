// animal scan by Aquarock

const cameraOffset = vec2(0, -0.5);
const scoreTimerDisplay = document.getElementById("scoreTimerDisplay");
const backgroundColor = hsl(0, 0, 0.2);
const grassGreen = rgb(0.34, 0.49, 0.27);
const dirtBrown = rgb(0.61, 0.46, 0.33);
const spaceBlue = rgb(0.32, 0.61, 0.6);
const levelSize = vec2(9);
const center = vec2(levelSize.x / 2, levelSize.y / 2);

const animalSpeed = 4; // distance animals travel in one pulse
const animalSize = 0.7;
const animalTurnRange = 1.5;
const animalPulseLength = 2.5;
const animalResolution = 72;
const newAnimalCount = 10; // amount of animals that appear each pulse
const treeResolution = 618;
const treeScale = 2.5;

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
const sfx = { // biome-ignore lint:
	"scan": new Sound([1,,994,.01,.03,.02,,3.3,-1,-74,249,.04,,,,,,.71,.03,,-1248]), // biome-ignore lint:
	"newSpecies": new Sound([.2,,531,.08,.29,.36,,.2,,,472,.06,.09,,,,,.8,.16,,846]),// biome-ignore lint:
	"buttonPress": new Sound([.5,,635,.01,.04,.02,3,4.3,,,,,.05,,,,,.61,.01,,-1312])
}

function gameInit() {
	canvasFixedSize = vec2(690);
	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
	const topTree = (x) => vec2(x, rand(levelSize.y / 2, levelSize.y / 2 + 0.5));
	const botTree = (x) =>
		vec2(x, rand(levelSize.y * -0.5 - 0.5, levelSize.y * -0.5 - 1.5));
	trees = [
		vec2(center.add(topTree(rand(-levelSize.x / 2, -2)))), // trees at the top of clearing
		vec2(center.add(topTree(rand(-1.5, -1)))),
		vec2(center.add(topTree(rand(1, 1.5)))),
		vec2(center.add(topTree(rand(2.5, levelSize.x / 2)))),
		vec2(center.add(botTree(rand(-levelSize.x / 2, -4)))), // trees at the bottom of the clearing
		vec2(center.add(botTree(rand(4, levelSize.x / 2)))),
		...plantTrees(vec2(0, rand(-3, -2.5)), levelSize.y + 1),
	];
	// WARN broken particles
	// biome-ignore format: particle emitter
	// ufoParticles = new ParticleEmitter(center, 0, 0, 0, 100, 0, tile(0, 16), new Color(0.573, 0.827, 0.961, 1), new Color(0.329, 0.604, 0.612, 1), new Color(0.329, 0.604, 0.612, 0), new Color(0.329, 0.612, 0.604, 0), 0.1, 0.1, 1, 0.1, 0.05, 1, 1, 3, 3.14, 0.1, 0.2, 0, 0, 1);
}
function gameUpdate() {
	if (!animalPulse) {
		ufoPos = center.subtract(vec2(0, 1.5)); // paused
		return;
	}
	// ufoParticles.pos = mousePos;
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
	drawRect(center, levelSize.multiply(vec2(2)), grassGreen);
	drawRect(center, levelSize.multiply(vec2(1.025)), dirtBrown);
	drawRect(center, levelSize, spaceBlue); // tile highlighting

	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; ) drawLevelRect(pos);
	animals.map((a) => drawTile(a.pos, vec2(animalSize), a.tileInfo));
	if (scanned.length === 0) return;

	// player scanned the level
	drawPos = toLevelPos(mousePos).add(vec2(0.5));
	drawRect(drawPos, vec2(1), spaceBlue); // flash effect
	if (scanned[0] === -1) sfx.scan.play(vec2(2.5), 0.25);
	else sfx.scan.play(vec2(2.5), 0.5); // louder if animal has been scanned
	scanned = [];
}
function gameRenderPost() {
	// drawRect(ufoPos.add(vec2(0, -0.5)), vec2(0.25));
	drawTile(ufoPos, vec2(1), tile(vec2(0), animalResolution, 1)); // ufo is the same resolution as the animals
	drawRect(
		vec2(center.x, -1.1),
		vec2(levelSize.x - 3 + 0.02, 1.62),
		rgb(0, 0, 0),
	); // tray border
	drawRect(
		vec2(center.x + 0.05, -1.15),
		vec2(levelSize.x - 3 + 0.02, 1.62),
		rgb(0, 0, 0),
	); // tray border 2
	drawRect(vec2(center.x, -1.1), vec2(levelSize.x - 3, 1.6), dirtBrown); // tray
	animalSpecies.map((a) => drawTraySpecies(a));
	trees.map((v) => drawTree(v));
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
	l[toLevelPos(mousePos).x + toLevelPos(mousePos).y * levelSize.x] = true; // mark highlighted tile
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
		vec2(treeScale),
		tile(vec2(0), vec2(treeResolution), 2),
	);
const plantTrees = (pos, row, trees = [], spread = vec2(2, 1.5)) =>
	row
		? plantTrees(
				pos,
				row - 1,
				trees.concat(
					[
						rand(-spread.x - 0.25, -0.25), // left side
						rand(levelSize.x + 0.25, levelSize.x + spread.x + 0.25), // right side
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
const drawTraySpecies = (species, spread = 0.6) => {
	trayPos = center.add(vec2(-2.4, -5.35));
	color = isScanned(species) ? rgb(1, 1, 1) : rgb(0, 0, 0);
	index = animalSpecies.indexOf(species);
	params = [vec2(0.5), animalTile(index), color];

	// top row
	if (index > animalSpecies.length / 2 - 1)
		drawTile(
			vec2(
				trayPos.x + spread * (index - animalSpecies.length / 2),
				trayPos.y - spread,
			),
			...params,
		);
	// bottom row
	else drawTile(vec2(trayPos.x + spread * index, trayPos.y), ...params);
};

// % animals %
const animalTile = (animalIndex = 0) =>
	tile(vec2(animalResolution * animalIndex, 0), animalResolution, 0);
const addAnimals = (animals, amount) =>
	amount ? addAnimals(withNewAnimal(animals), amount - 1) : animals;
const animal = (pos, angleSpread = 0.5) =>
	new EngineObject(
		pos,
		vec2(animalSize),
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

setCanvasPixelated(false);
// biome-ignore format: engineInit
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, sourceImages);
