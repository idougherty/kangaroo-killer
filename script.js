var canvas = document.getElementById("canvas");
var c = canvas.getContext("2d");
//13 12

c.fillStyle = "#eee";
c.fillRect(0, 0, 500, 500);

var g = new HT.Grid(canvas.width, canvas.height);

var activeHexes = g.Hexes.filter((_hex, idx) => map.includes(idx));

function drawHexes() {
  c.clearRect(0, 0, canvas.width, canvas.height);
  for (const hex of activeHexes) {
    drawHex(hex);
  }
}
drawHexes();

canvas.addEventListener("click", ({ layerX, layerY }) => {
  var idx = g.GetHexIdxAt(new HT.Point(layerX, layerY));
  g.Hexes[idx].selected = true;
  drawHexes();
});

function drawHex(/* HT.Hexagon */ hex) {
  if (!hex.selected) {
    c.strokeStyle = "grey";
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

  if (HT.Hexagon.Static.DRAWSTATS) {
    c.strokeStyle = "black";
    c.lineWidth = 2;
    //draw our x1, y1, and z
    c.beginPath();
    c.moveTo(hex.P1.X, hex.y);
    c.lineTo(hex.P1.X, hex.P1.Y);
    c.lineTo(hex.x, hex.P1.Y);
    c.closePath();
    c.stroke();

    c.fillStyle = "black";
    c.font = "bolder 8pt Trebuchet MS,Tahoma,Verdana,Arial,sans-serif";
    c.textAlign = "left";
    c.textBaseline = "middle";
    //var textWidth = c.measureText(hex.Planet.BoundingHex.Id);
    c.fillText("z", hex.x + hex.x1 / 2 - 8, hex.y + hex.y1 / 2);
    c.fillText("x", hex.x + hex.x1 / 2, hex.P1.Y + 10);
    c.fillText("y", hex.P1.X + 2, hex.y + hex.y1 / 2);
    c.fillText(
      "z = " + HT.Hexagon.Static.SIDE,
      hex.P1.X,
      hex.P1.Y + hex.y1 + 10
    );
    c.fillText(
      "(" + hex.x1.toFixed(2) + "," + hex.y1.toFixed(2) + ")",
      hex.P1.X,
      hex.P1.Y + 10
    );
  }
}
