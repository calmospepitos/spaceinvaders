import {signin} from './chat-api';

window.addEventListener("load", () => {
    document.querySelector("form").onsubmit = function () {
        return signin(this);
    }
    // COMMENCE À CODER ICI...
    // MUSIQUE
    let audioControl = new AudioControl();
});

export class AudioControl {
    constructor() {
        this.audio = new Audio("music/seaofsimulation.mp3");
        this.isSoundPlaying = false;
        this.nodeSoundPlay = document.querySelector("#sound");
        this.initialize();
    }

    toggleSound = () => {
        if (this.isSoundPlaying) {
            this.audio.pause();
            this.nodeSoundPlay.src = 'img/soundoff.png';
        }
        else {
            this.audio.play();
            this.nodeSoundPlay.src = 'img/soundon.png';
        }

        this.isSoundPlaying = !this.isSoundPlaying;
    };

    initialize() {
        this.audio.loop = true;
        this.nodeSoundPlay.onclick = this.toggleSound;
    }
}
