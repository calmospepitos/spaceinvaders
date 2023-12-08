import {registerCallbacks, sendMessage, signout, chatMessageLoop} from './chat-api';
import { AudioControl } from './page-index';

let spriteList = [];
let nbalien = 0;
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

        spaceship.shootProjectile(clickX, clickY);
    });

    setInterval(() => {
        spriteList.push(new Alien("alien" + nbalien, game, spaceship));
        nbalien++;
    }, 2000);

    tick();
});

const tick = () => {
    for (let i = 0; i < spriteList.length; i++) {
        const node = spriteList[i];
        node.tick();
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
    
    shootProjectile = (clickX, clickY) => {
        let spaceshipRect = this.node.getBoundingClientRect();
        let projectile = document.createElement("div");
        projectile.className = "projectile";
        projectile.style.left = spaceshipRect.left + "px";
        projectile.style.top = spaceshipRect.top + "px";
        this.gameArea.appendChild(projectile);

        // CALCUL DE LA DISTANCE
        let distanceX = clickX - spaceshipRect.left;
        let distanceY = clickY - spaceshipRect.top;

        // ANIMATION
        projectile.style.transition = 'none'; 
        projectile.style.transform = `translate(0, 0)`;
        projectile.offsetWidth; 
        projectile.style.transition = `all 0.5s linear`;

        // MOUVEMENT DU PROJECTILE
        projectile.style.transform = `translate(${distanceX}px, ${distanceY}px)`;

        // REMOVE
        projectile.addEventListener('transitionend', () => {
            projectile.remove();
        });
    };

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
    constructor(id, gameArea, spaceshipRect) {
        this.id = id;
        this.node = document.createElement("div");
        this.node.classList.add("projectile");
        this.gameArea = gameArea;
        this.x = spaceshipRect.left;
        this.y = spaceshipRect.top;
        this.gameArea.appendChild(node);
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
        this.margin = 35;
        this.speed = 2;
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

            // if (this.spaceshipInstance.life == 0) {

            // }
        }
    }
}

