import React, { useEffect, useState } from 'react';
import {  collection, addDoc, doc, writeBatch, onSnapshot } from 'firebase/firestore';
import { configCollectionRef, db } from '../../config/firebase';
import Swal from 'sweetalert2'
import logo from "../../Img/logo.png";
import bg from "../../Img/bg.jpg";
import './Reservas.css';

const Formulario = () => {

const [hab, setNumeroHabitacion] = useState('');
const [pax, setNumeroPersonas] = useState('');
const [cel, setNumeroCeliacos] = useState('');
const [veg, setNumeroVeganos] = useState('');
const [time, setHorarioAsistencia] = useState(0);
const [cuposDisponibles, setCuposDisponibles] = useState('');
const [cuposTotalesDisponibles, setCuposTotalesDisponibles] = useState();

let found;
let t = document.getElementById('8hs');
useEffect(()=>{
    const cupos = onSnapshot(configCollectionRef, (snapshot) => {
        const configInfo = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        setCuposTotalesDisponibles(configInfo);
        setCuposDisponibles(configInfo);
        console.log(cuposDisponibles);
        console.log(time);
    });
    return () => {
        cupos();
    };
},[time, t]);



const handleSubmit = (e) => {
    e.preventDefault();

    found = cuposDisponibles.find(({ id }) => id === parseInt(time));
    console.log(parseInt(pax));
    console.log(found)
    if (found) {
        parseInt(pax) > found.cupos || found.cupos === 0 ? 
        Swal.fire({
            title: '¡UPS! No quedan disponibles',
            text: 'Por favor seleccione otro horario',
            icon: 'error',
            confirmButtonText: 'Ok'
        }) 
        :
        crearObjetoEnFirestore(hab, pax, cel, veg, time);
    }else{
        console.log("Comuniquese con recepcion");
    };
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
    await addDoc(collection(db, 'reservas'), objeto);
    const batch = writeBatch(db);
    console.log(time)
    console.log(found.cupos)
    const sfRef = doc(db, "config", time.toString());
    batch.update(sfRef, {cupos: found.cupos - pax});
    await batch.commit();
    console.log("reserva creada atr")
    } catch (error) {
        console.error('Error al guardar el objeto:', error);
    }
};

return (
    <div className='d-flex flex-column'>
    <img id='bg' src={bg} alt="background" />
    <form onSubmit={handleSubmit} >
        <h1 className='mt-5'>Reserva de desayuno</h1>
        <label className='mt-5' htmlFor="numeroHabitacion">Número de Habitación:</label>
        <input type="text" id="numeroHabitacion" value={hab} onChange={(e) => setNumeroHabitacion(e.target.value)} required /><br /><br />
        <label htmlFor="numeroPersonas">Cantidad de Personas:</label>
        <input type="number" id="numeroPersonas" value={pax} min={1} onChange={(e) => setNumeroPersonas(e.target.value)} required /><br /><br />
        <label htmlFor="numeroCeliacos">Cantidad de Celiacos:</label>
        <input type="number" id="numeroCeliacos" value={cel} min={0} onChange={(e) => setNumeroCeliacos(e.target.value)} required /><br /><br />
        <label htmlFor="numeroVeganos">Cantidad de Veganos:</label>
        <input type="number" id="numeroVeganos" value={veg} min={0} onChange={(e) => setNumeroVeganos(e.target.value)} required /><br /><br />
        <label htmlFor="horario">Selecciona un horario:</label>
        <div className='d-flex gap-2 my-5'>
            <button type='button' id='8hs' className='btn-secondary p-1 rounded ms-auto' value={8} onClick={()=>{setHorarioAsistencia(8)}}>
                <p className='fs-3'>8Hs</p>
                <small>({cuposTotalesDisponibles?cuposTotalesDisponibles[1].cupos : ""} Cupos disponibles)</small>
            </button>
            <button type="button" className='btn-secondary p-1 rounded' value={9} onClick={()=>{setHorarioAsistencia(9)}}>
                <p className='fs-3'>9Hs</p>
                <small>({cuposTotalesDisponibles?cuposTotalesDisponibles[2].cupos : ""} Cupos disponibles)</small>
            </button>
            <button type="button" className='btn-secondary p-1 rounded me-auto' value={10} onClick={()=>{setHorarioAsistencia(10)}}>
                <p className='fs-3'>10Hs</p>
                <small>({cuposTotalesDisponibles?cuposTotalesDisponibles[0].cupos : ""} Cupos disponibles)</small>
            </button>
        </div>
        <input className='btn-success rounded fs-4' type="submit" value="Reservar"/>
    </form>
    <div className='mx-auto mt-5'>
        <img  width={"150px"} id='logo' src={logo} alt="Logo_Pueblo_Nativo" />
    </div>
    </div>
);};

export default Formulario;