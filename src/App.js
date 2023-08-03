import './App.css';
import { getDocs, collection, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from "react";
import { db } from './config/firebase';
import Reservas from './Reservas';

function App() {

const [listaReservas, setListaReservas] = useState([]);

  useEffect(() => {
    const reservasCollectionRef = collection(db, 'reservas');

    const reservas = onSnapshot(reservasCollectionRef, (snapshot) => {
      const itemsArray = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListaReservas(itemsArray);
    });

    return () => {
      console.log(listaReservas)
      reservas();
    };
  }, []);

  return (
    <div className="App ">
      <div className='d-flex gap-2 bg-dark '>
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
      <Reservas></Reservas>
    </div>
  );
}

export default App;
