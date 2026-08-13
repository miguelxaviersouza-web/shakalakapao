// Dados dos Heróis Reais
const realHeroes = {
    joana: { name: "Joana d'Arc", shape: "circle(50% at 50% 50%)" },
    yasuke: { name: "Samurai Yasuke", shape: "polygon(50% 0%, 100% 100%, 0% 100%)" },
    tesla: { name: "Nikola Tesla", shape: "polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)" }
};

let hero = {
    name: "",
    power: "",
    color: "",
    maxHp: 100,
    hp: 100,
    atk: 12
};

let enemy = {
    name: "Autômato Antigo",
    maxHp: 80,
    hp: 80,
    atk: 10
};

// Atualiza a prévia do visual do personagem
function updateCreationPreview() {
    const heroKey = document.getElementById('hero-select').value;
    const color = document.getElementById('color-picker').value;
    const preview = document.getElementById('hero-sprite-preview');

    preview.style.backgroundColor = color;
    preview.style.clipPath = realHeroes[heroKey].shape;
}

// Inicializa a prévia na abertura da página
updateCreationPreview();

function startGame() {
    const heroKey = document.getElementById('hero-select').value;
    const power = document.getElementById('power-select').value;
    const color = document.getElementById('color-picker').value;

    hero.name = realHeroes[heroKey].name;
    hero.power = power;
    hero.color = color;

    // Bônus de acordo com o Poder Escolhido
    if (power === "sombra") {
        hero.maxHp = 130;
        hero.hp = 130;
    } else if (power === "fogo") {
        hero.atk = 18;
    }

    // Configura o Sprite da batalha
    const heroSprite = document.getElementById('hero-sprite');
    heroSprite.style.backgroundColor = color;
    heroSprite.style.clipPath = realHeroes[heroKey].shape;

    document.getElementById('hero-name-display').innerText = hero.name;

    // Alterna a tela
    document.getElementById('creation-screen').style.display = 'none';
    document.getElementById('battle-screen').style.display = 'block';

    updateUI();
}

function updateUI() {
    document.getElementById('hero-hp').innerText = Math.max(0, hero.hp);
    document.getElementById('enemy-hp').innerText = Math.max(0, enemy.hp);
}

function logMessage(msg) {
    document.getElementById('log').innerText = msg;
}

function attack() {
    if (enemy.hp <= 0 || hero.hp <= 0) return;

    let damage = Math.floor(Math.random() * 8) + hero.atk;
    enemy.hp -= damage;
    updateUI();

    if (enemy.hp <= 0) {
        logMessage(`💥 ${hero.name} causou ${damage} de dano e venceu a batalha! 🎉`);
        return;
    }

    logMessage(`🗡️ Você atacou e causou ${damage} de dano!`);
    setTimeout(enemyTurn, 1000);
}

function usePower() {
    if (enemy.hp <= 0 || hero.hp <= 0) return;

    let damage = 0;
    if (hero.power === "fogo") {
        damage = Math.floor(Math.random() * 12) + 20;
        enemy.hp -= damage;
        logMessage(`🔥 Poder de Fogo! Você causou ${damage} de dano massivo!`);
    } else if (hero.power === "eletrico") {
        damage = Math.floor(Math.random() * 6) + 10;
        enemy.hp -= damage;
        logMessage(`⚡ Choque Elétrico! ${damage} de dano e o inimigo perde o turno!`);
        updateUI();
        return; // O inimigo não ataca neste turno
    } else {
        damage = Math.floor(Math.random() * 8) + 12;
        enemy.hp -= damage;
        logMessage(`🛡️ Ataque com Escudo! Causou ${damage} de dano!`);
    }

    updateUI();

    if (enemy.hp <= 0) {
        logMessage(`💥 ${hero.name} venceu a batalha! 🎉`);
        return;
    }

    setTimeout(enemyTurn, 1000);
}

function heal() {
    if (enemy.hp <= 0 || hero.hp <= 0) return;

    let healAmount = Math.floor(Math.random() * 15) + 15;
    hero.hp = Math.min(hero.maxHp, hero.hp + healAmount);
    updateUI();

    logMessage(`🧪 Você recuperou ${healAmount} de vida!`);
    setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
    let damage = Math.floor(Math.random() * 6) + enemy.atk;
    hero.hp -= damage;
    updateUI();

    if (hero.hp <= 0) {
        logMessage(`💀 ${hero.name} foi derrotado em combate...`);
    } else {
        logMessage(`👹 O ${enemy.name} atacou e causou ${damage} de dano!`);
    }
}
