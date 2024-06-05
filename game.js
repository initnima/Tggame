// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a 3D planet with texture
const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
let planetMaterial = new THREE.MeshBasicMaterial();
const textureLoader = new THREE.TextureLoader();
textureLoader.load('https://threejs.org/examples/textures/earth.jpg', (texture) => {
    planetMaterial.map = texture;
    planetMaterial.needsUpdate = true;
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Create a background
textureLoader.load('https://initnima.github.io/Tggame/a-breathtaking-3d-rendering-of-a-vast-cosmic-space-60WSRgwFSJi-TKSGmyTlaA-sSim8EyqRYaUT5xcrEfCmQ-enhanced.png', function(texture) {
    scene.background = texture;
}, undefined, function(err) {
    console.error('An error occurred while loading the background:', err);
});

camera.position.z = 15;

// Update UI function
function updateUI() {
    document.getElementById('energy').innerText = player.energy;
    document.getElementById('colony').innerText = player.colony;
    document.getElementById('communication').innerText = player.communication;
    document.getElementById('water').innerText = player.water;
    document.getElementById('food').innerText = player.food;
    document.getElementById('coins').innerText = player.coins.toFixed(1);
    document.getElementById('level').innerText = player.level;
    document.getElementById('earnRate').innerText = player.earnRate.toFixed(1);
    document.getElementById('upgradeCost').innerText = player.upgradeCosts.energy.toFixed(1); // Just an example
}

// Player class
class Player {
    constructor() {
        this.energy = parseInt(localStorage.getItem('energy')) || 0;
        this.colony = parseInt(localStorage.getItem('colony')) || 0;
        this.communication = parseInt(localStorage.getItem('communication')) || 0;
        this.water = parseInt(localStorage.getItem('water')) || 0;
        this.food = parseInt(localStorage.getItem('food')) || 0;
        this.coins = parseFloat(localStorage.getItem('coins')) || 0;
        this.level = parseInt(localStorage.getItem('level')) || 1;
        this.earnRate = 0.1;
        this.upgradeCosts = {
            energy: parseFloat(localStorage.getItem('upgradeCostEnergy')) || 0.4,
            colony: parseFloat(localStorage.getItem('upgradeCostColony')) || 0.4,
            communication: parseFloat(localStorage.getItem('upgradeCostCommunication')) || 0.4,
            water: parseFloat(localStorage.getItem('upgradeCostWater')) || 0.4,
            food: parseFloat(localStorage.getItem('upgradeCostFood')) || 0.4
        };
        this.lastLoginTime = parseInt(localStorage.getItem('lastLoginTime')) || Date.now();

        // Calculate offline earnings
        this.calculateOfflineEarnings();

        // Start earning coins
        setInterval(() => {
            this.earnCoins();
        }, 1000); // 5 minutes
    }

    calculateOfflineEarnings() {
        const now = Date.now();
        const timeElapsed = (now - this.lastLoginTime) / 300000; // 5 minutes in ms
        const offlineEarnings = timeElapsed * this.earnRate;
        this.coins += offlineEarnings;
        this.lastLoginTime = now;
        localStorage.setItem('lastLoginTime', now);
        updateUI();
    }

    earnCoins() {
        this.coins += this.earnRate;
        localStorage.setItem('coins', this.coins);
        updateUI();
    }

    upgrade(parameter) {
        const cost = this.upgradeCosts[parameter];
        if (this[parameter] !== undefined && this.coins >= cost) {
            this[parameter]++;
            this.coins -= cost;
            this.upgradeCosts[parameter] *= 2;
            localStorage.setItem('coins', this.coins);
            localStorage.setItem(parameter, this[parameter]);
            localStorage.setItem('upgradeCost' + parameter.charAt(0).toUpperCase() + parameter.slice(1), this.upgradeCosts[parameter]);
            updateUI();
        }
    }

    changePlanetColor() {
        const colors = [
            0x0077ff, 0x00ff77, 0xff0077, 0xff7700,
            0x7700ff, 0x77ff00, 0x0077ff, 0x00ff77,
            0xff0077, 0xff7700
        ];
        planetMaterial.color.setHex(colors[(this.level - 1) % colors.length]);
    }
}

// Initialize player
const player = new Player();

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
window.upgrade = function() {
    const parameter = document.getElementById('upgradeSelect').value;
    player.upgrade(parameter);
    updateUI();
}
