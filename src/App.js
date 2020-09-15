import React, { useState } from "react";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import { useDispatch, useSelector } from "react-redux";
import { addName } from "./redux/actions"
import "./App.css";

// eslint-disable-next-line no-restricted-globals
const HOST = location.origin.replace(/^http/, 'ws')
const socket = new W3CWebSocket(HOST);

//const socket = new W3CWebSocket("ws://");


const titles = [{ fullName: "ФИО" }, { jobTitle: "Должность" }, { salary: "Оклад" }, { currentStatus: "Статус" }, { startDate: "Дата приема на работу" }];

function App() {

  //redux
  const dispatch = useDispatch();
  const [name, setName] = useState('');
  const names = useSelector((state) => state.names);

  //socket recieve data and assign to cells
  socket.onmessage = (event) => {
    const change = JSON.parse(event.data);
    saveLocalFromServer(event.data)
    const targetCell = document.getElementById(change.cell);
    targetCell.value = change.value;
  };

  //save data coming from server to local storage
  const saveLocalFromServer = (commingData) => {
    let dataForId = JSON.parse(commingData)
    localStorage.setItem(`${dataForId.cell}`, commingData)
  }

  //render table header
  const renderHeaders = () => {
    return titles.map((key, index) => {
      return <th key={index} className="tableHead">{Object.values(key)}</th>;
    });
  };

  //send changes to server and call function save to local storage
  const sendToServer = (event) => {
    let message = JSON.stringify({
      cell: event.target.id,
      value: event.target.value,
    })
    setName(message)
    dispatch(addName(message))
    saveToLocalStorage(message)
    socket.send(message);
  };

  //get current local storage keys
  function getLocalStorageKeys() {
    return Object.keys(localStorage)
  }

  //put data from local storage into cells while first app load
  const insertDataFromStorage = (id) => {
    let ids = getLocalStorageKeys()
    for (let i = 0; i < ids.length; i++) {
      if (ids[i] === id) {
        let localData = localStorage.getItem(`${id}`)
        localData = JSON.parse(localData)
        return (localData.value)
      }
    }
  }

  //save data to local storage from input
  const saveToLocalStorage = (message) => {
    let newData = JSON.parse(message)
    localStorage.setItem(`${newData.cell}`, message)
  }

  //default number of rows
  let rows = [1, 2, 3, 4, 5];

  //render rows
  const createRow = (rows) => {
    return (
      rows.map((i, index) =>
        <tr id="i" key={index} >
          <td>
            <input
              id={
                Object.keys(titles[0]) + i
              }
              type="text"
              onChange={(e) => { sendToServer(e) }}
              value={insertDataFromStorage(Object.keys(titles[0]) + i)}
            ></input>
          </td>
          <td>
            <input
              id={Object.keys(titles[1]) + i}
              type="text"
              onChange={(e) => sendToServer(e)}
              value={insertDataFromStorage(Object.keys(titles[1]) + i)}
            ></input>
          </td>
          <td>
            <input
              id={Object.keys(titles[2]) + i}
              type="number"
              value={insertDataFromStorage(Object.keys(titles[2]) + i)}
              onChange={(e) => sendToServer(e)}
            ></input>
          </td>
          <td>
            <select
              id={Object.keys(titles[3]) + i} size="1" onChange={(e) => sendToServer(e)}
              value={insertDataFromStorage(Object.keys(titles[3]) + i)}
            >
              <option></option>
              <option>Соискатель</option>
              <option>Сотрудник</option>
              <option>Уволен</option>
            </select>
          </td>
          <td className="dateInput">
            <input 
              id={(Object.keys(titles[4]) + i)}
              type="date"
              value={insertDataFromStorage(Object.keys(titles[4]) + i)}
              onChange={(e) => sendToServer(e)}
            ></input>
          </td>
        </tr>
      )
    );
  };

  return (
    <>
      <div className="header">
        <h1>Сотрудники</h1>
      </div>

      <table className="table">
        <thead>
          <tr>
            {renderHeaders()}
          </tr>
        </thead>
        <tbody>{createRow(rows)}</tbody>
      </table>
    </>
  );
}

export default App;
