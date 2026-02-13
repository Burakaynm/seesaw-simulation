const plank = document.getElementById("plank");

// Objects in an array (x: position, weight: random value)
const objects = [];

// Random weight between 1 and 10
function generateWeight() {
  return Math.floor(Math.random() * 10) + 1;
}

// New weight object
function createWeightElement(weight, x) {
  const weightEl = document.createElement("div");
  weightEl.classList.add("weight");
  weightEl.textContent = weight;
  weightEl.style.left = x + "px"; // Position the object on the plank
  plank.appendChild(weightEl);
}

// Click event listener to place weights
plank.addEventListener("click", function(event) {
  const rect = plank.getBoundingClientRect();
  const clickX = event.clientX - rect.left;  // Get click position relative to plank
  
  const weight = generateWeight();  // Generate a random weight
  objects.push({ weight: weight, x: clickX});  // Store object with position and weight
  
  createWeightElement(weight, clickX);  // Add the weight to the plank at the clicked position
});
