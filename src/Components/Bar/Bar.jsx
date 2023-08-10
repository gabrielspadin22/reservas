import React from 'react';
import './bar.css';
import { doc, writeBatch, onSnapshot} from 'firebase/firestore';
import { useEffect, useState } from "react";
import { reservasCollectionRef, configCollectionRef, db } from '../../config/firebase';

function Bar() {
    const [listaReservas, setListaReservas] = useState();
    const [cuposDisponibles, setCuposDisponibles] = useState(['']);
    const [time, setTime] = useState(8);
    const select = document.getElementById("horarioBar");
    let nuevosCupos;
    function guardarHorario() {
        const horarioSeleccionado = select.value;
        console.log("Horario seleccionado:", horarioSeleccionado);
        setTime(parseInt(horarioSeleccionado));        
    };
    
    let f = new Date();

    function mostrarHora() {
        let fecha = new Date();
        let horas = fecha.getHours();
        let minutos = fecha.getMinutes();
        
        horas = (horas < 10) ? '0' + horas : horas;
        minutos = (minutos < 10) ? '0' + minutos : minutos;
        
        let horaActual = horas + ':' + minutos;
        document.getElementById('reloj').innerHTML = horaActual;
    }
    setInterval(mostrarHora, 1000);


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
    }, [time, select, nuevosCupos]);

    async function actualizarCupos() {
        try {
            const batch = writeBatch(db);
            const sfRef = doc(db, "config", time.toString());
            batch.update(sfRef, {cupos: nuevosCupos});
            await batch.commit();
        } catch (error) {
            alert(error)
        }
        
    }


    return (
        <div className='d-flex '>
            <div className='d-flex flex-column gap-5 bg-secondary bg-opacity-50'>
                <div>
                    <h1>RESERVAS DESAYUNO</h1>
                    <div className='fs-3'>
                        <div id='dia'>{f.toLocaleDateString()}</div>
                        <div id="reloj"></div>
                    </div>
                </div>
                <div>
                    <label htmlFor="horarioBar">Seleccione un horario:</label>
                    <select id="horarioBar"  onChange={(e) => guardarHorario()}>
                        <option value={8}>8hs</option>
                        <option value={9}>9hs</option>
                    <option value={10}>10hs</option>
                    </select>
                    <div className=''>Cupos disponibles: {cuposDisponibles}</div>
                </div>
                <div>
                    <label htmlFor="modificarCupos" className='fs-5'>Modificar cupos:</label>
                    <input type="number" max={2} id="modificarCupos" onChange={(e) => nuevosCupos = e.target.value} /><br /><br />
                    <button type='button' onClick={()=>{actualizarCupos(); nuevosCupos = 0}}>Confirmar</button>
                </div>
                <div>Añadir horario</div>
            </div>
            <div id="tablero" className='bg-dark gap-2'>
                {listaReservas ? listaReservas.map(reserva => 
                <div key={reserva.id} className='border bg-success p-1 m-1'>
                    <div>Room: {reserva.hab}</div>
                    <div>Pax's: {reserva.pax}</div>
                    <div>Horario: {reserva.time}HS</div>
                    <div>Celiacos: {reserva.cel} </div>
                    <div>Veganos: {reserva.veg} </div>
                </div>) 
                : 
                <div className='text-light mx-auto fs-1'>No hay resevas creadas</div>}
            </div>
        </div>
    );
}

export default Bar;