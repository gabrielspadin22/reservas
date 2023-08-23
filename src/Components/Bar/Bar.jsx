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
    function guardarHorario() {
        const horarioSeleccionado = select.value;
        console.log("Horario seleccionado:", horarioSeleccionado);
        setTime(parseInt(horarioSeleccionado));        
    };
    let f = new Date();
/*
    async function deleteCollection(db, collectionPath, batchSize) {
        const collectionRef = db.collection(collectionPath);
        const query = collectionRef.orderBy('id').limit(batchSize);
      
        return new Promise((resolve, reject) => {
          deleteQueryBatch(db, query, resolve).catch(reject);
        });
      }
      
      async function deleteQueryBatch(db, query, resolve) {
        const snapshot = await query.get();
      
        const batchSize = snapshot.size;
        if (batchSize === 0) {
          // When there are no documents left, we are done
          resolve();
          return;
        }
      
        // Delete documents in a batch
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(db, query, resolve);
        });
      }
*/
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
    }, [time, select]);

    async function actualizarCupos() {
        try {
            let cuposInput = document.getElementById('modificarCupos').value;
            console.log(cuposInput);
            const batch = writeBatch(db);
            const sfRef = doc(db, "config", time.toString());
            batch.update(sfRef, {cupos: cuposInput});
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
                    <label htmlFor="modificarCupos" className='fs-5'>Actualizar cupos:</label>
                    <input type="number" max={2} id="modificarCupos" required /><br /><br />
                    <button type='button' onClick={()=>{actualizarCupos()}}>Confirmar</button>
                </div>
                <button type="button">Vaciar reservas</button>
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
                <div className='text-light mx-auto fs-1'>No hay resevas creadas en este horario</div>}
            </div>
        </div>
    );
}

export default Bar;