import React from 'react';
import './bar.css';
import { onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from "react";
import { reservasCollectionRef, configCollectionRef } from '../../config/firebase';







function Bar() {
    const [listaReservas, setListaReservas] = useState([]);
    const [cuposDisponibles, setCuposDisponibles] = useState(['']);
    const [time, setTime] = useState(8);
    const select = document.getElementById("horarioBar");

    function guardarHorario() {
        const horarioSeleccionado = select.value;
        console.log("Horario seleccionado:", horarioSeleccionado);
        setTime(parseInt(horarioSeleccionado));        
    };


    useEffect(() => {
        const reservas = onSnapshot(reservasCollectionRef, (snapshot) => {
            const itemsArray = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            const result = itemsArray.filter((item) => item.time === time);
            setListaReservas(result);
        });

        const cupos = onSnapshot(configCollectionRef, (snapshot) => {
            const configInfo = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCuposDisponibles(configInfo.find(({ id }) => id === time).cupos);
        });

        return () => {
            cupos()
            reservas();
        };
    }, [time, select]);

    return (
        <div id="tablero" className='bg-dark gap-2'>
            <div>
                <label htmlFor="horarioBar">Selecciona un horario:</label>
                <select id="horarioBar"  onChange={(e) => guardarHorario()}>
                    <option value={8}>8hs</option>
                    <option value={9}>9hs</option>
                    <option value={10}>10hs</option>
                </select>
            </div>
            <div className='fs-3 text-light'>Cupos disponibles: {cuposDisponibles}</div>
            {listaReservas ? listaReservas.map(reserva => 
            <div key={reserva.id} className='border bg-success p-1 m-1'>
                <div>Habitacion Nº {reserva.hab}</div>
                <div>Pax's: {reserva.pax}</div>
                <div>Horario: {reserva.time}HS</div>
                <div>Celiaco: {reserva.cel} </div>
                <div>Vegano: {reserva.veg} </div>
            </div>) 
            : 
            <div>No hay resevas</div>}
        </div>
    );
}

export default Bar;