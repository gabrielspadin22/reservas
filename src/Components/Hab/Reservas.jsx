import React, { useEffect, useState } from 'react';
import {  collection, addDoc, doc, writeBatch, onSnapshot } from 'firebase/firestore';
import { configCollectionRef, db } from '../../config/firebase';


const Formulario = () => {

const [hab, setNumeroHabitacion] = useState('');
const [pax, setNumeroPersonas] = useState('');
const [cel, setNumeroCeliacos] = useState('');
const [veg, setNumeroVeganos] = useState('');
const [time, setHorarioAsistencia] = useState('');
const [cuposDisponibles, setCuposDisponibles] = useState('');

function guardarHorario() {
    const select = document.getElementById("horario");
    const horarioSeleccionado = select.value;
    console.log("Horario seleccionado:", horarioSeleccionado);
    setHorarioAsistencia(horarioSeleccionado);
};

useEffect(()=>{

    const cupos = onSnapshot(configCollectionRef, (snapshot) => {
        const configInfo = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setCuposDisponibles(configInfo);
    });

    return () => {
        cupos();
    };

},[time]);

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
    
    console.log(cuposDisponibles[0].cupos)
    await addDoc(collection(db, 'reservas'), objeto);
    const batch = writeBatch(db);
    const sfRef = doc(db, "config", time);
    const found = cuposDisponibles.find((element) => element.id === time );
    console.log(found.cupos)
    batch.update(sfRef, {cupos: found.cupos - pax});
    await batch.commit();
    
    console.log(cuposDisponibles)
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
        <label htmlFor="horario">Selecciona un horario:</label>
        <select id="horario">
            <option value="8">8hs</option>
            <option value="9">9hs</option>
            <option value="10">10hs</option>
        </select>
        <input type="submit" value="Guardar" onClick={()=>{guardarHorario()}}/>
    </form>
);};

export default Formulario;