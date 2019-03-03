var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
//13 12

const events = ["whale", "acid", "steroid", "antivax", "termites", "imperialism", "badhawk", "prisoners", "meth", "patriotism", "goodhawk"];

function fightBadEv(cost) {
	if (gameState.military >= cost) {
		gameState.military -= cost;
		return true;
	} else {
		return false;
	}
}

function runTurn() {
	gameState.turnCount += 1;
	for (const hex of activeHexes) {
		switch(hex.state.type) {
			case "farm":
				gameState.food += 5;
				break;
			case "factory":
				gameState.metal += 5;
				break;
			case "mine":
				gameState.stone += 5;
				break;
			case "mill":
				gameState.wood += 5;
				break;
			case "school":
				gameState.iq += 5;
				break;
			case "university":
				gameState.iq += 10;
				break;
			case "barracks":
				gameState.militaryBuildUp = Math.min(100, gameState.militaryBuildUp + 5);
				break;
			case "simpleHousing":
				gameState.population += 5;
				break;
			case "superHousing":
				gameState.population += 10;
				break;
			case "nuclearFacilities":
				// TODO: win something
				break;
			case "none": break;
			default:
				throw new Error(`Unknown building type ${hex.state.type}`);
		}
	}
	
	gameState.productionModifier = 1;
	
	gameState.extraMilitary = Math.max(0, gameState.extraMilitary - 10);
	
	const rand = Math.random();
	let impChance = 1;
	if (gameState.govt === "anarchy") impChance += 1;
	if (rand * 100 <= impChance) {
		// imperialism
		if (!fightBadEv(25)) {
			gameState.population *= .50;
			gameState.food *= .50;
			gameState.wood *= .50;
			gameState.stone *= .50;
			gameState.metal *= .50;
			gameState.iq *= .50;
			gameState.militaryBuildUp *= .50;
			gameState.food *= .50;
		}
	} else if (rand < 0.5) {
		const eventIdx = Math.floor(rand * 2 * events.length);
		const ev = events[eventIdx];
		switch (ev) {
			case "whale":
				if (!fightBadEv(10)) gameState.food *= .75;
				break;
			case "acid":
				if (!fightBadEv(10)) gameState.stone *= .75;
				break;
			case "steroid":
				if (!fightBadEv(10)) gameState.metal *= .75;
				break;
			case "antivax":
				if (!fightBadEv(10)) {
					gameState.iq *= .85;
					gameState.population *= .85;
				}
				break;
			case "termites":
				if (!fightBadEv(10)) gameState.wood *= .75;
				break;
			case "badhawk":
				if (!fightBadEv(1) && gameState.population) gameState.population -= 1;
				break;
			case "prisoners":
				gameState.population *= 1.15;
				break;
			case "meth":
				gameState.population *= 1.15;
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
}

function draw() {
	c.fillStyle = "#5abcd8";
	c.fillRect(0, 0, canvas.width, canvas.height);
	for (const hex of activeHexes) {
		drawHex(hex);
	}
}

function drawHex(/* HT.Hexagon */ hex) {
	if (!hex.selected) {
		c.strokeStyle = "#ccc";
		c.lineWidth = 1;
	} else {
		c.strokeStyle = "black";
		c.lineWidth = 3;
	}
	
	c.beginPath();
	c.moveTo(hex.Points[0].X, hex.Points[0].Y);
	for (var i = 1; i < hex.Points.length; i++) {
		var p = hex.Points[i];
		c.lineTo(p.X, p.Y);
	}
	
	c.closePath();
	c.fillStyle = "#008000";
	c.fill();
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
		this.turnCount = 0;
		this.govt = "anarchy";
		this.productionModifier = 1;
		
		// materials
		this.population = 0;
		this.food = 0;
		this.wood = 0;
		this.stone = 0;
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
		this.extraMilitary = militaryBuildUp == 0 ? Math.max(0, this.extraMilitary - val - this.militaryBuildUp) : this.extraMilitary;
		this.militaryBuildUp = militaryBuildUp;
	}
}


function CellState() {
	this.workers = 0;
	this.type = "farm";
}

CellState.prototype.click = function(id) {
	this.selected = true;
};

canvas.addEventListener("click", ({ layerX, layerY }) => {
	var idx = g.GetHexIdxAt(new HT.Point(layerX, layerY));
	var hex = g.Hexes[idx];
	alert(idx)
	if (hex) hex.state.click(idx);
	draw();
});

var g = new HT.Grid(canvas.width, canvas.height);

var activeHexes = g.Hexes.filter((_hex, idx) => map.includes(idx));

g.Hexes.forEach((_hex, i) => {
	if (!map.includes(i)) {
		// delete g.Hexes[i]
	}
});

const gameState = new GameState();

draw();