// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a 3D planet
const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
const planetMaterial = new THREE.MeshBasicMaterial({ color: 0x0077ff });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

camera.position.z = 10;

// Player class
class Player {
    constructor() {
        this.energy = 0;
        this.colony = 0;
        this.communication = 0;
        this.water = 0;
        this.food = 0;
    }

    upgrade(parameter) {
        if (this[parameter] !== undefined) {
            this[parameter]++;
            document.getElementById(parameter).innerText = this[parameter];
        }
    }
}

// Initialize player
const player = new Player();

// Update UI function
function updateUI() {
    document.getElementById('energy').innerText = player.energy;
    document.getElementById('colony').innerText = player.colony;
    document.getElementById('communication').innerText = player.communication;
    document.getElementById('water').innerText = player.water;
    document.getElementById('food').innerText = player.food;
}

// Initial UI update
updateUI();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    planet.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

// Attach upgrade function to window for button access
window.upgrade = function(parameter) {
    player.upgrade(parameter);
    updateUI();
}
