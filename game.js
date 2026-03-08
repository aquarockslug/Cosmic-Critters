// cosmic critters by Aquarock
//////////////////////////
const cameraOffset = vec2(0, -0.5);
const scoreTimerDisplay = document.getElementById('scoreTimerDisplay');
const grassGreen = rgb(0.34, 0.49, 0.27);
const dirtBrown = rgb(0.61, 0.46, 0.33);
const spaceBlue = (a = 1) => rgb(0.32, 0.61, 0.6, a);
const levelSize = vec2(9);
const center = vec2(levelSize.x / 2, levelSize.y / 2);
const newAnimalCount = 6; // amount of animals that appear each pulse
const rockChance = 15; // percent chance of a tree being a rock instead
const [treeResolution, treeScale] = [618, 2.5];
const [ufoSpeed, ufoScale, ufoTargetAccuracy] = [25, 1.2, 0.1];
const [animalSpeed, animalPulseLength, animalSize, animalTurnRange, animalResolution] = [
	8, 1.25, 0.7, 2, 72,
]; // animalSpeed, distance animals travel in one pulse
let ufoTarget = null;
let animals = []; // animals currently on the screen
let scanned = []; // animals currently being scanned
let scanPos = center;
let ufoPos = center;
let scannedSpecies = new Set(); // animals that will appear hightlighted in the tray
let animalPulse = null;
let scoreTimer = null;
const startGame = () => {
	animalPulse = new Timer(animalPulseLength / 2);
	scoreTimer = new Timer(0);
	scannedSpecies = new Set();
	bgm.stop();
	if (!bgm.isLoading()) bgm.play(center, 3);
};
const endGame = () => {
	animalPulse = null;
	animals = [];
	sfx.victory.play();
};
const sourceImages = ['animals.png', 'ufo.png', 'tree2.png', 'spaceParticle.png', 'rock.png'];
// biome-ignore format: zzfx sounds
const animalSpecies = [
	'orangutan', 'flamingo', 'crocodile', 'snake', 'camel', 'gorilla', 'rhino', 'tiger', 'leopard',
	'monkey', 'elephant', 'turtle', 'penguin', 'koala', 'giraffe', 'zebra', 'kangeroo', 'llama',
];
// biome-ignore format: zzfx sounds
const sfx = { // biome-ignore lint:
	"scan": new Sound([1,,994,.01,.03,.02,,3.3,-1,-74,249,.04,,,,,,.71,.03,,-1248]), // biome-ignore lint:
	"victory": new Sound([.2,,531,.08,.29,.36,,.2,,,472,.06,.09,,,,,.8,.16,,846]),// biome-ignore lint:
	"buttonPress": new Sound([.5,,635,.01,.04,.02,3,4.3,,,,,.05,,,,,.61,.01,,-1312])
}
setCanvasPixelated(false);

function gameInit() {
	canvasFixedSize = vec2(690);
	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
	const topTree = (x) => vec2(x, rand(levelSize.y / 2, levelSize.y / 2 + 0.5));
	const botTree = (x) => vec2(x, rand(levelSize.y * -0.5 - 0.5, levelSize.y * -0.5 - 1.5));
	trees = plantTrees(vec2(0, rand(-2.5, -2.5)), levelSize.y + 1, [
		vec2(center.add(topTree(rand(-levelSize.x / 2, -2)))), // trees at the top of clearing
		vec2(center.add(topTree(rand(-1.5, -1)))),
		vec2(center.add(topTree(rand(1, 1.5)))),
		vec2(center.add(topTree(rand(2.5, levelSize.x / 2)))),
		vec2(center.add(botTree(rand(-levelSize.x / 2, -4)))), // trees at the bottom of the clearing
		vec2(center.add(botTree(rand(4, levelSize.x / 2)))),
	]);
	// randomly turn at least one tree into a rocks
	rocks = trees.filter((t) => Math.random() < rockChance * 0.01);
	if (rocks.length === 0) rocks.push(trees[0]);
	trees = trees.filter((t) => !rocks.includes(t));

	particleTile = tile(0, animalResolution, 3);
	ufoParticleSettings = [0.75, 0.4, 0.55, 0.001, 0.001, 1, 1, 0, 3.14, 1, 0.2, 0, 0, 1];
	// biome-ignore format: particle emitter
	ufoParticles = new ParticleEmitter(center, 0, 0, 0, 10, 3.14, particleTile, new Color(1, 1, 1, 1), new Color(1, 1, 1, 1), new Color(1, 1, 1, 0), new Color(1, 1, 1, 0), ...ufoParticleSettings);
}
function gameUpdate() {
	ufoParticles.pos = ufoPos;
	if (!animalPulse) {
		ufoPos = center.subtract(vec2(0, 1.5)); // paused
		return;
	}
	if (scannedSpecies.size === animalSpecies.length) gameOver();
	if (!mouseOffLevel()) scanPos = mouseLevelPos();
	if (scanPos) ufoTarget = scanPos;
	else ufoTarget = mouseLevelPos() ? mouseLevelPos() : center;
	updateAnimals();
	updateScoreTimerDisplay();

	// check if ufo movement target has been reached
	if (ufoPos.distance(ufoTarget) < ufoTargetAccuracy) {
		// scan if scan target has been reached
		if (scanPos && scanPos.distance(ufoPos) < ufoTargetAccuracy) {
			scanPos = null;
			scanned = scan(animals);
			if (scanned.length > 0) updateScannedSpecies(scanned);
			else scanned = [-1]; // no animals found
		}
		return;
	}

	// move towerds the movement target
	ufoPos = ufoPos.add(
		ufoTarget
			.subtract(ufoPos)
			.normalize()
			.scale(ufoSpeed * 0.005),
	);
}
function gameUpdatePost() {}
function gameRender(pos = vec2()) {
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));
	drawRect(center, levelSize.multiply(vec2(2)), grassGreen);
	drawRect(center, levelSize.multiply(vec2(1.025)), dirtBrown);
	drawRect(center, levelSize, spaceBlue()); // tile highlighting
	for (pos.x = levelSize.x; pos.x--; ) for (pos.y = levelSize.y; pos.y--; ) drawLevelRect(pos);
	rocks.map((v) => drawRock(v));
	animals.map((a) => drawTile(a.pos, vec2(animalSize), a.tileInfo));

	if (scanned.length > 0) {
		// player scanned the level
		drawPos = toLevelPos(ufoPos).add(vec2(0.5));
		drawRect(drawPos, vec2(1), spaceBlue(0.5)); // scan effect
		scanned = [];
	}
}
function gameRenderPost() {
	drawTile(ufoPos, vec2(ufoScale), tile(vec2(0), animalResolution, 1)); // ufo is the same resolution as the animals
	const trayBorderArgs = [vec2(levelSize.x - 3 + 0.02, 1.62), rgb(0, 0, 0)];
	drawRect(vec2(center.x, -1.1), ...trayBorderArgs);
	drawRect(vec2(center.x + 0.05, -1.15), ...trayBorderArgs);
	drawRect(vec2(center.x, -1.1), vec2(levelSize.x - 3, 1.6), dirtBrown);
	animalSpecies.map((a) => drawTraySpecies(a));
	trees.map((v) => drawTree(v));
}

const isOnHighlightedTile = (pos) => level(true, false)[pos.x + pos.y * levelSize.x];
const isUnderUfo = (pos) => level(false, true)[pos.x + pos.y * levelSize.x];
const toLevelPos = (pos) => vec2(Math.floor(pos.x), Math.floor(pos.y));
// ufoPos.distance(toLevelPos(pos).add(0.5)) <= ufoTargetAccuracy;
const mouseLevelPos = () => (mouseOffLevel() ? null : toLevelPos(mousePos).add(vec2(0.5, 0.5)));
const mouseOffLevel = () => offLevel(mousePos);
// return animals which are on the currently highlighted tile
const scan = (animals) => animals.filter((a) => isOnHighlightedTile(toLevelPos(a.pos)));
// const ufoScan = (animals) => animals.filter((a) => isUnderUfo(a.pos));
const offLevel = (pos) => pos.x < 0 || pos.y < 0 || pos.x > levelSize.x || pos.y > levelSize.y;
const level = (mouse, ufo) => {
	l = emptyLevel();
	// mark highlighted tile
	if (ufo) l[toLevelPos(ufoPos).x + toLevelPos(ufoPos).y * levelSize.x] = true;
	if (mouse) {
		if (mouseOffLevel()) return l;
		l[toLevelPos(mousePos).x + toLevelPos(mousePos).y * levelSize.x] = true;
	}
	return l;
};
// a level where none of the tiles are highlighted
const emptyLevel = (newLevel = []) => {
	for (x = levelSize.x; x--; ) for (y = levelSize.y; y--; ) newLevel[x + y * levelSize.x] = false;
	return newLevel;
};
// renders a tile, with a border if the mouse is over it
const drawLevelRect = (pos) => {
	drawPos = pos.add(vec2(0.5));
	if (mouseOffLevel() || animalPulse == null) drawRect(drawPos, vec2(1), grassGreen);
	else if (isOnHighlightedTile(pos)) drawRect(drawPos, vec2(0.95), grassGreen);
	else drawRect(drawPos, vec2(1), grassGreen);
};
const updateScoreTimerDisplay = () => {
	minute = Math.floor(scoreTimer.get() / 60);
	second = Math.floor(scoreTimer.get() % 60);
	scoreTimerDisplay.innerText = `${minute < 10 ? '0' : ''}${minute}:${second < 10 ? '0' : ''}${second}`;
};
const plantTrees = (pos, row, trees = [], spread = vec2(2, 1.5)) =>
	!row
		? trees // recursion ends on row 0
		: plantTrees(pos, row - 1, [
				...trees,
				...randTreeX(spread).map((randX) => vec2(randX + pos.x, randTreeY(spread, row) + pos.y)),
			]);
const drawRock = (pos) => drawTree(pos, 4);
const drawTree = (pos, textureIndex = 2) =>
	drawTile(
		pos.add(vec2(0, 0.5)),
		vec2(treeScale),
		tile(vec2(0), vec2(treeResolution), textureIndex),
	);
const randTreeX = (spread) => [
	rand(-spread.x - 0.25, -0.25), // left side
	rand(levelSize.x + 0.25, levelSize.x + spread.x + 0.25), // right side
];
const randTreeY = (spread, row) => spread.y * row + rand(-0.25, 0.25);

// % species %
const isScanned = (species) => scannedSpecies.has(species);
const getSpecies = (animal) => animalSpecies[Math.floor(animal.tileInfo.pos.x / animalResolution)];
const updateScannedSpecies = (animals) => {
	const oldSize = scannedSpecies.size;
	for (species of animals.map((a) => getSpecies(a))) scannedSpecies.add(species);
	if (scannedSpecies.size - oldSize > 0) sfx.scan.play();
};
const drawTraySpecies = (species, spread = 0.6) => {
	trayPos = center.add(vec2(-2.4, -5.35));
	color = isScanned(species) ? rgb(1, 1, 1) : rgb(0, 0, 0);
	index = animalSpecies.indexOf(species);
	params = [vec2(0.5), animalTile(index), color];

	// top row
	if (index > animalSpecies.length / 2 - 1)
		drawTile(
			vec2(trayPos.x + spread * (index - animalSpecies.length / 2), trayPos.y - spread),
			...params,
		);
	// bottom row
	else drawTile(vec2(trayPos.x + spread * index, trayPos.y), ...params);
};

// % animals %
const updateAnimals = () => {
	if (animalPulse?.elapsed()) {
		offLevelAnimals = animals.filter((a) => offLevel(a.pos));
		animals = pulseAnimals(animals);
		animals.filter((a) => offLevel(a.pos)).map((a) => a.destroy());
		animalPulse.set(animalPulseLength);
	} else animals = animals.map((a) => moveAnimal(a));
};
const animalTile = (animalIndex = 0) =>
	tile(vec2(animalResolution * animalIndex, 0), animalResolution, 0);
const addAnimals = (animals, amount) =>
	amount > 0 ? addAnimals(withNewAnimal(animals), amount - 1) : animals;
const withNewAnimal = (animals, pos) => [...animals, animal(pos ? pos : animalStartPos())];
const animal = (pos, angleSpread = 0.5) =>
	new EngineObject(
		pos,
		vec2(animalSize),
		animalTile(randInt(0, animalSpecies.length)),
		rand(Math.PI * (0.5 - angleSpread / 2), Math.PI * (0.5 + angleSpread / 2)) *
			(center.x > pos.x ? 1 : -1),
	);
const animalStartPos = () =>
	vec2(
		Math.random() < 0.5 ? -0.1 : levelSize.x + 0.1,
		Math.floor(Math.random() * levelSize.y) + 0.5,
	);
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
// biome-ignore format: engineInit
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, sourceImages);
