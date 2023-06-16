import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

let mapa = document.getElementById('mapa');
let reservas;

const box = document.createElement("div");

// FIREBASE
const appSettings = {
    databaseURL: "https://reservas-pn-default-rtdb.firebaseio.com/"
};
const app = initializeApp(appSettings)
const database = getDatabase(app)
const reservasDB = ref(database, "reservas_confirmadas")

// GET
onValue(reservasDB, function(snapshot) {
    try {
        reservas = Object.values(snapshot.val());
        console.log(reservas);
        mostrar();
    } catch (error) {
        console.log(error)
    }
    
});


function mostrar() {
    for (let index = 0; index < reservas.length; index++) {
        const box = document.createElement("div");
        box.innerHTML = `<div class="border bg-success text-center m-2 py-2 px-1 fs-5">
                            <div>Hab ${reservas[index].hab}</div>
                            <div>PAXs ${reservas[index].cantidad}</div>
                            <div>Celiacos ${reservas[index].celiaco}</div>
                            <div>Veganos ${reservas[index].vegano}</div>
                        </div>`;
        mapa.appendChild(box);
        console.log(reservas[index].cantidad)
    }
}


