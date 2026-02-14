const PLANK_LENGTH = 400;             // plank length
const PIVOT_X = PLANK_LENGTH / 2;     // pivot position (center of the plank)
const MAX_ANGLE = 30;                 // maximum tilt
const TORQUE_DIVISOR = 10;            // tilt sensitivity

// Each object has: { x: position on the plank, weight: 1–10 }
const objects = [];

// First upcoming weight
let nextWeight = generateWeight();

// Current angle of the plank
let currentAngle = 0;

// Random weight between 1 and 10
function generateWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

// New weight object
function createWeightElement(weight, x) {
  const weightEl = document.createElement("div");
  weightEl.classList.add("weight");
  weightEl.textContent = weight;
  weightEl.style.left = x + "px"; 
  plank.appendChild(weightEl);
}

// The torque is calculated as: torque = weight * distance (distance from the pivot)
function calculateTotals() {
  let leftTorque = 0;
  let rightTorque = 0;
  let leftSum = 0;
  let rightSum = 0;

  // Loop through all objects and calculate their torque contribution
  for (const obj of objects) {
    const distance = Math.abs(obj.x - PIVOT_X);  // Calculate distance from pivot

    // If the object is on the left side of the pivot (x < pivot)
    if (obj.x < PIVOT_X) {
      leftSum += obj.weight;                  // Add to the left sum
      leftTorque += obj.weight * distance;    // Add to the left torque
    } else {
      rightSum += obj.weight;                 // Add to the right sum
      rightTorque += obj.weight * distance;   // Add to the right torque
    }
  }

  return { leftSum, rightSum, leftTorque, rightTorque };
}

// The formula is (capped at 30): angle = (rightTorque - leftTorque) / TORQUE_DIVISOR
function calculateAngle(leftTorque, rightTorque) {
  const rawAngle = (rightTorque - leftTorque) / TORQUE_DIVISOR; 
  const clampedAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, rawAngle)); 
  
  return Math.round(clampedAngle);
}

function applyTilt(angleDeg) {
  currentAngle = angleDeg;
  // Rotates the plank around the pivot (center)
  plank.style.transform = `translateX(-50%) rotate(${angleDeg}deg)`;
  
  // Counter-rotate all weight elements to keep them upright
  const weights = plank.querySelectorAll('.weight');
  weights.forEach(weight => {
    weight.style.transform = `translateX(-50%) rotate(${-angleDeg}deg)`;
  });
}


plank.addEventListener("click", function(event) {
  const rect = plank.getBoundingClientRect();
  
  // Plank center position in screen coordinates
  const plankCenterX = rect.left + rect.width / 2;
  const plankCenterY = rect.top + rect.height / 2;
  
  // Click position relative to plank center
  const relativeX = event.clientX - plankCenterX;
  const relativeY = event.clientY - plankCenterY;
  
  // Apply inverse rotation to get the actual position on the unrotated plank
  const angleRad = (-currentAngle * Math.PI) / 180;
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);
  
  // Reverse rotate the click position to get the unrotated coordinates
  const unrotatedX = relativeX * cosAngle - relativeY * sinAngle;
  
  // Convert back to plank coordinates (0 to PLANK_LENGTH)
  const x = Math.max(0, Math.min(PLANK_LENGTH, unrotatedX + PIVOT_X));

  const weight = generateWeight();

  // Store the new object (position and weight)
  objects.push({ x: x, weight: weight });

  // Visual element for the new object at the correct position
  createWeightElement(weight, x);

  // Recalculate the total torques and weights
  const { leftSum, rightSum, leftTorque, rightTorque } = calculateTotals();

  // Calculate the tilt angle based on torques
  const angle = calculateAngle(leftTorque, rightTorque);

  // Apply the tilt to the plank
  applyTilt(angle);

  // Generate the next random weight for the next click
  nextWeight = generateWeight();
});
