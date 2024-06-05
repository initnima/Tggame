// Initialize Three.js scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create a 3D planet with a generated texture
const planetGeometry = new THREE.SphereGeometry(5, 32, 32);
let planetMaterial = new THREE.MeshPhongMaterial();
const generateTexture = () => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    const imageData = context.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const value = Math.floor(Math.random() * 255);
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);

    return new THREE.CanvasTexture(canvas);
};

planetMaterial.map = generateTexture();
planetMaterial.needsUpdate = true;
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
scene.add(planet);

// Generate background texture
const generateBackgroundTexture = () => {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    
    const imageData = context.createImageData(size, size);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const value = Math.floor(Math.random() * 255);
        data[i] = value / 2;
        data[i + 1] = value / 2;
        data[i + 2] = value;
        data[i + 3] = 255;
    }

    context.putImageData(imageData, 0, 0);

    return new THREE.CanvasTexture(canvas);
};

scene.background = generateBackgroundTexture();

camera.position.z = 15;

// Lighting
const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(10, 10, 10);
scene.add(light);

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
        planetMaterial.map = generateTexture();
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
        updateUpgradeCostText();
    }
}

const player = new Player();

function updateUpgradeCostText() {
    const parameter = document.getElementById('upgradeSelect').value;
    document.getElementById('upgradeCost').innerText = player.upgradeCosts[parameter].toFixed(1);
}

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
