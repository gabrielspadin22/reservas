import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { useParams } from 'react-router-dom';

 // Tu configuración de Firebase
const firebaseConfig = { 
    apiKey: "AIzaSyB130nvJI3TIntwiKBdqo1rMNhtFROQ_zw", 
    authDomain: "reservas-pn.firebaseapp.com", 
    databaseURL: "https://reservas-pn-default-rtdb.firebaseio.com", 
    projectId: "reservas-pn", 
    storageBucket: "reservas-pn.appspot.com", 
    messagingSenderId: "922309275800", 
    appId: "1:922309275800:web:8a13096668b0295bb720ed" 
}; 


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const Formulario = () => {

const { parametro } = useParams();
const [hab, setNumeroHabitacion] = useState('');
const [pax, setNumeroPersonas] = useState('');
const [cel, setNumeroCeliacos] = useState('');
const [veg, setNumeroVeganos] = useState('');
const [time, setHorarioAsistencia] = useState('');

const handleSubmit = (e) => {
    e.preventDefault();
    crearObjetoEnFirestore(hab, pax, cel, veg, time);
};

    async function crearObjetoEnFirestore(hab, pax, cel, veg, time) {
    try {
    const objeto = {
        hab: hab,
        pax: pax,
        cel: cel,
        veg: veg,
        time: time
    };
        const docRef = await addDoc(collection(db, 'reservas'), objeto);
        console.log('Reserva creada con exito');
    } catch (error) {
        console.error('Error al guardar el objeto:', error);
    }
}


return (
    <form onSubmit={handleSubmit}>
        <label htmlFor="numeroHabitacion">Número de Habitación:</label>
        <input type="text" id="numeroHabitacion" value={hab} onChange={(e) => setNumeroHabitacion(e.target.value)} required /><br /><br />
        <label htmlFor="numeroPersonas">Cantidad de Personas:</label>
        <input type="number" id="numeroPersonas" value={pax} onChange={(e) => setNumeroPersonas(e.target.value)} required /><br /><br />
        <label htmlFor="numeroCeliacos">Cantidad de Celiacos:</label>
        <input type="number" id="numeroCeliacos" value={cel} onChange={(e) => setNumeroCeliacos(e.target.value)} required /><br /><br />
        <label htmlFor="numeroVeganos">Cantidad de Veganos:</label>
        <input type="number" id="numeroVeganos" value={veg} onChange={(e) => setNumeroVeganos(e.target.value)} required /><br /><br />
        <label htmlFor="horarioAsistencia">Horario de Asistencia:</label>
        <input type="text" id="horarioAsistencia" value={time} onChange={(e) => setHorarioAsistencia(e.target.value)} required /><br /><br />
        <input type="submit" value="Guardar" />
    </form>
);};

export default Formulario;