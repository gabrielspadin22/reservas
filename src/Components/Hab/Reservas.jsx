import React, { useEffect, useState } from 'react';
import {  collection, addDoc, doc, writeBatch, onSnapshot, deleteDoc } from 'firebase/firestore';
import { configCollectionRef, db, reservasCollectionRef } from '../../config/firebase';
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
    const [OldTime, setOldTime] = useState('');
    const [cuposDisponibles, setCuposDisponibles] = useState('');
    const [cuposTotalesDisponibles, setCuposTotalesDisponibles] = useState();
    const [tof, setToF] = useState(false);
    const [reservaExistente, setReservaExistente] = useState([]);
    const ssfRef = doc(db, "config", time.toString());
    let found;
    let t = document.getElementById('8hs');
    const batch = writeBatch(db);

    useEffect(()=>{
        const reservas = onSnapshot(reservasCollectionRef, (snapshot) => {
            const itemsArray = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const result = itemsArray.filter((item) => item.hab === num);
            setReservaExistente(result);
            if (result[0]) {
                setToF(true);
                setOldTime(result[0].time);
            } else {
                console.log("La reserva no existe");
            }
            console.log(tof);
            console.log(OldTime);
            console.log(time);
        });

        const cupos = onSnapshot(configCollectionRef, (snapshot) => {
            const configInfo = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCuposTotalesDisponibles(configInfo);
            setCuposDisponibles(configInfo);
        });
        return () => {
            setOldTime(time);
            reservas();
            cupos();
        };
    },[time, t, tof]);

    async function actualizarReserva() {
        try {
            const sfRef = doc(db, "reservas", reservaExistente[0].id);
            if (time != OldTime) {
                console.log('se cambio el horario');
                const actualizarTime = doc(db, "config", OldTime.toString());
                batch.update(actualizarTime, {cupos: parseInt(found.cupos) + parseInt(pax)})
            };
            pax > reservaExistente[0].pax ? batch.update(ssfRef, {cupos: parseInt(found.cupos) - parseInt(pax)}) : batch.update(ssfRef, {cupos: parseInt(found.cupos) + parseInt(pax)});
            batch.update(sfRef, {
                hab: num,
                pax: pax,
                cel: cel,
                veg: veg,
                time: time});
            await batch.commit();
        } catch (error) {
            console.log(error)
        }
    }

    async function eliminarReserva() {
        try {
            Swal.fire('Reserva cancelada', '');
            setToF(false);
            found = cuposDisponibles.find(({ id }) => id === parseInt(time));
            console.log(found);
            console.log(found.cupos);
            batch.update(ssfRef, {cupos: parseInt(found.cupos) + parseInt(pax)});
            await deleteDoc(doc(db, "reservas", reservaExistente[0].id));
            await batch.commit();
        } catch (error) {
            Swal.fire('Error', 'Favor contactarse con recepcion', 'error');
            console.log(error)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (tof) {
            alert("la reserva existe, desea continuar?");
            
            setToF(false);
            console.log(tof);
            Swal.fire({
                title: 'La reserva ya existe',
                text: 'Desea continuar?',
                showDenyButton: true,
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                confirmButtonText: 'Guardar reserva',
                denyButtonText: `Eliminar reserva`,
            }).then((result) => {
                /* Read more about isConfirmed, isDenied below */
                if (result.isConfirmed) {
                    found = cuposDisponibles.find(({ id }) => id === parseInt(time));
                    actualizarReserva();
                    Swal.fire('Reserva guardada!', '', 'success')
                } else if (result.isDenied) {
                    eliminarReserva()
                }
            })
        }else{
            alert("la reserva no existe");
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
        }



        
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
            <label htmlFor="horario">Seleccione un horario:</label>
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