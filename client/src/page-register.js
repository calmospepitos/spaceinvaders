import { register } from './chat-api';
import { AudioControl } from './page-index';

// NE PAS CHANGER CE CODE, SEULEMENT AJOUTER
window.addEventListener("load", () => {
    document.querySelector("form").onsubmit = function () {
        return register(this);
    }

    // MUSIQUE
    const audioControl = new AudioControl();
})
