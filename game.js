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
const planetTexture = loader.load('texture%20(3).jpg');
const backgroundTexture = loader.load('bg-02-01.jpg');

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
        this.energy = parseInt(tg.initDataUnsafe.user.custom_data?.energy) || 0;
        this.colony = parseInt(tg.initDataUnsafe.user.custom_data?.colony) || 0;
        this.communication = parseInt(tg.initDataUnsafe.user.custom_data?.communication) || 0;
        this.water = parseInt(tg.initDataUnsafe.user.custom_data?.water) || 0;
        this.food = parseInt(tg.initDataUnsafe.user.custom_data?.food) || 0;
        this.coins = parseFloat(tg.initDataUnsafe.user.custom_data?.coins) || 0;
        this.level = parseInt(tg.initDataUnsafe.user.custom_data?.level) || 1;
        this.earnRate = 0.1;
        this.upgradeCosts = {
            energy: parseFloat(tg.initDataUnsafe.user.custom_data?.upgradeCostEnergy) || 0.4,
            colony: parseFloat(tg.initDataUnsafe.user.custom_data?.upgradeCostColony) || 0.4,
            communication: parseFloat(tg.initDataUnsafe.user.custom_data?.upgradeCostCommunication) || 0.4,
            water: parseFloat(tg.initDataUnsafe.user.custom_data?.upgradeCostWater) || 0.4,
            food: parseFloat(tg.initDataUnsafe.user.custom_data?.upgradeCostFood) || 0.4
        };
        this.lastLoginTime = parseInt(tg.initDataUnsafe.user.custom_data?.lastLoginTime) || Date.now();

        // Calculate offline earnings
        this.calculateOfflineEarnings();

        // Start earning coins
        setInterval(() => {
            this.earnCoins();
        }, 300000); // 5 minutes in milliseconds

        this.updateUI();
    }

    calculateOfflineEarnings() {
        const now = Date.now();
        const timeElapsed = (now - this.lastLoginTime) / 300000; // 5 minutes in ms
        const offlineEarnings = timeElapsed * this.earnRate;
        this.coins += offlineEarnings;
        this.lastLoginTime = now;
        tg.MainButton.setText('Last login time: ' + now);
        this.updateUI();
    }

    earnCoins() {
        this.coins += this.earnRate;
        tg.MainButton.setText('Coins: ' + this.coins);
        this.updateUI();
    }

    upgrade(parameter) {
        const cost = this.upgradeCosts[parameter];
        if (this[parameter] !== undefined && this.coins >= cost) {
            this[parameter]++;
            this.coins -= cost;
            this.upgradeCosts[parameter] *= 2;
            tg.MainButton.setText('Coins: ' + this.coins);
            this.updateUI();
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.earnRate += 0.1;
        this.changePlanetTexture();
    }

    changePlanetTexture() {
        planetMaterial.map = loader.load('texture%20(3).jpg'); // Reload the planet texture
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

// Attach upgrade function to window for button access
window.upgrade = function() {
    const parameter = document.getElementById('upgradeSelect').value;
    player.upgrade(parameter);
};
