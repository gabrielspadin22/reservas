import React, { useEffect, useState } from 'react';
import {  collection, addDoc, doc, writeBatch, onSnapshot } from 'firebase/firestore';
import { configCollectionRef, db } from '../../config/firebase';
import Swal from 'sweetalert2'
import logo from "../../Img/logo.png";
import bg from "../../Img/bg.jpg";
import './Reservas.css';
import { useParams } from 'react-router';

const Formulario = () => {
    const {num} = useParams();
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
        });
        return () => {
            cupos();
        };
    },[time, t]);

    const handleSubmit = (e) => {
        e.preventDefault();
        found = cuposDisponibles.find(({ id }) => id === parseInt(time));
        if (found) {
            parseInt(pax) > found.cupos || found.cupos === 0 ? 
            Swal.fire({
                title: '¡UPS! No quedan disponibles',
                text: 'Por favor seleccione otro horario',
                icon: 'error',
                confirmButtonText: 'Ok'
            }) 
            :
            crearObjetoEnFirestore(num, pax, cel, veg, time);
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
            Swal.fire({
                title: 'Reserva creada con exito',
                icon: 'success',
                confirmButtonText: 'Ok'
            })
        } catch (error) {
            console.error('Error al guardar el objeto:', error);
            Swal.fire({
                title: 'Error al realizar reserva',
                text: 'Favor comuniquese con recepcion al 9911 / 9912',
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        }
    };

return (
    <div className='d-flex flex-column bg-secondary bg-opacity-50 h-100 '>
        <img id='bg' src={bg} alt="background" />
        <form onSubmit={handleSubmit} className='my-auto'>
            <h1 className='my-5'>Reserva de desayuno</h1>
            <h2 className='my-5'>Habitacion Nº {num}</h2>
            <label htmlFor="numeroPersonas" className='fs-5'>Cantidad de Personas:</label>
            <input className='px-1' type="number" id="numeroPersonas" value={pax} min={1} max={6} onChange={(e) => setNumeroPersonas(e.target.value)} required /><br /><br />
            <label htmlFor="numeroCeliacos" className='fs-5'>Cantidad de Celiacos:</label>
            <input className='px-1' type="number" id="numeroCeliacos" value={cel} min={0} max={pax == 0 ? 6 : pax} onChange={(e) => setNumeroCeliacos(e.target.value)} required /><br /><br />
            <label htmlFor="numeroVeganos" className='fs-5'>Cantidad de Veganos:</label>
            <input className='px-1' type="number" id="numeroVeganos" value={veg} min={0} max={pax == 0 ? 6 : pax} onChange={(e) => setNumeroVeganos(e.target.value)} required /><br /><br />
            <label htmlFor="horario">Selecciona un horario:</label>
            <div className='d-flex gap-2 my-5'>
                <button type='button' id='8hs' className='ms-auto border btn btn-light btn-outline-warning text-dark' value={8} onClick={()=>{setHorarioAsistencia(8)}}>
                    <p className='fs-3'>8Hs</p>
                    <small>({cuposTotalesDisponibles?cuposTotalesDisponibles[1].cupos : ""} Cupos disponibles)</small>
                </button>
                <button type="button" className='border btn btn-light btn-outline-warning text-dark' value={9} onClick={()=>{setHorarioAsistencia(9)}}>
                    <p className='fs-3'>9Hs</p>
                <small>({cuposTotalesDisponibles?cuposTotalesDisponibles[2].cupos : ""} Cupos disponibles)</small>
                </button>
                <button type="button" className='me-auto border btn btn-light btn-outline-warning text-dark' value={10} onClick={()=>{setHorarioAsistencia(10)}}>
                    <p className='fs-3'>10Hs</p>
                    <small>({cuposTotalesDisponibles?cuposTotalesDisponibles[0].cupos : ""} Cupos disponibles)</small>
                </button>
            </div>
            <input className='btn btn-light btn-outline-success rounded fs-4' type="submit" value="Reservar"/>
        </form>
        <div className='mx-auto mt-5'>
            <img  width={"150px"} id='logo' src={logo} alt="Logo_Pueblo_Nativo" />
        </div>
    </div>
);};

export default Formulario;