// Initialize Telegram Web Apps SDK
Telegram.WebApp.ready();

const tg = window.Telegram.WebApp;

// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Load textures
const loader = new THREE.TextureLoader();
const planetTexture = loader.load('https://initnima.github.io/Tggame/texture%20(3).jpg');
const backgroundTexture = loader.load('https://initnima.github.io/Tggame/bg-02-01.jpg');

// Create a 3D planet with the image-based texture
const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
let planetMaterial = new THREE.MeshPhongMaterial({ map: planetTexture });
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Set background texture
scene.background = backgroundTexture;

camera.position.z = 15;

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

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
        this.isMining = JSON.parse(localStorage.getItem('isMining')) || false;
        this.miningEndTime = parseInt(localStorage.getItem('miningEndTime')) || 0;

        // Calculate offline earnings
        this.calculateOfflineEarnings();

        // Start earning coins
        setInterval(() => {
            this.earnCoins();
        }, 1000); // 1 second

        // Check mining status
        this.checkMiningStatus();

        this.updateUI();
    }

    calculateOfflineEarnings() {
        const now = Date.now();
        const timeElapsed = (now - this.lastLoginTime) / 300000; // 5 minutes in ms
        const offlineEarnings = timeElapsed * this.earnRate;
        this.coins += offlineEarnings;
        this.lastLoginTime = now;
        localStorage.setItem('lastLoginTime', now);
        this.updateUI();
    }

    earnCoins() {
        this.coins += this.earnRate;
        localStorage.setItem('coins', this.coins);
        this.updateUI();
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
            this.updateUI();
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.earnRate += 0.1;
        localStorage.setItem('level', this.level);
        this.changePlanetTexture();
    }

    changePlanetTexture() {
        planetMaterial.map = loader.load('https://initnima.github.io/Tggame/texture%20(3).jpg'); // Reload the planet texture
        planetMaterial.needsUpdate = true;
    }

    updateUI() {
        document.getElementById('energy').innerText = this.energy;
        document.getElementById('colony').innerText = this.colony;
        document.getElementById('communication').innerText = this.communication;
        document.getElementById('water').innerText = this.water;
        document.getElementById('food').innerText = this.food;
        document.getElementById('coins').innerText = this.coins.toFixed(1);
        document.getElementById('level').innerText = this.level;
        document.getElementById('earnRate').innerText = this.earnRate.toFixed(1);
        this.updateUpgradeCostText();
    }

    startMining() {
        this.isMining = true;
        this.miningEndTime = Date.now() + 2 * 60 * 60 * 1000; // 2 hours in ms
        localStorage.setItem('isMining', JSON.stringify(this.isMining));
        localStorage.setItem('miningEndTime', this.miningEndTime);
        this.checkMiningStatus();
    }

    checkMiningStatus() {
        const now = Date.now();
        if (this.isMining && now >= this.miningEndTime) {
            this.isMining = false;
            localStorage.setItem('isMining', JSON.stringify(this.isMining));
            this.coins += 100; // Reward for mining
            localStorage.setItem('coins', this.coins);
        }
        this.updateUI();
    }

    updateUpgradeCostText() {
        const parameter = document.getElementById('upgradeSelect').value;
        document.getElementById('upgradeCost').innerText = this.upgradeCosts[parameter].toFixed(1);
    }
}

const player = new Player();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    planet.rotation.y += 0.01;
    renderer.render(scene, camera);
}

animate();

document.getElementById('toggleMenu').addEventListener('click', () => {
    document.getElementById('ui').classList.toggle('open');
});

document.getElementById('startMining').addEventListener('click', () => {
    player.startMining();
});

// Attach upgrade function to window for button access
window.upgrade = function() {
    const parameter = document.getElementById('upgradeSelect').value;
    player.upgrade(parameter);
};

// Update upgrade cost text on parameter selection change
document.getElementById('upgradeSelect').addEventListener('change', () => {
    player.updateUpgradeCostText();
});
