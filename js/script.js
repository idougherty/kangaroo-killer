var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
woodInfo = document.getElementById("wood");
metalInfo = document.getElementById("metal");
stoneInfo = document.getElementById("stone");
iqInfo = document.getElementById("iq");
foodInfo = document.getElementById("food");
populationInfo = document.getElementById("population");
militaryInfo = document.getElementById("military");
turnInfo = document.getElementById("turn");
govInfo = document.getElementById("government");
actionInfo = document.getElementById("action-points");
workerInfo = document.getElementById("workers");
bnameInfo = document.getElementById("bname");
unemployedInfo = document.getElementById("unemployed");

const events = [
	"whale",
	"acid",
	"steroid",
	"antivax",
	"termites",
	"imperialism",
	"badhawk",
	"prisoners",
	"meth",
	"patriotism",
	"goodhawk"
];

function fightBadEv(cost) {
	if (gameState.military >= cost) {
		gameState.military -= cost;
		return true;
	} else {
		return false;
	}
}

function shuffleArray(array) {
	array = array.slice();
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function runTurn() {
	gameState.actionPoints = 3;
	gameState.turnCount += 1;

	for (const hex of activeHexes) {
		switch (hex.state.type) {
			case "farm":
				gameState.food += (5 * hex.state.workers) / 3;
				break;
			case "factory":
				gameState.metal += (5 * hex.state.workers) / 3;
				break;
			case "mine":
				gameState.stone += (5 * hex.state.workers) / 3;
				break;
			case "mill":
				gameState.wood += (5 * hex.state.workers) / 3;
				break;
			case "school":
				gameState.iq += (5 * hex.state.workers) / 3;
				break;
			case "university":
				gameState.iq += (10 * hex.state.workers) / 5;
				break;
			case "barracks":
				gameState.militaryBuildUp = Math.min(50, gameState.militaryBuildUp + 5);
				break;
			case "simpleHousing":
				gameState.population += 1;
				break;
			case "superHousing":
				gameState.population += 3;
				break;
			case "nuclearFacilities":
				// TODO: win something
				break;
			case "none":
				break;
			default:
				throw new Error(`Unknown building type ${hex.state.type}`);
		}
	}

	const newFood = Math.max(0, gameState.food - gameState.population);
	if (newFood === 0) {
		let numToKill = gameState.population - gameState.food;
		loop: while (numToKill) {
			for (const hex of shuffleArray(activeHexes)) {
				const newToKill = Math.max(0, numToKill - 5);
				const toKillHere = Math.min(numToKill, 5);
				const newWorkers = Math.max(0, hex.state.workers - toKillHere);
				gameState.population = Math.max(0, gameState.population - toKillHere);
				if (newWorkers === 0) numToKill += toKillHere - hex.state.workers;
				numToKill = newToKill;
				hex.state.workers = newWorkers;
				if (!numToKill) break loop;
			}
		}
	}
	gameState.food = newFood;

	gameState.productionModifier = 1;

	gameState.extraMilitary = Math.max(0, gameState.extraMilitary - 10);

	const rand = Math.random();
	let impChance = 1;
	if (gameState.govt === "anarchy") impChance += 1;
	if (rand * 100 <= impChance) {
		// imperialism
		if (!fightBadEv(25)) {
			gameState.population *= 0.5;
			gameState.food *= 0.5;
			gameState.wood *= 0.5;
			gameState.stone *= 0.5;
			gameState.metal *= 0.5;
			gameState.iq *= 0.5;
			gameState.militaryBuildUp *= 0.5;
		}
	} else if (rand < 0.5) {
		const eventIdx = Math.floor(rand * 2 * events.length);
		const ev = events[eventIdx];
		switch (ev) {
			case "whale":
				if (!fightBadEv(10)) gameState.food *= 0.75;
				break;
			case "acid":
				if (!fightBadEv(10)) gameState.stone *= 0.75;
				break;
			case "steroid":
				if (!fightBadEv(10)) gameState.metal *= 0.75;
				break;
			case "antivax":
				if (!fightBadEv(10)) {
					gameState.iq *= 0.85;
					gameState.population *= 0.85;
				}
				break;
			case "termites":
				if (!fightBadEv(10)) gameState.wood *= 0.75;
				break;
			case "badhawk":
				if (!fightBadEv(1) && gameState.population) gameState.population -= 1;
				break;
			case "prisoners":
				gameState.population *= 1.15;
				break;
			case "meth":
				gameState.productionModifier = 1.25;
				break;
			case "patriotism":
				gameState.extraMilitary += 30;
				break;
			case "goodhawk":
				gameState.iq += 1;
				break;
			default:
				throw new Error("event not implemented");
		}
	}

	gameState.population = Math.floor(gameState.population);
	gameState.food = Math.floor(gameState.food);
	gameState.wood = Math.floor(gameState.wood);
	gameState.stone = Math.floor(gameState.stone);
	gameState.metal = Math.floor(gameState.metal);
	gameState.iq = Math.floor(gameState.iq);
	gameState.militaryBuildUp = Math.floor(gameState.militaryBuildUp);
	draw();
}

function updateStats() {
	foodInfo.innerHTML = gameState.food;
	stoneInfo.innerHTML = gameState.stone;
	woodInfo.innerHTML = gameState.wood;
	metalInfo.innerHTML = gameState.metal;
	iqInfo.innerHTML = gameState.iq;
	populationInfo.innerHTML = gameState.population;
	militaryInfo.innerHTML = gameState.military;
	turnInfo.innerHTML = gameState.turnCount;
	govInfo.innerHTML = gameState.govt;
	actionInfo.innerHTML = gameState.actionPoints;
	if (gameState.selectedHex != null) {
		var bname = g.Hexes[gameState.selectedHex].state.type;
		bnameInfo.innerHTML =
			bname.charAt(0).toUpperCase() + bname.substring(1, bname.length) + ":";
		workerInfo.innerHTML = g.Hexes[gameState.selectedHex].state.workers;
		unemployedInfo.innerHTML = gameState.population - gameState.employed;
	}
}

function moveWorkers(amt) {
	var curHex = g.Hexes[gameState.selectedHex].state;
	if (
		curHex.workers + amt >= 0 &&
		gameState.employed + amt <= gameState.population
	) {
		switch (curHex.type) {
			case "farm":
			case "factory":
			case "mine":
			case "mill":
			case "school":
				if (curHex.workers + amt <= 3) {
					curHex.workers += amt;
					gameState.employed += amt;
				}
				break;
			case "university":
				if (curHex.workers + amt <= 5) {
					curHex.workers += amt;
					gameState.employed += amt;
				}
				break;
			case "barracks":
				if (curHex.workers + amt <= 10) {
					curHex.workers += amt;
					gameState.employed += amt;
				}
				break;
			case "cityHall":
			case "nuclearFacilities":
				if (curHex.workers + amt <= 1) {
					curHex.workers += amt;
					gameState.employed += amt;
				}
				break;
			default:
				throw new Error(`Unknown building type ${curHex.type}`);
		}
	}
	draw();
}

function draw() {
	c.fillStyle = "#5abcd8";
	c.fillRect(0, 0, canvas.width, canvas.height);
	for (const hex of activeHexes) {
		drawHex(hex);
	}
	updateStats();
}

function drawHex(/* HT.Hexagon */ hex) {
	c.strokeStyle = "#5abcd8";
	c.lineWidth = 3;

	c.beginPath();
	c.moveTo(hex.Points[0].X, hex.Points[0].Y);
	for (var i = 1; i < hex.Points.length; i++) {
		var p = hex.Points[i];
		c.lineTo(p.X, p.Y);
	}
	c.closePath();

	switch (hex.state.type) {
		case "farm":
			c.fillStyle = "brown";
			break;
		case "factory":
			c.fillStyle = "lightgrey";
			break;
		case "mine":
			c.fillStyle = "#696969";
			break;
		case "mill":
			c.fillStyle = "#8B4513";
			break;
		case "school":
			c.fillStyle = "#003366";
			break;
		case "university":
			c.fillStyle = "#013220";
			break;
		case "barracks":
			c.fillStyle = "red";
			break;
		case "simpleHousing":
			c.fillStyle = "orange";
			break;
		case "superHousing":
			c.fillStyle = "#CC5500";
			break;
		case "cityHall":
			c.fillStyle = "white";
			break;
		case "nuclearFacilities":
			c.fillStyle = "black";
			break;
		case "none":
			c.fillStyle = "green";
			break;
		default:
			throw new Error(`Unknown building type ${hex.state.type}`);
	}

	c.fill();

	if (hex.state.selected) {
		c.fillStyle = "rgba(255, 255, 255, .3)";
		c.fill();
	}

	c.stroke();

	if (false && hex.Id) {
		//draw text for debugging
		c.fillStyle = "black";
		c.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
		c.textAlign = "center";
		c.textBaseline = "middle";
		//var textWidth = c.measureText(hex.Planet.BoundingHex.Id);
		c.fillText(hex.Id, hex.MidPoint.X, hex.MidPoint.Y);
	}

	if (
		false &&
		hex.PathCoOrdX !== null &&
		hex.PathCoOrdY !== null &&
		typeof hex.PathCoOrdX != "undefined" &&
		typeof hex.PathCoOrdY != "undefined"
	) {
		//draw co-ordinates for debugging
		c.fillStyle = "black";
		c.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
		c.textAlign = "center";
		c.textBaseline = "middle";
		//var textWidth = c.measureText(hex.Planet.BoundingHex.Id);
		c.fillText(
			"(" + hex.PathCoOrdX + "," + hex.PathCoOrdY + ")",
			hex.MidPoint.X,
			hex.MidPoint.Y + 10
		);
	}
}

class GameState {
	constructor() {
		this.actionPoints = 3;
		this.turnCount = 1;
		this.govt = "anarchy";
		this.productionModifier = 1;
		this.selectedHex = null;

		//materials
		this.population = 5;
		this.employed = 0;
		this.food = 10;
		this.wood = 10;
		this.stone = 10;
		this.metal = 0;
		this.iq = 0;
		this.militaryBuildUp = 0;
		this.extraMilitary = 0;
	}

	get military() {
		return this.militaryBuildUp + this.extraMilitary;
	}

	set military(val) {
		const militaryBuildUp = Math.max(0, this.militaryBuildUp - val);
		this.extraMilitary =
			militaryBuildUp == 0
				? Math.max(0, this.extraMilitary - val - this.militaryBuildUp)
				: this.extraMilitary;
		this.militaryBuildUp = militaryBuildUp;
	}
}

function CellState() {
	this.workers = 0;
	this.type = "none";
	this.selected = false;
}

CellState.prototype.click = function(id) {
	for (const hex of activeHexes) {
		hex.state.selected = false;
	}

	this.selected = true;

	gameState.selectedHex = id;
};

canvas.addEventListener("click", ({ layerX, layerY }) => {
	var idx = g.GetHexIdxAt(new HT.Point(layerX, layerY));
	var hex = g.Hexes[idx];
	if (hex) hex.state.click(idx);
	draw();
});

function buildButton(building) {
	if (
		gameState.actionPoints > 0 &&
		g.Hexes[gameState.selectedHex].state.type == "none"
	) {
		var isGucci = false;
		switch (building) {
			case "farm":
				if (gameState.stone >= 10 && gameState.wood >= 10) {
					isGucci = true;
					gameState.stone -= 10;
					gameState.wood -= 10;
				}
				break;
			case "factory":
				if (
					gameState.stone >= 40 &&
					gameState.iq >= 15 &&
					gameState.population >= 50
				) {
					isGucci = true;
					gameState.stone -= 40;
					gameState.iq -= 15;
				}
				break;
			case "mine":
				if (gameState.wood >= 10) {
					isGucci = true;
					gameState.wood -= 10;
				}
				break;
			case "mill":
				if (gameState.stone >= 10) {
					isGucci = true;
					gameState.stone -= 10;
				}
				break;
			case "school":
				if (
					gameState.stone >= 20 &&
					gameState.wood >= 10 &&
					gameState.population >= 30
				) {
					isGucci = true;
					gameState.stone -= 20;
					gameState.wood -= 10;
				}
				break;
			case "university":
				if (
					gameState.stone >= 30 &&
					gameState.metal >= 30 &&
					gameState.iq >= 15
				) {
					isGucci = true;
					gameState.stone -= 20;
					gameState.wood -= 10;
					gameState.iq -= 10;
				}
				break;
			case "barracks":
				if (
					gameState.stone >= 30 &&
					gameState.iq >= 15 &&
					gameState.metal >= 20 &&
					gameState.population >= 30
				) {
					isGucci = true;
					gameState.stone -= 30;
					gameState.iq -= 15;
					gameState.metal -= 20;
				}
				break;
			case "simpleHousing":
				if (gameState.stone >= 10 && gameState.wood >= 10) {
					isGucci = true;
					gameState.stone -= 10;
					gameState.wood -= 10;
				}
				break;
			case "superHousing":
				if (
					gameState.stone >= 40 &&
					gameState.iq >= 15 &&
					gameState.metal >= 30
				) {
					isGucci = true;
					gameState.stone -= 40;
					gameState.iq -= 15;
					gameState.metal -= 30;
				}
				break;
			case "cityHall":
				if (
					gameState.stone >= 15 &&
					gameState.wood >= 15 &&
					gameState.population >= 20
				) {
					isGucci = true;
					gameState.stone -= 15;
					gameState.wood -= 15;
				}
				break;
			case "nuclearFacilities":
				if (
					gameState.stone >= 60 &&
					gameState.iq >= 70 &&
					gameState.metal >= 90 &&
					gameState.wood >= 20 &&
					gameState.population >= 60
				) {
					isGucci = true;
					gameState.stone -= 30;
					gameState.iq -= 15;
					gameState.metal -= 20;
				}
				break;
			default:
				throw new Error(`Unknown building type ${hex.state.type}`);
		}

		if (isGucci) {
			gameState.actionPoints--;
			g.Hexes[gameState.selectedHex].state.type = building;
		}
		draw();
	}
}

function updateHexInfo(hexState) {}

var g = new HT.Grid(canvas.width, canvas.height);

var activeHexes = g.Hexes.filter((_hex, idx) => map.includes(idx));

g.Hexes.forEach((_hex, i) => {
	if (!map.includes(i)) {
		delete g.Hexes[i];
	}
});

const gameState = new GameState();

draw();
