// a straight line 35.7,0 0,0 0,150 0,306 35.7,306 35.7,153
const endPoints = [[35.7, 0], [0, 0], [0, 150], [0, 306], [35.7, 306], [35.7, 153]];

// assumes 2d array
const interpolate = (n, end, start) => {
  return start.map((point, i) => {
    return point.map((s, j) => {
      diff = end[i][j] - s;
      return s + diff * n;
    });
  });
};

const joinPoints = (arr) => {
  return arr.map((point) => point.join(',')).join(' ');
};

const rotate = (element, degree, offset=90) => {
  let match = /(.*)rotate\(-?[\.\d]+(.*)\)(.*)/g.exec(element.getAttribute('transform') || '');
  element.setAttribute('transform', `${match[1]}rotate(${offset + degree}${match[2]})`);
};

let move = {
  startX: 250,
  startY: 219,
  x: 250,
  y: 219,
  translate: function(element, x, y) {
    if(x) {
      x = this.startX + Number(x) * 2;
    } else {
      x = this.x;
    }
    if(y) {
      y = this.startY + Number(y) * 2;
    } else {
      y = this.y;
    }
    this.y = y;
    this.x = x;
    match = /(.*)translate\(-?[\.\d]+\s+-?[\.\d]+(.*)\)(.*)/g.exec(element.getAttribute('transform') || '');
    element.setAttribute('transform', `${match[1]}translate(${x} ${y}${match[2]})`);
  },
};

window.addEventListener('load', () => {
  iframe = document.querySelector('iframe');
  iframe.setAttribute('src', iframe.dataset.src);

  let arrow = document.getElementById('arrow');
  let polygon = arrow.contentDocument.querySelector('polygon');
  let currentX = 0;
  let currentY = 0;

  const rotateMap = (polygon) => {
    xVal = currentX;
    yVal = currentY;

    offset = (yVal < 0) * 180;
    degree = xVal * 0.9 * (100 - Math.abs(yVal) / 2) / 100;
    rotate(polygon, offset + (offset ? 1 : -1) * degree);
  };

  let startPoints = polygon.getAttribute('points').split(' ').map(
    (point) => point.split(',').map(Number));
  polygon.setAttribute('points',
    joinPoints(interpolate(0, startPoints, endPoints)));

  function setX(val) {
    rotateMap(polygon);
    move.translate(polygon, val);
  }
  function setY(val) {
    rotateMap(polygon);
    move.translate(polygon, 0, val);
    polygon.setAttribute('points',
      joinPoints(interpolate(Math.abs(val) / 100.0, startPoints, endPoints)));
  }

  let map = {};
  onkeydown = onkeyup = function(e) {
      map[e.key] = e.type == 'keydown';
  };

  let counter = 0;
  let prevX = 0;
  let prevY = 0;
  setInterval(function moveArrow() {
    if(map[' ']) {
      currentY = 0;
    }
    if(map.ArrowUp) {
      currentY -= 2.5;
    }
    if(map.ArrowDown) {
      currentY += 2.5;
    }
    if(map.ArrowRight) {
      currentX += 2.5;
    }
    if(map.ArrowLeft) {
      currentX -= 2.5;
    }
    currentX = Math.min(Math.max(currentX, -100), 100);
    currentY = Math.min(Math.max(currentY, -100), 100);
    usedX = Math.abs(currentX) > 5 ? currentX : 0.1;
    usedY = Math.abs(currentY) > 5 ? currentY : 0.1
    setX(usedX);
    setY(usedY);

    counter++;
    if(counter >= 3 && (prevX != currentX || prevY != currentY)) {
      var xmlHttp = new XMLHttpRequest();
      xmlHttp.open('GET', window.location.href + `move?speed=${usedY}&rotation=${usedX}`,true);
      xmlHttp.send(null);
      counter = 0;
    }
    prevX = currentX;
    prevY = currentY;
  }, 10);
});
