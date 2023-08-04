import React from 'react';
import './bar.css';
import { onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { reservasCollectionRef, configCollectionRef } from '../../config/firebase';

function Bar() {

    const [listaReservas, setListaReservas] = useState([]);
    const [cuposDisponibles, setCuposDisponibles] = useState(['']);

    useEffect(() => {

        const reservas = onSnapshot(reservasCollectionRef, (snapshot) => {
            const itemsArray = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setListaReservas(itemsArray);
        });

        const cupos = onSnapshot(configCollectionRef, (snapshot) => {
            const configInfo = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setCuposDisponibles(configInfo);
        });

        return () => {
            reservas();
            cupos();
        };
    }, []);


    return (
        <div id="tablero" className='bg-dark gap-2'>
            {cuposDisponibles ? <div className='fs-3 text-light'>Cupos disponibles: {cuposDisponibles[0].cupos}</div> : ''}
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