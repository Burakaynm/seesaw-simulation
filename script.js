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

// Preview weight element
let previewWeight = null;

// Random weight between 1 and 10
function generateWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

// Create weight legend
function createLegend() {
  const legendContainer = document.getElementById('legend-weights');
  
  for (let weight = 1; weight <= 10; weight++) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    
    const circle = document.createElement('div');
    const size = 20 + weight * 2;
    const hue = (weight - 1) * 36;
    
    circle.style.width = size + 'px';
    circle.style.height = size + 'px';
    circle.style.borderRadius = '50%';
    circle.style.background = `hsl(${hue}, 85%, 40%)`;
    circle.style.display = 'flex';
    circle.style.justifyContent = 'center';
    circle.style.alignItems = 'center';
    circle.style.color = 'white';
    circle.style.fontWeight = 'bold';
    circle.style.fontSize = (10 + weight) + 'px';
    circle.textContent = weight;
    
    item.appendChild(circle);
    legendContainer.appendChild(item);
  }
}

// Initialize legend on page load
createLegend();

// Update info panel
function updateInfoPanel() {
  // Update next weight circle
  const circle = document.getElementById('next-weight-circle');
  const size = 20 + nextWeight * 2;
  const hue = (nextWeight - 1) * 36;
  
  circle.style.width = size + 'px';
  circle.style.height = size + 'px';
  circle.style.background = `hsl(${hue}, 85%, 40%)`;
  circle.textContent = nextWeight;
  circle.style.fontSize = (10 + nextWeight) + 'px';
  
  document.getElementById('current-angle').textContent = currentAngle + '°';
  
  // Calculate totals for left and right
  let leftTotal = 0;
  let rightTotal = 0;
  
  for (const obj of objects) {
    if (obj.x < PIVOT_X) {
      leftTotal += obj.weight;
    } else if (obj.x > PIVOT_X) {
      rightTotal += obj.weight;
    }
  }
  
  document.getElementById('left-total').textContent = leftTotal + ' kg';
  document.getElementById('right-total').textContent = rightTotal + ' kg';
}

// Initial update
updateInfoPanel();

function getPlankPosition(event) {
  const rect = plank.getBoundingClientRect();
  
  // Plank center position in screen coordinates
  const plankCenterX = rect.left + rect.width / 2;
  const plankCenterY = rect.top + rect.height / 2;
  
  // Mouse position relative to plank center
  const relativeX = event.clientX - plankCenterX;
  const relativeY = event.clientY - plankCenterY;
  
  // Apply inverse rotation to get the actual position on the unrotated plank
  const angleRad = (-currentAngle * Math.PI) / 180;
  const cosAngle = Math.cos(angleRad);
  const sinAngle = Math.sin(angleRad);
  
  const unrotatedX = relativeX * cosAngle - relativeY * sinAngle;
  return Math.max(0, Math.min(PLANK_LENGTH, unrotatedX + PIVOT_X));
}

plank.addEventListener("mousemove", function(event) {
  const x = getPlankPosition(event);
  
  // Remove old preview if exists
  if (previewWeight) {
    previewWeight.remove();
  }
  
  // Create new preview weight
  const weight = nextWeight;
  previewWeight = document.createElement("div");
  previewWeight.classList.add("weight", "preview");
  previewWeight.textContent = weight;
  previewWeight.style.left = x + "px";
  
  const size = 20 + weight * 2;
  previewWeight.style.width = size + "px";
  previewWeight.style.height = size + "px";
  
  const fontSize = 10 + weight;
  previewWeight.style.fontSize = fontSize + "px";
  
  const hue = (weight - 1) * 36;
  previewWeight.style.background = `hsl(${hue}, 85%, 40%)`;
  
  // Calculate what would happen if this weight was added
  const distance = Math.abs(x - PIVOT_X);
  const torque = weight * distance;
  
  // Get current torques
  const { leftTorque, rightTorque } = calculateTotals();
  
  // Calculate new torques with preview weight
  let newLeftTorque = leftTorque;
  let newRightTorque = rightTorque;
  if (x < PIVOT_X) {
    newLeftTorque += torque;
  } else if (x > PIVOT_X) {
    newRightTorque += torque;
  }
  
  // Calculate predicted angle
  const predictedAngle = calculateAngle(newLeftTorque, newRightTorque);
  const angleDiff = predictedAngle - currentAngle;
  
  // Add tooltip showing predictions (simplified)
  previewWeight.setAttribute('data-tooltip', 
    `Torque: ${torque.toFixed(0)}\n\nNew angle: ${predictedAngle}°\nChange: ${angleDiff > 0 ? '+' : ''}${angleDiff}°`
  );
  
  // Apply counter-rotation to keep preview upright
  previewWeight.style.transform = `translateX(-50%) rotate(${-currentAngle}deg)`;
  
  plank.appendChild(previewWeight);
});

plank.addEventListener("mouseleave", function() {
  // Remove preview when mouse leaves the plank
  if (previewWeight) {
    previewWeight.remove();
    previewWeight = null;
  }
});

// New weight object
function createWeightElement(weight, x) {
  const weightEl = document.createElement("div");
  weightEl.classList.add("weight");
  weightEl.textContent = weight;
  weightEl.style.left = x + "px";
  
  // Calculate distance from pivot and torque
  const distance = Math.abs(x - PIVOT_X);
  const torque = weight * distance;
  
  // Add tooltip with calculation info (simplified)
  weightEl.setAttribute('data-tooltip', 
    `Torque: ${torque.toFixed(0)}`
  );
  
  // Size proportional to weight (20px base + 4px per kg)
  const size = 20 + weight * 2;
  weightEl.style.width = size + "px";
  weightEl.style.height = size + "px";  
  
  // Font size proportional to weight
  const fontSize = 10 + weight;
  weightEl.style.fontSize = fontSize + "px";
  
  // Color based on weight (rainbow gradient: red -> orange -> yellow -> green -> blue)
  const hue = (weight - 1) * 36; // 0° to 324° (10 steps of 36°)
  weightEl.style.background = `hsl(${hue}, 85%, 40%)`;
  
  plank.appendChild(weightEl);
}

// The torque is calculated as: torque = weight * distance (distance from the pivot)
function calculateTotals() {
  let leftTorque = 0;
  let rightTorque = 0;

  // Loop through all objects and calculate their torque contribution
  for (const obj of objects) {
    const distance = Math.abs(obj.x - PIVOT_X);  // Calculate distance from pivot

    // If the object is on the left side of the pivot (x < pivot)
    if (obj.x < PIVOT_X) {
      leftTorque += obj.weight * distance;    // Add to the left torque
    } else {
      rightTorque += obj.weight * distance;   // Add to the right torque
    }
  }

  return { leftTorque, rightTorque };
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
  // Remove preview on click
  if (previewWeight) {
    previewWeight.remove();
    previewWeight = null;
  }
  
  const x = getPlankPosition(event);
  const weight = nextWeight;

  // Store the new object (position and weight)
  objects.push({ x: x, weight: weight });

  // Visual element for the new object at the correct position
  createWeightElement(weight, x);

  // Recalculate the total torques and weights
  const { leftTorque, rightTorque } = calculateTotals();

  // Calculate the tilt angle based on torques
  const angle = calculateAngle(leftTorque, rightTorque);

  // Apply the tilt to the plank
  applyTilt(angle);

  // Generate the next random weight for the next click
  nextWeight = generateWeight();
  
  // Update info panel
  updateInfoPanel();
});
