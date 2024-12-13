// animal scan by Aquarock

setCanvasPixelated(false);
const cameraOffset = vec2(0, -0.5);
const backgroundColor = hsl(0, 0, 0.2);
const green = rgb(0, 1, 0);

animalTurnRange = 1;
animalPulseLength = 2;
animalSpeed = 3; // distance animals travel in one pulse
animalSize = 0.25; // distance animals travel in one pulse
animalResolution = 72;
animals = [];

animalPulse = null;
startGame = () => {
	animalPulse = new Timer(animalPulseLength);
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

// % level %
const isHighlighted = (pos) => level()[pos.x + pos.y * levelSize.x];
const toLevelPos = (pos) => vec2(Math.floor(pos.x), Math.floor(pos.y));
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
// renders a tile with a border if the mouse is over it
const renderLevelRect = (pos) => {
	drawPos = pos.add(vec2(0.5));
	if (mouseOffLevel()) drawRect(drawPos, vec2(1), green);
	else if (isHighlighted(pos)) drawRect(drawPos, vec2(0.95), green);
	else drawRect(drawPos, vec2(1), green);
};

const newAnimal = (pos, spread = 0.5) =>
	new EngineObject(
		pos,
		vec2(animalSize),
		tile(vec2(0), animalResolution, randInt(0, animalSpecies.length)),
		rand(Math.PI * (0.5 - spread / 2), Math.PI * (0.5 + spread / 2)) *
			(center.x > pos.x ? 1 : -1),
	);

// % animals %
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

const turnAnimal = (animal) => {
	animal.angle += rand(-animalTurnRange / 2, animalTurnRange / 2);
	return animal;
};

// % game %
function gameInit() {
	canvasFixedSize = vec2(720, 720);
	mainCanvas.style.background = backgroundColor;
	cameraPos = levelSize.scale(0.5).add(cameraOffset);
	cameraScale = 500 / levelSize.y;
}
function gameUpdate() {
	// randomly spawn animal at interval
	if (animalPulse?.elapsed()) {
		offLevelAnimals = animals.filter((a) => offLevel(a.pos));
		animals = withNewAnimal(withNewAnimal(withNewAnimal(animals)))
			.filter((a) => !offLevelAnimals.includes(a))
			.map((a) => turnAnimal(a));
		offLevelAnimals.map((a) => a.destroy());
		animalPulse.set(animalPulseLength);
	} else animals = animals.map((a) => moveAnimal(a));

	if (mouseWasPressed(0) && animals.length > 0) {
		scanned = scan(animals);
		if (scanned.length > 0) console.log(scanned);
		// compare scanned to the set of all scanned species
	}
}
function gameUpdatePost() {}
function gameRender() {
	// background
	drawRect(cameraPos.subtract(cameraOffset), levelSize, hsl(0, 0, 0));
	drawRect(center, vec2(10), green);
	drawRect(center, vec2(5.1), rgb(0, 0, 0));
	drawRect(center, vec2(5), rgb(1, 1, 1)); // highlight tiles
	// TODO jungle leaves covering sides where animals spawn

	const pos = vec2();
	for (pos.x = levelSize.x; pos.x--; )
		for (pos.y = levelSize.y; pos.y--; ) renderLevelRect(pos);

	drawTile(center, vec2(0.5), tile(vec2(0), 72, 0));
	drawTile(vec2(0, 2.5), vec2(0.5), tile(vec2(0), 72, 1));
	drawTile(vec2(5, 2.5), vec2(0.5), tile(vec2(0), 72, 2));

	for (animal of animals) {
		drawTile(animal.pos, vec2(1), animal.tileInfo);
	}
}
function gameRenderPost() {
	drawRect(vec2(center.x, -0.8), vec2(5, 1.5), green); // ui area
	drawRect(vec2(center.x, -0.8), vec2(4, 0.8), rgb(1, 0, 0)); // tray
}
engineInit(gameInit, gameUpdate, gameUpdatePost, gameRender, gameRenderPost, [
	"animals.png",
]);
startGame();
