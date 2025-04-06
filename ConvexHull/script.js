const canvas = document.getElementById("convexHullCanvas");
const ctx = canvas.getContext("2d");
const instructions = document.getElementById("instructions");
const clearButton = document.getElementById("clearButton");

let points = []; // Equivalent to Dot_table, storing objects {x: number, y: number}
let hullLines = []; // Stores lines {p1: point, p2: point} of the convex hull
let leftmostIndex = -1;
let rightmostIndex = -1;

// --- Drawing Functions ---

function drawPoint(point, color = "red", radius = 3) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLine(p1, p2, color = "blue", lineWidth = 2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

function redrawCanvas() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw all points
  points.forEach((p) => drawPoint(p));

  // Highlight leftmost and rightmost points (optional)
  if (leftmostIndex !== -1) drawPoint(points[leftmostIndex], "orange", 5);
  if (rightmostIndex !== -1) drawPoint(points[rightmostIndex], "purple", 5);

  // Draw hull lines
  hullLines.forEach((line) => drawLine(line.p1, line.p2));
}

// --- Event Handlers ---

canvas.addEventListener("click", (event) => {
  // Left Click
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const newPoint = { x: x, y: y };
  const currentIndex = points.length; // Index before pushing

  points.push(newPoint);

  // Update leftmost and rightmost points
  if (currentIndex === 0) {
    leftmostIndex = 0;
    rightmostIndex = 0;
  } else {
    if (newPoint.x < points[leftmostIndex].x) {
      leftmostIndex = currentIndex;
    }
    if (newPoint.x > points[rightmostIndex].x) {
      rightmostIndex = currentIndex;
    }
  }

  hullLines = []; // Clear previous hull lines when adding a new point
  redrawCanvas();
  // console.log(`Added point ${currentIndex}: (${x}, ${y})`);
  // console.log(`Leftmost: ${leftmostIndex}, Rightmost: ${rightmostIndex}`);
});

canvas.addEventListener("contextmenu", (event) => {
  // Right Click
  event.preventDefault(); // Prevent default context menu
  if (points.length < 3) {
    alert("需要至少 3 個點才能計算 Convex Hull。");
    return;
  }
  console.log("Calculating Convex Hull...");
  calculateQuickHull();
  redrawCanvas(); // Redraw to show the hull
});

clearButton.addEventListener("click", () => {
  points = [];
  hullLines = [];
  leftmostIndex = -1;
  rightmostIndex = -1;
  redrawCanvas();
  console.log("Cleared all points.");
});

// --- QuickHull Algorithm ---

// Helper function: Calculate signed distance from point p to line defined by p1->p2
// > 0 if p is "left" or "above" the directed line p1->p2
// < 0 if p is "right" or "below"
// = 0 if p is on the line
function pointLineDistance(p, p1, p2) {
  // Using the determinant/cross-product approach
  // (x2 - x1)(y - y1) - (y2 - y1)(x - x1)
  return (p2.x - p1.x) * (p.y - p1.y) - (p2.y - p1.y) * (p.x - p1.x);
}

// Recursive part of QuickHull
// Finds the point furthest from the line (p1, p2) among the points in pointSetIndices,
// on the specified 'side' (1 for above/left, -1 for below/right).
function findHullRecursive(p1Index, p2Index, pointSetIndices, side) {
  let maxDist = 0;
  let furthestPointIndex = -1;
  const p1 = points[p1Index];
  const p2 = points[p2Index];

  // Find the point furthest from the line segment (p1, p2) on the correct side
  pointSetIndices.forEach((index) => {
    const p = points[index];
    const dist = pointLineDistance(p, p1, p2);

    // Check if the point is strictly on the required side (side * dist > 0)
    // and if it's the furthest found so far on that side.
    if (side * dist > 0 && side * dist > maxDist) {
      maxDist = side * dist;
      furthestPointIndex = index;
    }
  });

  if (furthestPointIndex !== -1) {
    // Found a point forming a triangle (p1, furthestPoint, p2)
    const pFurthest = points[furthestPointIndex];

    // Filter points for the next recursive calls based on the *new* lines
    const pointsForP1PFurthest = [];
    const pointsForPFurthestP2 = [];

    pointSetIndices.forEach((index) => {
      if (index === furthestPointIndex) return; // Skip the furthest point itself

      const p = points[index];
      // Check side relative to line p1 -> pFurthest
      if (side * pointLineDistance(p, p1, pFurthest) > 0) {
        pointsForP1PFurthest.push(index);
      }
      // Check side relative to line pFurthest -> p2
      else if (side * pointLineDistance(p, pFurthest, p2) > 0) {
        pointsForPFurthestP2.push(index);
      }
    });

    // Recursively find hull points for the two new edges
    findHullRecursive(p1Index, furthestPointIndex, pointsForP1PFurthest, side);
    findHullRecursive(furthestPointIndex, p2Index, pointsForPFurthestP2, side);
  } else {
    // Base case: No points are further out on this 'side' of the line (p1, p2).
    // Therefore, the line segment (p1, p2) is part of the convex hull.
    hullLines.push({ p1: p1, p2: p2 });
  }
}

// Main function to initiate QuickHull
function calculateQuickHull() {
  if (points.length < 3 || leftmostIndex === -1 || rightmostIndex === -1) {
    hullLines = []; // Clear previous hull if not enough points
    return;
  }

  hullLines = []; // Reset hull lines before calculation

  const pLeft = points[leftmostIndex];
  const pRight = points[rightmostIndex];

  const upperSetIndices = []; // Indices of points potentially above the line (pLeft, pRight)
  const lowerSetIndices = []; // Indices of points potentially below the line (pLeft, pRight)

  // Partition points into upper and lower sets relative to the line connecting
  // the leftmost and rightmost points.
  for (let i = 0; i < points.length; i++) {
    if (i === leftmostIndex || i === rightmostIndex) continue; // Skip endpoints

    const p = points[i];
    const dist = pointLineDistance(p, pLeft, pRight);

    if (dist > 0) {
      // Point is "above" or "left" of pLeft -> pRight
      upperSetIndices.push(i);
    } else if (dist < 0) {
      // Point is "below" or "right" of pLeft -> pRight
      lowerSetIndices.push(i);
    }
    // Points exactly on the line are initially ignored for the recursion,
    // but the segment (pLeft, pRight) itself will be added if no points
    // exist strictly above or below it in the respective recursive calls.
  }

  // Find the upper hull recursively
  // We look for points "above" (side = 1) the line segment from Leftmost to Rightmost
  findHullRecursive(leftmostIndex, rightmostIndex, upperSetIndices, 1);

  // Find the lower hull recursively
  // We look for points "below" (side = -1) the line segment from Leftmost to Rightmost
  // Note: The original C++ code had separate upper_hull and lower_hull functions,
  // but a single recursive function with a 'side' parameter is more common and cleaner.
  // We search relative to the *same* initial line Left->Right, but look on the opposite side.
  findHullRecursive(leftmostIndex, rightmostIndex, lowerSetIndices, -1);

  console.log(`Hull calculation complete. Found ${hullLines.length} segments.`);
}

// Initial draw (if any points were pre-defined, or just to set up)
redrawCanvas();
