var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
var flag = 0;
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
workerWindow = document.getElementById("workerWindow");
cityHallWindow = document.getElementById("cityHallWindow");
statlist = document.getElementById("statlist");
modal = document.getElementById("modal-body");
buildingPic = document.getElementById("buildingPic");

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
	if (gameState.military * gameState.militaryModifier >= cost) {
		gameState.military -= cost;
		return true;
	} else {
		return false;
	}
}

function killPeople(numToKill) {
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
				gameState.food +=
					((10 * hex.state.workers) / 3) *
					gameState.foodProductionModifier *
					gameState.productionModifier;
				break;
			case "factory":
				gameState.metal +=
					((5 * hex.state.workers) / 3) *
					gameState.metalProductionModifier *
					gameState.productionModifier;
				break;
			case "mine":
				gameState.stone +=
					((5 * hex.state.workers) / 3) *
					gameState.stoneProductionModifier *
					gameState.productionModifier;
				break;
			case "mill":
				gameState.wood +=
					((5 * hex.state.workers) / 3) *
					gameState.woodProductionModifier *
					gameState.productionModifier;
				break;
			case "school":
				gameState.iq +=
					((5 * hex.state.workers) / 3) *
					gameState.iqProductionModifier *
					gameState.productionModifier;
				break;
			case "university":
				gameState.iq +=
					((10 * hex.state.workers) / 5) *
					gameState.iqProductionModifier *
					gameState.productionModifier;
				break;
			case "barracks":
				gameState.militaryBuildUp = Math.min(50, gameState.militaryBuildUp + 5);
				break;
			case "simpleHousing":
				gameState.population += 1 * gameState.populationModifier;
				break;
			case "superHousing":
				gameState.population += 3;
				break;
			case "nuclearFacilities":
				if(hex.state.workers >= 1) {
					flag = 1;
				}
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
		killPeople(numToKill)
	}
	gameState.food = newFood;

	gameState.productionModifier = 1;

	gameState.extraMilitary = Math.max(0, gameState.extraMilitary - 10);
	if (flag == 0){
		modal.innerHTML = "Nothing exciting happens this turn.";
	} else {
		modal.innerHTML = "VICTORY!  New Zealand is no more!";
	}
	const rand = Math.random();
	let impChance = 1;
	if (gameState.govt === "anarchy") impChance += 1;
	if (rand * 100 <= impChance) {
		// imperialism
		if (!fightBadEv(25)) {
			modal.innerHTML = "The British Empire wants to do imperialism!  25 percent of wood, food, stone, metal, IQ, population, and military is lost unless military is at least 25 strong.";
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
				modal.innerHTML = "<img src='./assets/biggerbabywhale.png'/> Whales with baby legs come and try to devour your food supply!  25 percent of food is lost, unless military is 10 at least strong.";
				break;
			case "acid":
				if (!fightBadEv(10)) gameState.stone *= 0.75;
				modal.innerHTML = "<img src='./assets/acidkangaroo.png'/> Acid-spitting kangaroos try to melt all of your stone!  25 percent of stone is lost, unless military is at least 10 strong.";
				break;
			case "steroid":
				if (!fightBadEv(10)) gameState.metal *= 0.75;
				modal.innerHTML = "<img src='./assets/strongemu.png'/> Emus on steroids come to steal your metal in order to make more weights!  25 percent of metal is lost, unless military is at least 10 strong.";
				break;
			case "antivax":
				if (!fightBadEv(10)) {
					gameState.iq *= 0.85;
					gameState.population *= 0.85;
					modal.innerHTML = "<img src='./assets/anti-mom.png'/> Anti-vax parents attack the schools and universities in order to stop their children from evil vaccinations!  15 percent of population and 15 percent of IQ is lost unless military is at least 10 strong.";
				}
				break;
			case "termites":
				if (!fightBadEv(10)) gameState.wood *= 0.75;
				modal.innerHTML = "<img src='./assets/termitee.png'/> Giant termites come with a desire to eat wood!  25 percent of wood is lost unless military is at least 10 strong.";
				break;
			case "badhawk":
				if (!fightBadEv(1) && gameState.population) killPeople(1);
				modal.innerHTML = "<img src='./assets/hawk.png'/> An evil hawk tries to attack your people!  1 person dies unless military is at least 1 strong.";
				break;
			case "prisoners":
				gameState.population *= 1.15;
				modal.innerHTML = "A bunch of prisoners come to 'live' in Australia!  Population increases by 15 percent.";
				break;
			case "meth":
				gameState.productionModifier = 1.25;
				modal.innerHTML = "A lot of meth washes up on the beach and makes people happy!  25 percent increase in food, metal, IQ, wood, and stone.";
				break;
			case "patriotism":
				gameState.extraMilitary += 30;
				modal.innerHTML = "People find an American flag or something.  Temporary 30 military for the next 3 turns (decreases by 10 each turn).";
				break;
			case "goodhawk":
				gameState.iq += 1;
				modal.innerHTML = "<img src='./assets/hawk.png'/> A good hawk inspires your people!  IQ increases by 1.";
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

function chooseGov(gov) {	
	gameState.productionModifier = 1;
	gameState.militaryModifier = 1;
	gameState.populationModifier = 1;
	gameState.buildingCostModifier = 1;
	gameState.foodProductionModifier = 1;
	gameState.metalProductionModifier = 1;
	gameState.stoneProductionModifier = 1;
	gameState.woodProductionModifier = 1;
	gameState.iqProductionModifier = 1;
	
	gameState.govt = gov;
	switch (gov) {
		case "democracy":
			gameState.militaryModifier = 0.75;
			gameState.populationModifier = 1.25;
			break;
		case "monarchy":
			gameState.militaryModifier = 1.5;
			gameState.buildingCostModifier = 1.5;
			break;
		case "theocracy":
			gameState.iqProductionModifier = 0.5;
			gameState.buildingCostModifier = 0.67;
			break;
		case "communism":
			gameState.foodProductionModifier = 0.25;
			gameState.productionModifier = 1.50;
			break;
		default:
			throw new Error("Ugly");
	}
	draw();
}

function updateStats() {
	foodInfo.innerHTML = gameState.food;
	stoneInfo.innerHTML = gameState.stone;
	woodInfo.innerHTML = gameState.wood;
	metalInfo.innerHTML = gameState.metal;
	iqInfo.innerHTML = gameState.iq;
	populationInfo.textContent = gameState.population;
	turnInfo.textContent = gameState.turnCount;
	militaryInfo.textContent = gameState.military;
	govInfo.textContent = gameState.military;
	
	stat = ""
	
	if (gameState.militaryModifier != 1) {
		stat +='<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Military Modifier - ' +
			gameState.militaryModifier +
			"</li>";
	}
	if (gameState.populationModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Population Modifier - ' +
			gameState.populationModifier +
			"</li>";
	}
	if (gameState.buildingCostModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Building Cost Modifier - ' +
			gameState.buildingCostModifier +
			"</li>";
	}
	if (gameState.iqProductionModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">IQ Modifier - ' +
			gameState.iqProductionModifier +
			"</li>";
	}
	if (gameState.woodProductionModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Wood Modifier - ' +
			gameState.woodProductionModifier +
			"</li>";
	}
	if (gameState.metalProductionModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Metal Modifier - ' +
			gameState.metalProductionModifier +
			"</li>";
	}
	if (gameState.foodProductionModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Food Modifier - ' +
			gameState.foodProductionModifier +
			"</li>";
	}
	if (gameState.stoneProductionModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Stone Modifier - ' +
			gameState.stoneProductionModifier +
			"</li>";
	}
	if (gameState.productionModifier != 1) {
		stat +=
			'<li class="list-group-item d-flex justify-content-between align-items-center py-2" ng-repeat="i in filters">Production Modifier - ' +
			gameState.productionModifier +
			"</li>";
	}
	
	statlist.innerHTML = stat;
	
	actionInfo.innerHTML = gameState.actionPoints;
	if (gameState.selectedHex != null) {
		var bname = g.Hexes[gameState.selectedHex].state.type;
		var picID = {
			farm: "./assets/farm.png",
			factory: "./assets/factory",
			simpleHousing: "./assets/simplehouse.png",
			superHousing: "./assets/superhouse.png",
			mill:	"./assets/lumbermill.png",
			barracks: "./assets/barrach.png",
			school:	"./assets/school.png",
			university:	"./assets/university.png",
			cityHall: "./assets/city_hall_building.png",
			nuclearFacilities: "./assets/nukenukenuke.png",
			mine: "./assets/mine.png",
		}[bname];
		buildingPic.src = picID
		if (bname == "none") {
			buildingPic.style.visibility = "hidden"
		} else {
			buildingPic.style.visibility = "visible"

		}
		if(bname == "none") {
			cityHallWindow.style.visibility = "hidden";
			cityHallWindow.style.position = "absolute";
			workerWindow.style.visibility = "hidden";
			workerWindow.style.position = "absolute";
		} else if (bname == "cityHall") {
			cityHallWindow.style.visibility = "visible";
			cityHallWindow.style.position = "static";
			workerWindow.style.visibility = "hidden";
			workerWindow.style.position = "absolute";
		} else {
			cityHallWindow.style.visibility = "hidden";
			cityHallWindow.style.position = "absolute";
			workerWindow.style.visibility = "visible";
			workerWindow.style.position = "static";
			bnameInfo.innerHTML =
				bname.charAt(0).toUpperCase() + bname.substring(1, bname.length) + ":";
			workerInfo.innerHTML = g.Hexes[gameState.selectedHex].state.workers;
			unemployedInfo.innerHTML = gameState.population - gameState.employed;
		}
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
}

class GameState {
	constructor() {
		this.actionPoints = 3;
		this.turnCount = 1;
		this.govt = "anarchy";
		this.selectedHex = null;

		//materials
		this.population = 5;
		this.employed = 0;
		this.food = 20;
		this.wood = 20;
		this.stone = 20;
		this.metal = 0;
		this.iq = 0;
		this.militaryBuildUp = 0;
		this.extraMilitary = 0;

		//modifiers
		this.productionModifier = 1;
		this.militaryModifier = 1;
		this.populationModifier = 1;
		this.buildingCostModifier = 1;
		this.foodProductionModifier = 1;
		this.metalProductionModifier = 1;
		this.stoneProductionModifier = 1;
		this.woodProductionModifier = 1;
		this.iqProductionModifier = 1;
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
				if (
					gameState.stone >= 10 * gameState.buildingCostModifier &&
					gameState.wood >= 10 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 10 * gameState.buildingCostModifier;
					gameState.wood -= 10 * gameState.buildingCostModifier;
				}
				break;
			case "factory":
				if (
					gameState.stone >= 40 * gameState.buildingCostModifier &&
					gameState.iq >= 15 * gameState.buildingCostModifier &&
					gameState.population >= 50 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 40 * gameState.buildingCostModifier;
					gameState.iq -= 15 * gameState.buildingCostModifier;
				}
				break;
			case "mine":
				if (gameState.wood >= 10 * gameState.buildingCostModifier) {
					isGucci = true;
					gameState.wood -= 10 * gameState.buildingCostModifier;
				}
				break;
			case "mill":
				if (gameState.stone >= 10 * gameState.buildingCostModifier) {
					isGucci = true;
					gameState.stone -= 10 * gameState.buildingCostModifier;
				}
				break;
			case "school":
				if (
					gameState.stone >= 20 * gameState.buildingCostModifier &&
					gameState.wood >= 10 * gameState.buildingCostModifier &&
					gameState.population >= 30 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 20 * gameState.buildingCostModifier;
					gameState.wood -= 10 * gameState.buildingCostModifier;
				}
				break;
			case "university":
				if (
					gameState.stone >= 30 * gameState.buildingCostModifier &&
					gameState.metal >= 30 * gameState.buildingCostModifier &&
					gameState.iq >= 15 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 20 * gameState.buildingCostModifier;
					gameState.wood -= 10 * gameState.buildingCostModifier;
					gameState.iq -= 10 * gameState.buildingCostModifier;
				}
				break;
			case "barracks":
				if (
					gameState.stone >= 30 * gameState.buildingCostModifier &&
					gameState.iq >= 15 * gameState.buildingCostModifier &&
					gameState.metal >= 20 * gameState.buildingCostModifier &&
					gameState.population >= 30 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 30 * gameState.buildingCostModifier;
					gameState.iq -= 15 * gameState.buildingCostModifier;
					gameState.metal -= 20 * gameState.buildingCostModifier;
				}
				break;
			case "simpleHousing":
				if (
					gameState.stone >= 10 * gameState.buildingCostModifier &&
					gameState.wood >= 10 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 10 * gameState.buildingCostModifier;
					gameState.wood -= 10;
				}
				break;
			case "superHousing":
				if (
					gameState.stone >= 40 * gameState.buildingCostModifier &&
					gameState.iq >= 15 * gameState.buildingCostModifier &&
					gameState.metal >= 30 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 40 * gameState.buildingCostModifier;
					gameState.iq -= 15 * gameState.buildingCostModifier;
					gameState.metal -= 30 * gameState.buildingCostModifier;
				}
				break;
			case "cityHall":
				if (
					gameState.stone >= 15 * gameState.buildingCostModifier &&
					gameState.wood >= 15 * gameState.buildingCostModifier &&
					gameState.population >= 20 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 15 * gameState.buildingCostModifier;
					gameState.wood -= 15 * gameState.buildingCostModifier;
				}
				break;
			case "nuclearFacilities":
				if (
					gameState.stone >= 60 * gameState.buildingCostModifier &&
					gameState.iq >= 70 * gameState.buildingCostModifier &&
					gameState.metal >= 90 * gameState.buildingCostModifier &&
					gameState.wood >= 20 * gameState.buildingCostModifier &&
					gameState.population >= 60 * gameState.buildingCostModifier
				) {
					isGucci = true;
					gameState.stone -= 30 * gameState.buildingCostModifier;
					gameState.iq -= 15 * gameState.buildingCostModifier;
					gameState.metal -= 20 * gameState.buildingCostModifier;
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

const titleImage = new Image();
titleImage.src = "./assets/titlescreen.png";
titleImage.addEventListener("load", () => {
	c.imageSmoothingEnabled = false
	c.mozImageSmoothingEnabled = false
	c.drawImage(titleImage, 0, 0, canvas.width, canvas.height)
})


