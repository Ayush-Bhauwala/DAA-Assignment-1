let flag = 0;
/**
 * Set the flag to 0 for Jarvis March algorithm.
 */
function setJarvis() {
  flag = 0;
}

/**
 * Set the flag to 1 for Kirk-Patrick-Seidel algorithm.
 */
function setKPS() {
  flag = 1;
}

const canvas = document.getElementById("myCanvas");
const ctx = canvas.getContext("2d");
ctx.translate(0, canvas.height);

ctx.scale(1, -1);
ctx.translate(0, 0);

let points = [];

let colorGradient = [
  "#ff0000", // Red
  "#ff8000", // Orange
  "#ffff00", // Yellow
  "#80ff00", // Lime
  "#00ff00", // Green
  "#00ff80", // Mint
  "#00ffff", // Cyan
  "#0080ff", // Blue
  "#0000ff", // Navy
  "#8000ff", // Purple
  "#ff00ff", // Fuchsia
];
let currentColorIndex = 0;

var lines = [];

var kps_hull_steps = [];

canvas.addEventListener("click", drawPoint);

/**
 * Draw a point on the canvas when the user clicks on it.
 * @param {MouseEvent} event - The mouse event object.
 */
function drawPoint(event) {
  // Get the position of the click relative to the canvas
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = canvas.height - (event.clientY - rect.top);
  points.push({ x, y });
  displayCoordinates();

  ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, 2 * Math.PI);
  ctx.fillStyle = "#ff9966"; // Faded orange color
  ctx.fill();

  // if (displayflag === 1) {
  //   canvas.addEventListener("mousemove", function (event) {
  //     console.log(points);
  //     for (let i = 0; i < points.length; i++) {
  //       ctx.shadowColor = "rgba(0, 0, 0, 0)";
  //       ctx.shadowBlur = 0;
  //       ctx.shadowOffsetX = 0;
  //       ctx.shadowOffsetY = 0;

  //       if (points.length < 30) { //ensures that only the first 30 points are displayed on hover.
  //         ctx.save();
  //         ctx.translate(points[i].x + 10, points[i].y + 10);
  //         ctx.scale(1, -1);
  //         ctx.fillStyle = "#555"; // Dark gray color
  //         ctx.textAlign = "start";
  //         ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
  //         ctx.fillText(
  //           "(" +
  //           points[i].x.toFixed(2) +
  //           ", " +
  //           points[i].y.toFixed(2) +
  //           ")",
  //           0,
  //           0
  //         );
  //         ctx.restore();
  //       }
  //     }
  //   });
  // }
}

/**
 * Draw all the points on the canvas.
 */
function drawPoints() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  points.forEach((point) => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#ff9966"; // Faded orange color
    ctx.fill();
  });
}

/**
 * Display the coordinates of points in the canvas.
 */
function displayCoordinates() {
  var coordinatesDiv = document.getElementById("coordinates");
  coordinatesDiv.innerHTML = "<h2>Coordinates</h2>";
  for (var i = 0; i < points.length; i++) {
    coordinatesDiv.innerHTML +=
      "Point " +
      (i + 1) +
      ": (" +
      points[i].x.toFixed(2) +
      ", " +
      points[i].y.toFixed(2) +
      ")<br>";
  }
}

/**
 * Check if a point is part of the convex hull.
 * @param {Object} point - The point object with x and y coordinates.
 * @param {Array} hull - The array of points in the convex hull.
 * @returns {boolean} True if the point is in the hull, false otherwise.
 */
function isInHull(point, hull) {
  for (let i = 0; i < hull.length; i++) {
    if (hull[i].x === point.x && hull[i].y === point.y) {
      return true;
    }
  }
  return false;
}

/**
 * Implement the Jarvis March algorithm to find the convex hull.
 * @param {Array} points - The array of points.
 * @returns {Promise<Array>} A Promise that resolves to the array of points in the convex hull.
 */
async function jarvisMarch(points) {
  let delay = 400; // Delay in milliseconds
  let leftMostPoint = points[0];
  let leftMostIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x < leftMostPoint.x) {
      leftMostPoint = points[i];
      leftMostIndex = i;
    }
  }

  const hull = [];
  let currentPoint = leftMostPoint;
  let currentIndex = leftMostIndex;

  const originalStrokeStyle = ctx.strokeStyle;

  do {
    hull.push(currentPoint);
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.moveTo(hull[0].x, hull[0].y);
    for (let i = 1; i < hull.length; i++) {
      ctx.lineTo(hull[i].x, hull[i].y);
    }
    ctx.stroke();
    ctx.strokeStyle = originalStrokeStyle;

    let nextIndex = (currentIndex + 1) % points.length;

    minangle = nextIndex;

    for (let i = 0; i < points.length; i++) {
      if (i === currentIndex) continue; // Skip the current point

      ctx.strokeStyle = "green";
      ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      ctx.lineTo(points[minangle].x, points[minangle].y);
      ctx.stroke();
      ctx.strokeStyle = originalStrokeStyle;

      // Use cross product to determine the orientation of the three points
      const r = {
        x: points[nextIndex].x - currentPoint.x,
        y: points[nextIndex].y - currentPoint.y,
      };
      const q = {
        x: points[i].x - currentPoint.x,
        y: points[i].y - currentPoint.y,
      };
      const cross = r.x * q.y - r.y * q.x;
      if (
        cross > 0 ||
        (cross === 0 &&
          distance(points[i], currentPoint) >
            distance(points[nextIndex], currentPoint))
      ) {
        // linestodraw.push(points[onhull]);
        nextIndex = i;
        minangle = nextIndex;

        drawLineWithDelay(points[currentIndex], points[nextIndex], 0);
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        if (!isInHull(points[i], hull)) {
          // linestodraw.push(points[i]);
          drawLineWithDelay(points[currentIndex], points[i], 0);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // await new Promise(resolve => setTimeout(resolve, delay));

      clearCanvas();
      ctx.strokeStyle = "black";
      drawPoints();

      ctx.beginPath();
      // const originalStrokeStyle = ctx.strokeStyle;
      ctx.strokeStyle = "blue";
      ctx.moveTo(hull[0].x, hull[0].y);
      for (let i = 1; i < hull.length; i++) {
        ctx.lineTo(hull[i].x, hull[i].y);
      }
      // ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = originalStrokeStyle;
    }

    clearCanvas();
    ctx.strokeStyle = "black";
    drawPoints();
    currentPoint = points[nextIndex];

    currentIndex = nextIndex;
  } while (currentIndex !== leftMostIndex); // Stop when we return to the starting point

  return hull;
}

/**
 * Implement the Jarvis March algorithm to find the convex hull without animations.
 * @param {Array} points - The array of points.
 * @returns {Promise<Array>} A Promise that resolves to an array containing the convex hull, the leftmost point, and the index of the leftmost point.
 */
async function hullonly_jarvisMarch(points) {
  // let delay = 400; // Delay in milliseconds
  let leftMostPoint = points[0];
  let leftMostIndex = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].x < leftMostPoint.x) {
      leftMostPoint = points[i];
      leftMostIndex = i;
    }
  }

  const hull = [];
  let currentPoint = leftMostPoint;
  let currentIndex = leftMostIndex;

  const originalStrokeStyle = ctx.strokeStyle;

  do {
    hull.push(currentPoint);
    // ctx.beginPath();
    // ctx.strokeStyle = "blue";
    // ctx.moveTo(hull[0].x, hull[0].y);
    // for (let i = 1; i < hull.length; i++) {
    //   ctx.lineTo(hull[i].x, hull[i].y);
    // }
    // ctx.stroke();
    // ctx.strokeStyle = originalStrokeStyle;

    let nextIndex = (currentIndex + 1) % points.length;

    minangle = nextIndex;

    for (let i = 0; i < points.length; i++) {
      if (i === currentIndex) continue; // Skip the current point

      // ctx.strokeStyle = "green";
      // ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
      // ctx.lineTo(points[minangle].x, points[minangle].y);
      // ctx.stroke();
      // ctx.strokeStyle = originalStrokeStyle;

      // Use cross product to determine the orientation of the three points
      const r = {
        x: points[nextIndex].x - currentPoint.x,
        y: points[nextIndex].y - currentPoint.y,
      };
      const q = {
        x: points[i].x - currentPoint.x,
        y: points[i].y - currentPoint.y,
      };
      const cross = r.x * q.y - r.y * q.x;
      if (
        cross > 0 ||
        (cross === 0 &&
          distance(points[i], currentPoint) >
            distance(points[nextIndex], currentPoint))
      ) {
        // linestodraw.push(points[onhull]);
        nextIndex = i;
        minangle = nextIndex;

        // drawLineWithDelay(points[currentIndex], points[nextIndex], 0);
        // await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        if (!isInHull(points[i], hull)) {
          // linestodraw.push(points[i]);
          // drawLineWithDelay(points[currentIndex], points[i], 0);
          // await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }

      // await new Promise(resolve => setTimeout(resolve, delay));

      // clearCanvas();
      // ctx.strokeStyle = "black";
      // drawPoints();

      // ctx.beginPath();
      // // const originalStrokeStyle = ctx.strokeStyle;
      // ctx.strokeStyle = "blue";
      // ctx.moveTo(hull[0].x, hull[0].y);
      // for (let i = 1; i < hull.length; i++) {
      //   ctx.lineTo(hull[i].x, hull[i].y);
      // }
      // // ctx.closePath();
      // ctx.stroke();
      // ctx.strokeStyle = originalStrokeStyle;
    }

    // clearCanvas();
    // ctx.strokeStyle = "black";
    // drawPoints();
    currentPoint = points[nextIndex];

    currentIndex = nextIndex;
  } while (currentIndex !== leftMostIndex); // Stop when we return to the starting point

  return [hull, leftMostPoint, leftMostIndex];
}

/**
 * Recursive helper function for the Jarvis March algorithm with step-by-step visualization.
 * @param {Object} cur - The current point in the hull.
 * @param {number} cur_index - The index of the current point in the original points array.
 * @param {Array} points - The array of points.
 * @param {number} index - The index of the current step in the algorithm.
 * @param {Array} partial_hull - The array of points in the partial hull so far.
 * @returns {Promise<Array>} A Promise that resolves to an array containing the next current point, its index, and the updated partial hull.
 */
async function jarvisMarch_step(cur, cur_index, points, index, partial_hull) {
  let delay = 400; // Delay in milliseconds (adjust as needed)

  // const partial_hull = [];
  let currentPoint = cur;
  let currentIndex = cur_index;

  // const originalStrokeStyle = ctx.strokeStyle;

  // ctx.beginPath();
  // ctx.strokeStyle = "blue";
  // ctx.moveTo(partial_hull[0].x, partial_hull[0].y);
  // for (let i = 1; i < partial_hull.length; i++) {
  //   ctx.lineTo(partial_hull[i].x, partial_hull[i].y);
  // }
  // ctx.stroke();
  // ctx.strokeStyle = originalStrokeStyle;

  let nextIndex = (currentIndex + 1) % points.length;

  minangle = nextIndex;

  for (let i = 0; i < points.length; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "blue";
    // console.log(cur_hull);
    ctx.moveTo(partial_hull[0].x, partial_hull[0].y);
    for (let i = 1; i < partial_hull.length; i++) {
      ctx.lineTo(partial_hull[i].x, partial_hull[i].y);
    }
    ctx.stroke();
    ctx.strokeStyle = "black";

    if (i === currentIndex) continue; // Skip the current point

    ctx.strokeStyle = "green";
    ctx.moveTo(points[currentIndex].x, points[currentIndex].y);
    ctx.lineTo(points[minangle].x, points[minangle].y);
    ctx.stroke();
    ctx.strokeStyle = "black";

    // Use cross product to determine the orientation of the three points
    const r = {
      x: points[nextIndex].x - currentPoint.x,
      y: points[nextIndex].y - currentPoint.y,
    };
    const q = {
      x: points[i].x - currentPoint.x,
      y: points[i].y - currentPoint.y,
    };
    const cross = r.x * q.y - r.y * q.x;
    if (
      cross > 0 ||
      (cross === 0 &&
        distance(points[i], currentPoint) >
          distance(points[nextIndex], currentPoint))
    ) {
      // linestodraw.push(points[onhull]);
      nextIndex = i;
      minangle = nextIndex;

      drawLineWithDelay(points[currentIndex], points[nextIndex], 0);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } else {
      if (!isInHull(points[i], partial_hull)) {
        // linestodraw.push(points[i]);
        drawLineWithDelay(points[currentIndex], points[i], 0);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
    clearCanvas();
    ctx.strokeStyle = "black";
    drawPoints();
  }
  // await new Promise(resolve => setTimeout(resolve, delay));

  // clearCanvas();
  // ctx.strokeStyle = "black";
  // drawPoints();

  // ctx.beginPath();
  // // const originalStrokeStyle = ctx.strokeStyle;
  // ctx.strokeStyle = "blue";
  // ctx.moveTo(hull[0].x, hull[0].y);
  // for (let i = 1; i < hull.length; i++) {
  //   ctx.lineTo(hull[i].x, hull[i].y);
  // }
  // // ctx.closePath();
  // ctx.stroke();
  // ctx.strokeStyle = originalStrokeStyle;
  // }

  clearCanvas();
  ctx.strokeStyle = "black";
  drawPoints();

  // ind_to_return = currentIndex;
  // pt_to_return = currentPoint;

  currentPoint = points[nextIndex];

  partial_hull.push(currentPoint);

  currentIndex = nextIndex;

  console.log(partial_hull);

  return [currentPoint, currentIndex, partial_hull];
}

/**
 * Generate random points and draw them on the canvas.
 * @param {number} n - The number of random points to generate.
 */
function generate_random_points(n) {
  points = [];
  for (var i = 0; i < n; i++) {
    var x = Math.floor(Math.random() * 1000);
    var y = Math.floor(Math.random() * 500);
    points.push({ x, y });
  }
  clearCanvas();
  drawPoints();
  displayCoordinates();
}

/**
 * Take input points from a file and draw them on the canvas.
 */
function takePointsInput() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".txt";

  input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    const reader = new FileReader(); //this is a file reader object

    reader.onload = function (e) {
      //this
      const contents = e.target.result;
      const lines = contents.split("\n");
      points = [];
      for (let i = 0; i < lines.length; i++) {
        const [x, y] = lines[i].split(" ").map(Number);
        points.push({ x, y });
        clearCanvas();
        drawPoints();
        displayCoordinates();
      }
      console.log(points);
    };

    reader.readAsText(file); //this will read the file as text
  });

  input.click(); //this will trigger the file upload dialog
}

/**
 * Calculate the Euclidean distance between two points.
 * @param {Object} p1 - The first point object with x and y coordinates.
 * @param {Object} p2 - The second point object with x and y coordinates.
 * @returns {number} The Euclidean distance between the two points.
 */
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * Implement the Kirk-Patrick-Seidel algorithm to find the convex hull.
 * @param {Array} points - The array of points.
 * @returns {Array} The array of points in the convex hull.
 */
function KPS(points) {
  console.log(points);
  if (points.length < 4) {
    return points;
  }

  var upper_hull = callUpperHull(Array.from(points));
  var new_pts = flipped(Array.from(points));
  var lower_hull = flipped(callUpperHull(Array.from(new_pts)));

  console.log(upper_hull);
  console.log(lower_hull);

  if (
    upper_hull[upper_hull.length - 1].x === lower_hull[0].x &&
    upper_hull[upper_hull.length - 1].y === lower_hull[0].y
  ) {
    upper_hull.pop();
  }
  if (
    upper_hull[0].x === lower_hull[lower_hull.length - 1].x &&
    upper_hull[0].y === lower_hull[lower_hull.length - 1].y
  ) {
    lower_hull.pop();
  }

  if (upper_hull[0].x === lower_hull[lower_hull.length - 1].x) {
    kps_hull_steps.push([upper_hull[0], lower_hull[lower_hull.length - 1]]);
  }
  if (lower_hull[0].x === upper_hull[upper_hull.length - 1].x) {
    kps_hull_steps.push([lower_hull[0], upper_hull[upper_hull.length - 1]]);
  }
  return [...upper_hull, ...lower_hull];
}

/**
 * Find the upper hull of a set of points using the Kirk-Patrick-Seidel algorithm.
 * @param {Array} points - The array of points.
 * @returns {Array} The upper hull of the points.
 */
function callUpperHull(points) {
  console.log(points);
  //find pumin, plmin, pumax, plmax
  var pumin = points[0];
  var plmin = points[0];
  var pumax = points[0];
  var plmax = points[0];

  for (var i = 1; i < points.length; i++) {
    if (points[i].x < pumin.x) {
      pumin = points[i];
      plmin = points[i];
    } else if (points[i].y > pumin.y && points[i].x === pumin.x) {
      pumin = points[i];
    } else if (points[i].y < plmin.y && points[i].x === pumin.x) {
      plmin = points[i];
    }

    if (points[i].x > pumax.x) {
      pumax = points[i];
      plmax = points[i];
    } else if (points[i].y > pumax.y && points[i].x === pumax.x) {
      pumax = points[i];
    } else if (points[i].y < plmax.y && points[i].x === pumax.x) {
      plmax = points[i];
    }
  }

  var T_upper = [];
  console.log(pumin);
  console.log(pumax);
  T_upper.push(pumin);
  T_upper.push(pumax);
  console.log(T_upper);
  var temp = [];
  for (var i = 0; i < points.length; i++) {
    if (points[i].x < pumax.x && points[i].x > pumin.x) {
      T_upper.push(points[i]);
    }
  }
  console.log(Array.from(T_upper));
  return UpperHull(pumin, pumax, Array.from(T_upper));
}

/**
 * Recursive helper function for finding the upper hull.
 * @param {Object} pmin - The leftmost point.
 * @param {Object} pmax - The rightmost point.
 * @param {Array} T - The subset of points between pmin and pmax.
 * @returns {Array} The upper hull of the points in T.
 */
function UpperHull(pmin, pmax, T) {
  console.log(T);
  if (T.length <= 2) {
    if (T.length == 2) {
      if (T[0].x < T[1].x) {
        kps_hull_steps.push(T);
      } else {
        kps_hull_steps.push(T.reverse());
      }
    }
    return T;
  }
  var a = findMedian(Array.from(T));
  console.log(a);
  pl_pr_array = UpperBridge(Array.from(T), a);
  console.log(pl_pr_array);
  kps_hull_steps.push(pl_pr_array);
  console.log(kps_hull_steps);
  var pl = pl_pr_array[0];
  var pr = pl_pr_array[1];

  //finding points of T_left to the left of line through pl and pmin
  var T_left2 = [];
  T_left2.push(pl);
  for (var i = 0; i < T.length; i++) {
    if (T[i].x < pl.x) {
      T_left2.push(T[i]);
    }
  }
  //finding points of T_right to the right of line through pr and pmax
  var T_right2 = [];
  T_right2.push(pr);
  console.log(pr);
  for (var i = 0; i < T.length; i++) {
    if (T[i].x > pr.x) {
      T_right2.push(T[i]);
    }
  }
  let ans = [];

  console.log(T_left2);
  console.log(T_right2);

  var upper_hull_left = [];
  var upper_hull_right = [];
  if (pl === pmin) {
    console.log("OOOOO");
    upper_hull_left.push(pl);
  } else {
    console.log("hi");
    upper_hull_left = UpperHull(pmin, pl, Array.from(T_left2));
    console.log("hello");
  }
  console.log(T_right2);
  if (pr === pmax) {
    console.log("*******");
    upper_hull_right.push(pr);
  } else {
    console.log("GG");
    console.log(pr);
    upper_hull_right = UpperHull(pr, pmax, Array.from(T_right2));
    console.log("HH");
  }
  console.log(upper_hull_left);
  console.log("length is ", upper_hull_left.length);
  console.log(upper_hull_right);
  console.log("LENGTH R is ", upper_hull_right.length);

  ans = [...upper_hull_left, ...upper_hull_right];
  console.log(ans);
  console.log("ANS len is ", ans.length);

  return ans;
}

/**
 * Find the median x-coordinate of an array of points.
 * @param {Array} arr - The array of points.
 * @returns {number} The median x-coordinate.
 */
function findMedian(arr) {
  arr.sort((a, b) => a.x - b.x);
  const middleIndex = Math.floor(arr.length / 2);
  // console.log(arr);
  if (arr.length % 2 === 0) {
    return (arr[middleIndex - 1].x + arr[middleIndex].x) / 2;
  } else {
    return arr[middleIndex].x;
  }
}

/**
 * Find the bridge points for the upper hull.
 * @param {Array} S - The set of points.
 * @param {number} L - The median x-coordinate.
 * @returns {Array} The left and right bridge points.
 */
function UpperBridge(S, L) {
  var candidates = [];
  // console.log(candidates);
  var ans = [];
  // console.log(S);
  // console.log(S.length);
  if (S.length < 2) {
    return S;
  }
  if (S.length === 2) {
    if (S[0].x <= S[1].x) {
      ans.push(S[0]);
      ans.push(S[1]);
    } else {
      ans.push(S[1]);
      ans.push(S[0]);
    }
    return ans;
  }
  var check = 0;
  if (S.length % 2) {
    check = 1;
    candidates.push(S[0]);
  }

  var pairs = [];
  for (var i = check; i < S.length; i += 2) {
    if (S[i].x <= S[i + 1].x) {
      pairs.push([S[i], S[i + 1]]);
    } else {
      pairs.push([S[i + 1], S[i]]);
    }
  }
  console.log(pairs);
  var slopes = [];

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    if (pair[0].x === pair[1].x) {
      if (pair[0].y > pair[1].y) {
        candidates.push(pair[0]);
      } else {
        candidates.push(pair[1]);
      }
      pairs.splice(i, 1);
      i--;
    }
  }
  pairs.forEach((pair) => {
    if (pair[0].x === pair[1].x) {
      if (pair[0].y > pair[1].y) {
        candidates.push(pair[0]);
      } else {
        candidates.push(pair[1]);
      }
    } else {
      var k = (pair[0].y - pair[1].y) / (pair[0].x - pair[1].x);
      slopes.push(k);
    }
  });
  var median_k = findMedianSlope(slopes);
  console.log("median slopes of pairs is " + median_k);
  var small = [];
  var large = [];
  var equal = [];

  pairs.forEach((pair) => {
    var k = (pair[0].y - pair[1].y) / (pair[0].x - pair[1].x);
    if (k < median_k) small.push(pair);
    else if (k === median_k) equal.push(pair);
    else large.push(pair);
  });

  var pk = S[0];
  var pm = S[0];
  var max = S[0].y - median_k * S[0].x;
  for (var i = 1; i < S.length; i++) {
    if (max < S[i].y - median_k * S[i].x) {
      max = S[i].y - median_k * S[i].x;
      pk = S[i];
      console.log(pk);
      pm = S[i];
    }
  }

  console.log(pk);
  console.log(pm);

  console.log(max);

  var tolerance = 0.000001;

  for (var i = 0; i < S.length; i++) {
    var difference = Math.abs(max - (S[i].y - median_k * S[i].x));
    if (difference < tolerance) {
      console.log("KKKKK");
      if (S[i].x < pk.x) pk = S[i];
      if (S[i].x > pm.x) pm = S[i];
    }
  }

  console.log(pk);
  console.log(pm);
  console.log(L);

  if (pk.x <= L && pm.x > L) {
    ans.push(pk);
    ans.push(pm);
    return ans;
  }

  console.log(small);
  console.log(equal);
  console.log(large);
  console.log(candidates);
  if (pm.x <= L) {
    for (const ele of small) {
      const first = ele[0];
      const second = ele[1];
      console.log(first);
      console.log(second);
      candidates.push(first);
      console.log(candidates);
      candidates.push(second);
    }
    for (const ele of large) {
      candidates.push(ele[1]);
    }
    for (const ele of equal) {
      console.log(ele[0]);
      candidates.push(ele[1]);
    }
  }

  if (pk.x > L) {
    for (const ele of small) {
      candidates.push(ele[0]);
    }
    for (const ele of large) {
      candidates.push(ele[0], ele[1]);
    }
    for (const ele of equal) {
      candidates.push(ele[0]);
    }
  }
  console.log(candidates);
  // const cloned = [...candidates];
  // candidates = [];
  return UpperBridge(Array.from(candidates), L);
}

/**
 * Find the median slope of an array of slopes.
 * @param {Array} arr - The array of slopes.
 * @returns {number} The median slope.
 */
function findMedianSlope(arr) {
  if (arr.length === 0) return null;

  function findMedian(arr) {
    arr.sort((a, b) => a - b);
    const middleIndex = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? arr[middleIndex - 1] : arr[middleIndex];
  }

  function partition(arr, left, right, pivotIndex) {
    const pivotValue = arr[pivotIndex];
    let storeIndex = left;

    [arr[pivotIndex], arr[right]] = [arr[right], arr[pivotIndex]];

    for (let i = left; i < right; i++) {
      if (arr[i] < pivotValue) {
        [arr[i], arr[storeIndex]] = [arr[storeIndex], arr[i]];
        storeIndex++;
      }
    }

    [arr[right], arr[storeIndex]] = [arr[storeIndex], arr[right]];

    return storeIndex;
  }

  function findMedianOfMedians(arr) {
    const n = arr.length;
    const groupSize = 5;

    if (n <= groupSize) return findMedian(arr);

    const numGroups = Math.ceil(n / groupSize);
    const medians = [];

    for (let i = 0; i < numGroups; i++) {
      const group = arr.slice(i * groupSize, (i + 1) * groupSize);
      medians.push(findMedian(group));
    }

    return findMedianOfMedians(medians);
  }

  const medianOfMedians = findMedianOfMedians(arr);
  return medianOfMedians;
}

/**
 * Flip the points about the origin.
 * @param {Array} points - The array of points.
 * @returns {Array} The flipped array of points.
 */
function flipped(points) {
  var new_pts = [];
  for (var i = 0; i < points.length; i++) {
    var x = points[i].x * -1;
    var y = points[i].y * -1;
    new_pts.push({ x, y });
  }
  return new_pts;
}

/**
 * Draws a line between two points with a delay effect.
 * @param {Object} start - The starting point coordinates {x, y}.
 * @param {Object} end - The ending point coordinates {x, y}.
 * @param {number} delay - The delay time in milliseconds.
 */
function drawLineWithDelay(start, end, delay) {
  const totalFrames = 10000;
  const dx = (end.x - start.x) / totalFrames;
  const dy = (end.y - start.y) / totalFrames;
  let frameCount = 0;

  const startTime = performance.now();

  const animateFrame = (timestamp) => {
    const elapsedTime = timestamp - startTime;
    const progress = Math.min(elapsedTime / delay, 1);

    if (progress < 1) {
      const x = start.x + dx * frameCount;
      const y = start.y + dy * frameCount;

      ctx.shadowColor = "rgba(0, 0, 0, 0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff9966";
      ctx.fill();

      ctx.shadowColor = "rgba(0, 0, 0, 0)";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.beginPath();
      ctx.arc(x, y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#ff9966";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(x, y);
      ctx.strokeStyle = "#888";
      ctx.stroke();

      frameCount++;
      requestAnimationFrame(animateFrame);
    } else {
      ctx.beginPath();
      ctx.arc(start.x, start.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#f03d07";
      ctx.fill();

      ctx.beginPath();
      ctx.arc(end.x, end.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "#f03d07";
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.strokeStyle = "#888";
      ctx.stroke();
    }
  };

  requestAnimationFrame(animateFrame);
}

/**
 * Clears the canvas.
 */
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // points = [];
}

/**
 * Skips animations and displays the convex hull.
 */
async function skip_animations() {
  let hull;
  if (flag === 0) {
    drawPoints();
    let hull_X = await hullonly_jarvisMarch(points);
    hull = hull_X[0];
    console.log(hull);
    clearCanvas();
    drawPoints();
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    ctx.save();
    ctx.translate(hull[0].x + 10, hull[0].y + 10);
    ctx.scale(1, -1);
    ctx.fillStyle = "#555"; // Dark gray color
    ctx.textAlign = "start";
    ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText(
      "(" + hull[0].x.toFixed(2) + ", " + hull[0].y.toFixed(2) + ")",
      0,
      0
    );
    ctx.restore();
    for (let i = 1; i < hull.length; i++) {
      ctx.lineTo(hull[i].x, hull[i].y);
      //adding code to display coordinates of points on hull
      ctx.save();
      ctx.translate(hull[i].x + 10, hull[i].y + 10);
      ctx.scale(1, -1);
      ctx.fillStyle = "#555"; // Dark gray color
      ctx.textAlign = "start";
      ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      ctx.fillText(
        "(" + hull[i].x.toFixed(2) + ", " + hull[i].y.toFixed(2) + ")",
        0,
        0
      );
      ctx.restore();
    }
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "black";
  } else {
    drawPoints();
    hull = KPS(points);
    clearCanvas();
    drawPoints();
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    ctx.save();
    ctx.translate(hull[0].x + 10, hull[0].y + 10);
    ctx.scale(1, -1);
    ctx.fillStyle = "#555"; // Dark gray color
    ctx.textAlign = "start";
    ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText(
      "(" + hull[0].x.toFixed(2) + ", " + hull[0].y.toFixed(2) + ")",
      0,
      0
    );
    ctx.restore();
    for (let i = 1; i < hull.length; i++) {
      ctx.lineTo(hull[i].x, hull[i].y);
      //adding code to display coordinates of points on hull
      ctx.save();
      ctx.translate(hull[i].x + 10, hull[i].y + 10);
      ctx.scale(1, -1);
      ctx.fillStyle = "#555"; // Dark gray color
      ctx.textAlign = "start";
      ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      ctx.fillText(
        "(" + hull[i].x.toFixed(2) + ", " + hull[i].y.toFixed(2) + ")",
        0,
        0
      );
      ctx.restore();
    }
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "black";
  }
}

/**
 * Displays the convex hull with animations.
 */
async function hull_do() {
  kps_hull_steps = [];
  console.log(flag);
  let hull;

  if (flag == 0) {
    // hull = jarvisMarch(points);
    drawPoints();
    hull = await jarvisMarch(points);
    // console.log(hull);
    clearCanvas();

    drawPoints();
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.moveTo(hull[0].x, hull[0].y);
    ctx.save();
    ctx.translate(hull[0].x + 10, hull[0].y + 10);
    ctx.scale(1, -1);
    ctx.fillStyle = "#555"; // Dark gray color
    ctx.textAlign = "start";
    ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    ctx.fillText(
      "(" + hull[0].x.toFixed(2) + ", " + hull[0].y.toFixed(2) + ")",
      0,
      0
    );
    ctx.restore();
    for (let i = 1; i < hull.length; i++) {
      ctx.lineTo(hull[i].x, hull[i].y);
      //adding code to display coordinates of points on hull
      ctx.save();
      ctx.translate(hull[i].x + 10, hull[i].y + 10);
      ctx.scale(1, -1);
      ctx.fillStyle = "#555"; // Dark gray color
      ctx.textAlign = "start";
      ctx.font = "16px 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
      ctx.fillText(
        "(" + hull[i].x.toFixed(2) + ", " + hull[i].y.toFixed(2) + ")",
        0,
        0
      );
      ctx.restore();
    }
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "black";
  } else {
    hull = KPS(points);
    kps_visualisation();
    clearCanvas();
    drawPoints();
  }
}

let index, hull, cur, cur_index;
let cur_hull = [];

/**
 * Performs one step of Jarvis March algorithm to compute convex hull.
 */
async function jarvis_march_hull_step() {
  if (index === undefined) {
    index = 0;
  }

  if (index === 0) {
    if (flag === 0) {
      x = await hullonly_jarvisMarch(points);
      console.log(x);
      hull = x[0];
      cur = x[1];
      cur_index = x[2];
      console.log(hull);
      console.log(cur);
      console.log(cur_index);
      cur_hull.push(cur);
      index++;
    }
  } else if (index <= hull.length) {
    // drawLineWithDelay(hull[index - 1], hull[index], 100);
    y = await jarvisMarch_step(cur, cur_index, points, index, cur_hull);
    cur = y[0];
    cur_index = y[1];
    cur_hull = y[2];

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    console.log(cur_hull);
    ctx.moveTo(cur_hull[0].x, cur_hull[0].y);
    for (let i = 1; i < cur_hull.length; i++) {
      ctx.lineTo(cur_hull[i].x, cur_hull[i].y);
    }
    ctx.stroke();
    ctx.strokeStyle = "black";

    index++;
  }

  // else if (index === hull.length) {
  //   // drawLineWithDelay(hull[hull.length - 1], hull[0], 100);
  //   index++;
  // }
  else {
    // Finished drawing the hull
    clearCanvas();
    drawPoints();
    index = undefined; // Reset for next call
  }
}

/**
 * Performs one step of convex hull computation.
 */
function hull_do_step() {
  if (flag === 0) {
    jarvis_march_hull_step();
  } else {
    kps_by_step();
  }
}

/**
 * Clears the canvas and resets the state.
 */
function hull_clear() {
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  points = [];
  //clear the points
  document.getElementById("coordinates").innerHTML = "";
  index = undefined;
  //reload page
  location.reload();
}

/**
 * Visualizes the KPS (Kirkpatrick-Seidel) convex hull computation.
 */
function kps_visualisation() {
  for (var i = 0; i < kps_hull_steps.length; i++) {
    (function (i) {
      setTimeout(function () {
        drawLineWithDelay(
          {
            x: Math.abs(kps_hull_steps[i][0].x),
            y: Math.abs(kps_hull_steps[i][0].y),
          },
          {
            x: Math.abs(kps_hull_steps[i][1].x),
            y: Math.abs(kps_hull_steps[i][1].y),
          },
          100
        );
      }, i * 1000);
    })(i);
  }
}

/**
 * Performs one step of Kirkpatrick-Seidel (KPS) algorithm to compute convex hull.
 */
function kps_by_step() {
  let hull;
  if (index === undefined) {
    index = 0;
  }
  if (index === 0) {
    kps_hull_steps = [];
    hull = KPS(points);
    console.log(hull);
    console.log(kps_hull_steps);
    index++;
  } else if (index <= kps_hull_steps.length) {
    drawLineWithDelay(
      {
        x: Math.abs(kps_hull_steps[index - 1][0].x),
        y: Math.abs(kps_hull_steps[index - 1][0].y),
      },
      {
        x: Math.abs(kps_hull_steps[index - 1][1].x),
        y: Math.abs(kps_hull_steps[index - 1][1].y),
      },
      100
    );
    index++;
  } else {
    // Finished drawing the hull
    clearCanvas();
    drawPoints();
    index = undefined; // Reset for next call
  }
}
