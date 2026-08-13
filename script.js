// Configurações do Canvas e Jogo
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let hero = {
    x: 200,
    y: 200,
    size: 20,
    speed: 3,
    hp: 100,
    name: "",
    primaryColor: "",
    accentColor: "",
    shape: "",
    score: 0
};

let enemies = [];
let bullets = [];
let mapType = "city";
let keys = {};

// Atualiza a prévia visual no menu
function updatePreview() {
    const shape = document.getElementById('hero-shape-select').value;
    const pColor = document.getElementById('primary-color').value;
    const aColor = document.getElementById('accent-color').value;
    const sprite = document.getElementById('preview-sprite');
    const symbol = document.getElementById('preview-symbol');

    sprite.style.backgroundColor = pColor;
    symbol.style.backgroundColor = aColor;

    if (shape === "speedster") {
        sprite.style.borderRadius = "50%";
    } else if (shape === "armored") {
        sprite.style.borderRadius = "0px";
        sprite.style.transform = "rotate(45deg)";
    } else {
        sprite.style.borderRadius = "4px";
        sprite.style.transform = "rotate(0deg)";
    }
}

updatePreview();

function startGame() {
    hero.name = document.getElementById('hero-name-input').value || "Herói";
    hero.primaryColor = document.getElementById('primary-color').value;
    hero.accentColor = document.getElementById('accent-color').value;
    hero.shape = document.getElementById('hero-shape-select').value;
    mapType = document.getElementById('map-select').value;

    document.getElementById('player-display-name').innerText = hero.name;
    document.getElementById('creation-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';

    // Eventos de Teclado e Mouse
    window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
    window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);
    canvas.addEventListener('click', shootBullet);

    // Gerar Inimigos (Vilões da HQ)
    for (let i = 0; i < 4; i++) spawnEnemy();

    // Loop do Jogo
    requestAnimationFrame(gameLoop);
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 40) + 20,
        y: Math.random() * (canvas.height - 40) + 20,
        size: 18,
        speed: 1 + Math.random() * 1.2,
        hp: 30
    });
}

function shootBullet(e) {
    const rect = canvas.getBoundingClientRect();
    const targetX = e.clientX - rect.left;
    const targetY = e.clientY - rect.top;

    const angle = Math.atan2(targetY - hero.y, targetX - hero.x);

    bullets.push({
        x: hero.x,
        y: hero.y,
        dx: Math.cos(angle) * 6,
        dy: Math.sin(angle) * 6,
        size: 5
    });
}

function updateGame() {
    if (hero.hp <= 0) return;

    // Movimentação Estilo Tibia (8 direções)
    if (keys['w'] || keys['arrowup']) hero.y = Math.max(hero.size, hero.y - hero.speed);
    if (keys['s'] || keys['arrowdown']) hero.y = Math.min(canvas.height - hero.size, hero.y + hero.speed);
    if (keys['a'] || keys['arrowleft']) hero.x = Math.max(hero.size, hero.x - hero.speed);
    if (keys['d'] || keys['arrowright']) hero.x = Math.min(canvas.width - hero.size, hero.x + hero.speed);

    // Mover Projéteis
    bullets.forEach((b, index) => {
        b.x += b.dx;
        b.y += b.dy;

        // Remover projéteis fora da tela
        if (b.x < 0 || b.x > canvas.width || b.y < 0 || b.y > canvas.height) {
            bullets.splice(index, 1);
        }
    });

    // Mover Inimigos em direção ao Herói
    enemies.forEach((enemy, eIndex) => {
        const angle = Math.atan2(hero.y - enemy.y, hero.x - enemy.x);
        enemy.x += Math.cos(angle) * enemy.speed;
        enemy.y += Math.sin(angle) * enemy.speed;

        // Colisão com o Herói
        const dist = Math.hypot(hero.x - enemy.x, hero.y - enemy.y);
        if (dist < hero.size + enemy.size) {
            hero.hp -= 0.5;
            document.getElementById('hp-display').innerText = Math.max(0, Math.floor(hero.hp));
        }

        // Colisão de Tiros com Inimigos
        bullets.forEach((bullet, bIndex) => {
            const bDist = Math.hypot(bullet.x - enemy.x, bullet.y - enemy.y);
            if (bDist < bullet.size + enemy.size) {
                enemy.hp -= 15;
                bullets.splice(bIndex, 1);

                if (enemy.hp <= 0) {
                    enemies.splice(eIndex, 1);
                    hero.score++;
                    document.getElementById('score-display').innerText = hero.score;
                    spawnEnemy(); // Respawn estilo Tibia
                }
            }
        });
    });
}

function drawGame() {
    // Desenhar Cenário
    if (mapType === "city") ctx.fillStyle = "#2d3748";
    else if (mapType === "lab") ctx.fillStyle = "#1e1b4b";
    else ctx.fillStyle = "#090d16";

    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grade de fundo (Estilo Tiles de Tibia)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Desenhar Projéteis
    ctx.fillStyle = hero.accentColor;
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Desenhar Inimigos (Capangas / Vilões de HQ)
    ctx.fillStyle = "#e11d48";
    enemies.forEach(enemy => {
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#881337";
        ctx.lineWidth = 3;
        ctx.stroke();
    });

    // Desenhar Herói Customizado
    ctx.save();
    ctx.translate(hero.x, hero.y);

    ctx.fillStyle = hero.primaryColor;
    if (hero.shape === "speedster") {
        ctx.beginPath();
        ctx.arc(0, 0, hero.size, 0, Math.PI * 2);
        ctx.fill();
    } else if (hero.shape === "armored") {
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-hero.size / 1.2, -hero.size / 1.2, hero.size * 1.5, hero.size * 1.5);
        ctx.rotate(-Math.PI / 4);
    } else {
        ctx.fillRect(-hero.size, -hero.size, hero.size * 2, hero.size * 2);
    }

    // Emblema Central do Herói
    ctx.fillStyle = hero.accentColor;
    ctx.beginPath();
    ctx.arc(0, 0, hero.size / 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Game Over
    if (hero.hp <= 0) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "#ef4444";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("HERÓI DERROTADO!", canvas.width / 2, canvas.height / 2);
    }
}

function gameLoop() {
    updateGame();
    drawGame();
    if (hero.hp > 0) requestAnimationFrame(gameLoop);
}
