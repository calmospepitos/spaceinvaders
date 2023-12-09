import {registerCallbacks, sendMessage, signout, chatMessageLoop} from './chat-api';
import { AudioControl } from './page-index';

let spriteList = [];
let projectileList = [];
let nbAlien = 0;
let nbProjectile = 0;
let nbKills = 0;
let spaceship = null;

window.addEventListener("load", () => {
    const game = document.querySelector("#game");
    spaceship = new Spaceship("spaceship");
    const audioControl = new AudioControl(); // AUDIO TOGGLE

    document.querySelector("textarea").onkeyup = function (evt) {
        sendMessage(evt, this);
    };
    document.querySelector("#sign-out-btn").onclick = signout;
    registerCallbacks(newMessage, memberListUpdate);
    chatMessageLoop();

    // EVENTS
    document.addEventListener("keydown", function (event) {
        spaceship.moveSpaceship(event.key);
    });

    game.addEventListener("click", (event) => {
        const gameArea = event.currentTarget.getBoundingClientRect();
        const clickX = event.clientX - gameArea.left;
        const clickY = event.clientY - gameArea.top;
    
        projectileList.push(new Projectile("projectile" + nbProjectile, spaceship.node.getBoundingClientRect(), clickX, clickY));
        nbProjectile++;
    });    

    setInterval(() => {
        spriteList.push(new Alien("alien" + nbAlien, game, spaceship));
        nbAlien++;
    }, 2000);

    tick();
});

const tick = () => {
    for (let i = 0; i < spriteList.length; i++) {
        const node = spriteList[i];
        node.tick();
    }

    for (let i = 0; i < projectileList.length; i++) {
        const projectile = projectileList[i];
        projectile.tick();
    }

    window.requestAnimationFrame(tick);
}

// CHAT
// Lorsqu'un nouveau message doit être affiché à l'écran, cette fonction est appelée
const newMessage = (fromUser, message, isPrivate) => {
    console.log(fromUser, message, isPrivate);

    displayNewMessage(fromUser, message);

    if (message.toLowerCase() == "/shield") {
        spaceship.activateShield();
    }
}

// À chaque 2-3 secondes, cette fonction est appelée. Il faudra donc mettre à jour la liste des membres
// connectés dans votre interface.
const memberListUpdate = members => {
    console.log(members);
    const chatMembersDiv = document.getElementById("chat-members");

    // RESET
    chatMembersDiv.innerHTML = '';

    const memberParagraph = document.createElement('p');

    // ITERATION DES MEMBRES
    members.forEach((username, index) => {
        memberParagraph.innerHTML += (username || 'unknown') + '<br>';
    });

    chatMembersDiv.appendChild(memberParagraph);
}


const displayNewMessage = (fromUser, message) => {
    const chatOutput = document.getElementById("chat-output");
    const paragraph = document.createElement("p");
    const usernameSpan = document.createElement("span");
    usernameSpan.textContent = `${fromUser}: `;

    // APPEND USERNAME
    paragraph.appendChild(usernameSpan);

    // CHANGE TO WHITE
    const messageSpan = document.createElement("span");
    messageSpan.style.color = "white";
    messageSpan.textContent = message;

    paragraph.appendChild(messageSpan);

    // APPEND MESSAGE TO CHAT
    chatOutput.appendChild(paragraph);

    // SCROLL TO BOTTOM
    chatOutput.scrollTop = chatOutput.scrollHeight;
};

const updateKillsDisplay = () => {
    const killsDiv = document.getElementById("kills");
    killsDiv.textContent = "Kills: " + nbKills;
};

class Spaceship {
    constructor(id) {
        this.id = id;
        this.node = document.querySelector("#spaceship");
        this.lifeNode = document.querySelector("#life");
        this.gameArea = document.querySelector("#game");
        this.hasShield = false;
        this.shieldDuration = 10000;
        this.speed = 15;
        this.life = 9;
    }

    moveSpaceship(direction) {
        let spaceshipRect = this.node.getBoundingClientRect();
        let gameAreaRect = this.gameArea.getBoundingClientRect();

        switch (direction) {
            case "ArrowUp":
                if (spaceshipRect.top > gameAreaRect.top) {
                    this.node.style.top = spaceshipRect.top - this.speed + "px";
                }
                break;
            case "ArrowDown":
                if (spaceshipRect.bottom < gameAreaRect.bottom) {
                    this.node.style.top = spaceshipRect.top + this.speed + "px";
                }
                break;
            case "ArrowLeft":
                if (spaceshipRect.left > gameAreaRect.left) {
                    this.node.style.left = spaceshipRect.left - this.speed + "px";
                }
                break;
            case "ArrowRight":
                if (spaceshipRect.right < gameAreaRect.right) {
                    this.node.style.left = spaceshipRect.left + this.speed + "px";
                }
                break;
            default:
                break;
        }
    }

    hitByAlien() {
        if (!this.hasShield) {
            this.updateLifeGauge();
            this.node.classList.add("hitAlien");

            setTimeout(() => {
                this.node.classList.remove("hitAlien");
            }, 2000);
        }
    }

    updateLifeGauge() {
        console.log(this.life);
        let heartNode = document.querySelector("#vie" + this.life);
        heartNode.src = "img/vie-enleve.png";
        this.life -= 1;
    }

    activateShield() {
        this.hasShield = true;

        setTimeout(() => {
            this.hasShield = false;
        }, this.shieldDuration);
    }
}

class Projectile {
    constructor(id, spaceshipPosition, clickX, clickY) {
        this.id = id;
        this.node = document.createElement("div");
        this.node.classList.add("projectile");
        this.gameArea = document.querySelector("#game");
        this.x = spaceshipPosition.left + spaceshipPosition.width / 2; // Initial x position
        this.y = spaceshipPosition.top + spaceshipPosition.height / 2; // Initial y position
        this.targetX = clickX;
        this.targetY = clickY;
        this.speed = 5;
        this.gameArea.appendChild(this.node);
    }

    tick() {
        const deltaX = this.targetX - this.x;
        const deltaY = this.targetY - this.y;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);

        if (distance < this.speed) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.node.remove();
        } else {
            const angle = Math.atan2(deltaY, deltaX);

            // Move by directly adding speed to the position
            this.x += Math.cos(angle) * this.speed;
            this.y += Math.sin(angle) * this.speed;
        }

        // Update CSS position
        this.node.style.left = this.x + "px";
        this.node.style.top = this.y + "px";
    }
}

class Alien {
    constructor(id, parentElement, spaceshipInstance) {
        this.id = id;
        this.node = document.createElement("div");
        this.node.classList.add("alien");
        this.spaceship = document.querySelector("#spaceship");
        this.spaceshipInstance = spaceshipInstance;
        this.gameArea = document.querySelector("#game");
        this.speed = 2;
        this.margin = 20;
        this.spawnOnRandomBorder();
        parentElement.appendChild(this.node);
    }

    spawnOnRandomBorder() {
        const borders = ['top', 'bottom', 'left', 'right'];
        let randomBorder = borders[Math.floor(Math.random() * borders.length)];
        let gameRect = this.gameArea.getBoundingClientRect();

        switch (randomBorder) {
            case 'top':
                this.x = Math.random() * gameRect.width + gameRect.left;
                this.y = gameRect.top + this.margin;
                this.speedY = this.speed;
                break;
            case 'bottom':
                this.x = Math.random() * gameRect.width + gameRect.left;
                this.y = gameRect.bottom + this.margin;
                this.speedY = -this.speed;
                break;
            case 'left':
                this.x = gameRect.left + this.margin;
                this.y = Math.random() * gameRect.height + gameRect.top;
                this.speedX = this.speed;
                break;
            case 'right':
                this.x = gameRect.right + this.margin;
                this.y = Math.random() * gameRect.height + gameRect.top;
                this.speedX = -this.speed;
                break;
            default:
                break;
        }

        this.node.style.left = this.x + "px";
        this.node.style.top = this.y + "px";
    }

    checkCollisionWithProjectiles(projectiles) {
        for (let i = 0; i < projectiles.length; i++) {
            const projectile = projectiles[i];
            const projectileRect = projectile.node.getBoundingClientRect();

            if (
                this.x < projectileRect.right &&
                this.x + this.node.offsetWidth > projectileRect.left &&
                this.y < projectileRect.bottom &&
                this.y + this.node.offsetHeight > projectileRect.top
            ) {
                // Handle collision with projectile (remove both projectile and alien)
                let projectileIndex = projectileList.indexOf(projectile);
                if (projectileIndex !== -1) {
                    projectileList.splice(projectileIndex, 1);
                }

                let alienIndex = spriteList.indexOf(this);
                if (alienIndex !== -1) {
                    spriteList.splice(alienIndex, 1);
                }

                projectile.node.remove();
                this.node.remove();
                nbKills++;
                nbAlien--;

                updateKillsDisplay();
            }
        }
    }

    tick() {
        this.x += this.speedX || 0;
        this.y += this.speedY || 0;
        this.node.style.left = this.x + "px";
        this.node.style.top = this.y + "px";
        let spaceshipRect = this.spaceship.getBoundingClientRect();
        let gameRect = this.gameArea.getBoundingClientRect();

        // REGARDE SI ALIEN EST EN DEHORS DES LIMITES
        if (
            this.x < gameRect.left + this.margin ||
            this.x > gameRect.right - this.margin ||
            this.y < gameRect.top + this.margin ||
            this.y > gameRect.bottom - this.margin
        ) {
            let index = spriteList.indexOf(this);
            if (index !== -1) {
                spriteList.splice(index, 1);
            }

            this.node.remove();
            nbAlien--;
        }

        // REGARDE SI COLLISION AVEC LE SPACESHIP
        if (
            this.x < spaceshipRect.right &&
            this.x + this.node.offsetWidth > spaceshipRect.left &&
            this.y < spaceshipRect.bottom &&
            this.y + this.node.offsetHeight > spaceshipRect.top
        ) {
            this.spaceshipInstance.hitByAlien();

            let index = spriteList.indexOf(this);
            if (index !== -1) {
                spriteList.splice(index, 1);
            }

            this.node.remove();
            nbAlien--;

            // if (this.spaceshipInstance.life == 0) {

            // }
        }

        // REGARDE SI COLLISION AVEC UN PROJECTILE
        this.checkCollisionWithProjectiles(projectileList);
    }
}

