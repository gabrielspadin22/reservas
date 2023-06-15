import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

document.getElementById('8hs').addEventListener('click', ()=>{fijar_horario(8)});
document.getElementById('9hs').addEventListener('click', ()=>{fijar_horario(9)});
document.getElementById('10hs').addEventListener('click', ()=>{fijar_horario(10)});

document.getElementById("personas").addEventListener("change", function() {
    let v = parseInt(this.value);
    if (v < 1) this.value = 1;
    if (v > 50) this.value = 20;
});

let btnC = document.getElementById("celiaco");
let btnV = document.getElementById("vegano");
let horario;
let celiaco = false;
let vegano = false;
let reservas;

function reserva(cantidad, celiaco, vegano, horario) {
    this.cantidad = cantidad;
    this.celiaco = celiaco;
    this.vegano = vegano;
    this.horario = horario;
};

function fijar_horario(hora) {
    horario = hora;
};

// FIREBASE
const appSettings = {
    databaseURL: "https://reservas-pn-default-rtdb.firebaseio.com/"
};
const app = initializeApp(appSettings)
const database = getDatabase(app)
const reservasDB = ref(database, "reservas_confirmadas")

// GET
onValue(reservasDB, function(snapshot) {
    reservas = Object.values(snapshot.val());
    console.log(reservas);
});

// PUSH
document.getElementById("ok").addEventListener('click', () =>{
    let cantidad = document.getElementById("personas").value; 
    if (cantidad === 0 || cantidad === null || horario == undefined) {
        alert("Favor ingrese la cantidad de personas y el horario");
    } else {
        if (btnC.checked) {
            celiaco = true;
        }else{
            celiaco = false;
        };
        
        if (btnV.checked) {
            vegano = true
        }else{
            vegano = false;
        };
        let nueva_reserva = new reserva(cantidad, celiaco, vegano, horario);
        reservas.push(nueva_reserva);
        push(reservasDB, nueva_reserva)
    }
});