// Game state
let gameState = 'home'; // 'home', 'playing', 'gameOver'
let score = 0;
let lives = 3;
let gameSpeed = 3;
let gameLoop;

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player car
const player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 100,
    width: 50,
    height: 80,
    speed: 5
};

// Obstacles array
let obstacles = [];

// Page elements
const homePage = document.getElementById('homePage');
const gamePage = document.getElementById('gamePage');
const gameOverPage = document.getElementById('gameOverPage');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const scoreElement = document.getElementById('score');
const livesElement = document.getElementById('lives');
const finalScoreElement = document.getElementById('finalScore');

// Event listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);

// Keyboard controls
const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});
document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game functions
function showPage(pageId) {
    // Hide all pages
    homePage.classList.remove('active');
    gamePage.classList.remove('active');
    gameOverPage.classList.remove('active');
    
    // Show target page
    document.getElementById(pageId).classList.add('active');
}

function startGame() {
    // Reset game state
    score = 0;
    lives = 3;
    gameSpeed = 3;
    obstacles = [];
    
    // Reset player position
    player.x = canvas.width / 2 - 25;
    
    // Update UI
    scoreElement.textContent = score;
    livesElement.textContent = lives;
    
    // Show game page
    showPage('gamePage');
    gameState = 'playing';
    
    // Start game loop
    gameLoop = setInterval(updateGame, 16); // ~60 FPS
}

function endGame() {
    gameState = 'gameOver';
    clearInterval(gameLoop);
    
    // Update final score
    finalScoreElement.textContent = score;
    
    // Show game over page
    showPage('gameOverPage');
}

function updateGame() {
    if (gameState !== 'playing') return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update player
    updatePlayer();
    
    // Update obstacles
    updateObstacles();
    
    // Check collisions
    checkCollisions();
    
    // Draw everything
    drawPlayer();
    drawObstacles();
    
    // Increase speed over time
    if (score > 0 && score % 100 === 0) {
        gameSpeed += 0.5;
    }
}

function updatePlayer() {
    // Handle player movement (left/right only)
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.x -= player.speed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.x += player.speed;
    }
    
    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }
}

function updateObstacles() {
    // Generate new obstacles
    if (Math.random() < 0.02) { // 2% chance per frame
        const obstacle = {
            x: Math.random() * (canvas.width - 60),
            y: -60,
            width: 60,
            height: 60,
            type: Math.random() < 0.5 ? 'car' : 'tree'
        };
        obstacles.push(obstacle);
    }
    
    // Move obstacles down
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].y += gameSpeed;
        
        // Remove obstacles that are off screen
        if (obstacles[i].y > canvas.height) {
            obstacles.splice(i, 1);
            // Add points for avoiding obstacles
            score += 10;
            scoreElement.textContent = score;
        }
    }
}

function checkCollisions() {
    for (let obstacle of obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            
            // Collision detected
            lives--;
            livesElement.textContent = lives;
            
            // Remove the obstacle
            const index = obstacles.indexOf(obstacle);
            if (index > -1) {
                obstacles.splice(index, 1);
            }
            
            // Check if game over
            if (lives <= 0) {
                endGame();
            }
            
            break;
        }
    }
}

function drawPlayer() {
    // Draw car body (main rectangle)
    ctx.fillStyle = '#FF0000';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Draw car details (four boxes - two on each side)
    ctx.fillStyle = '#000000';
    
    // Top left box
    ctx.fillRect(player.x + 5, player.y + 5, 15, 15);
    
    // Top right box
    ctx.fillRect(player.x + player.width - 20, player.y + 5, 15, 15);
    
    // Bottom left box
    ctx.fillRect(player.x + 5, player.y + player.height - 20, 15, 15);
    
    // Bottom right box
    ctx.fillRect(player.x + player.width - 20, player.y + player.height - 20, 15, 15);
    
    // Car windows
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(player.x + 10, player.y + 10, player.width - 20, 20);
}

function drawObstacles() {
    for (let obstacle of obstacles) {
        if (obstacle.type === 'car') {
            // Draw enemy car
            ctx.fillStyle = '#0000FF';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Car details
            ctx.fillStyle = '#000000';
            ctx.fillRect(obstacle.x + 5, obstacle.y + 5, 15, 15);
            ctx.fillRect(obstacle.x + obstacle.width - 20, obstacle.y + 5, 15, 15);
            ctx.fillRect(obstacle.x + 5, obstacle.y + obstacle.height - 20, 15, 15);
            ctx.fillRect(obstacle.x + obstacle.width - 20, obstacle.y + obstacle.height - 20, 15, 15);
            
            // Car windows
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(obstacle.x + 10, obstacle.y + 10, obstacle.width - 20, 20);
        } else {
            // Draw tree
            ctx.fillStyle = '#228B22';
            ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
            
            // Tree trunk
            ctx.fillStyle = '#8B4513';
            ctx.fillRect(obstacle.x + 20, obstacle.y + 40, 20, 20);
            
            // Tree leaves
            ctx.fillStyle = '#32CD32';
            ctx.fillRect(obstacle.x + 10, obstacle.y + 10, 40, 40);
        }
    }
}

// Initialize the game
showPage('homePage'); 