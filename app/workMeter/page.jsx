"use client";

import { useEffect, useRef, useState } from "react";

import "./style.scss";

function WorkMeter() {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [startDate, setstartDate] = useState(0);
  const [totalBreakTime, settotalBreakTime] = useState(0);
  const [totalHours, setTotalHours] = useState(0);
  const [totalSallery, setTotalSallery] = useState(0);

  const [startBtn, setStartBtn] = useState(false);
  const [endBtn, setEndBtn] = useState(false);
  const [breakBtn, setBreakBtn] = useState(false);
  const [endBreakBtn, setEndBreakBtn] = useState(false);

  const intervalRef = useRef(null);
  const tableRef = useRef(null);

  const buttonStatuses = [
    { key: "startBtn", setFunction: setStartBtn },
    { key: "endBtn", setFunction: setEndBtn },
    { key: "breakBtn", setFunction: setBreakBtn },
    { key: "endBreakBtn", setFunction: setEndBreakBtn },
  ];

  useEffect(() => {
    initializeButtons();
    const storedStartTime = localStorage.getItem("startTime");
    const storedBreakTime = localStorage.getItem("breakTime");
    const storedElapsedTime = localStorage.getItem("elapsedTime");
    const weekData = localStorage.getItem("weekData");
    if (weekData) {
      getSallery();
      getTotalHours();
    }
    if (storedBreakTime) {
      settotalBreakTime(parseInt(storedBreakTime, 10));
    }
    if (storedElapsedTime) {
      setElapsedTime(parseInt(storedElapsedTime, 10));
    }

    if (storedStartTime) {
      const startTime = parseInt(storedStartTime, 10);

      const now = Date.now();
      const savedElapsedTime =
        now - startTime + (parseInt(storedElapsedTime, 10) || 0);

      setElapsedTime(savedElapsedTime);
      setIsRunning(true);
      startInterval(startTime);
      setstartDate(startTime);
    }
    displayData();
  }, []);

  const startInterval = (startTime) => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setElapsedTime(
        now -
          startTime +
          parseInt(localStorage.getItem("elapsedTime") || "0", 10)
      );
    }, 10);
  };

  const startWork = () => {
    setStartBtn(false);
    localStorage.setItem("startBtn", "false");
    setBreakBtn(true);
    localStorage.setItem("breakBtn", "true");
    setEndBtn(true);
    localStorage.setItem("endBtn", "true");

    const sound = new Audio("/sound.mp3");
    sound.play();
    if (!isRunning) {
      const startTime = Date.now();
      localStorage.setItem("startTime", startTime);
      setIsRunning(true);
      startInterval(startTime);
      setstartDate(startTime);
    }
  };

  const getBreak = () => {
    setBreakBtn(false);
    localStorage.setItem("breakBtn", "false");
    setEndBreakBtn(true);
    localStorage.setItem("endBreakBtn", "true");
    const sound = new Audio("/sound2.mp3");
    sound.play();
    if (isRunning) {
      clearInterval(intervalRef.current);
      const storedStartTime = parseInt(localStorage.getItem("startTime"), 10);
      const now = Date.now();
      const updatedElapsedTime = elapsedTime;
      setElapsedTime(updatedElapsedTime);
      localStorage.setItem("elapsedTime", updatedElapsedTime);
      localStorage.setItem("startBreakTime", JSON.stringify(now));
      localStorage.removeItem("startTime");
      setIsRunning(false);
    }
  };

  const endBreak = () => {
    setEndBreakBtn(false);
    localStorage.setItem("endBreakBtn", "false");
    setBreakBtn(true);
    localStorage.setItem("breakBtn", "true");
    const sound = new Audio("/sound3.mp3");
    sound.play();
    const storedStartTime = parseInt(
      localStorage.getItem("startBreakTime"),
      10
    );
    const now = Date.now();
    const breakTime = now - storedStartTime;
    if (localStorage.getItem("breakTime")) {
      let breakTimes = JSON.parse(localStorage.getItem("breakTime"));
      breakTimes += breakTime;
      localStorage.setItem("breakTime", JSON.stringify(breakTimes));
      settotalBreakTime(breakTimes);
    } else {
      localStorage.setItem("breakTime", JSON.stringify(breakTime));
      settotalBreakTime(breakTime);
    }
    if (!isRunning) {
      const startTime = Date.now();
      setIsRunning(true);
      startInterval(startTime);
    }
  };

  const endWork = () => {
    setEndBtn(false);
    localStorage.setItem("endBtn", "false");
    setStartBtn(true);
    localStorage.setItem("startBtn", "true");
    setBreakBtn(false);
    localStorage.setItem("breakBtn", "false");
    setEndBreakBtn(false);
    localStorage.setItem("endBreakBtn", "false");
    const sound = new Audio("/sound4.mp3");
    sound.play();
    clearInterval(intervalRef.current);
    setIsRunning(false);
    saveData();
    displayData();
    resetData();
  };

  const formatTime = () => {
    const milliseconds = elapsedTime % 1000;
    const seconds = Math.floor(elapsedTime / 1000) % 60;
    const minutes = Math.floor(elapsedTime / 60000);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}:${String(Math.floor(milliseconds / 10)).padStart(2, "0")}`;
  };

  const timeFormater = (time) => {
    const seconds = Math.floor(time / 1000) % 60;
    const minutes = Math.floor(time / 60000);

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  const getTotalWorkAmount = () => {
    const minutes = Math.floor(elapsedTime / 60000);
    const minutePrice = 80 / 60;
    const Ammount = minutes * minutePrice;
    return Ammount;
  };

  const displayData = () => {
    const weekData = JSON.parse(localStorage.getItem("weekData")) || [];
    const tableData = weekData
      .map((data) => {
        return `   <tr>  <td>${data.data.startDate}</td>
      <td>${data.data.endDate}</td>
      <td>${data.data.totalBreakTime}</td>
      <td>${data.data.elapsedTime}</td>
      <td>${data.data.totalPrice} EGP</td> </tr>`;
      })
      .join("");
    tableRef.current.innerHTML = tableData;
  };

  const saveData = () => {
    const weekData = JSON.parse(localStorage.getItem("weekData")) || [];
    const Ammount = getTotalWorkAmount();
    const dayData = {
      day: new Date().getDay(),
      data: {
        startDate: new Date(startDate).toLocaleTimeString(),
        endDate: new Date().toLocaleTimeString(),
        totalBreakTime: timeFormater(totalBreakTime),
        elapsedTime: timeFormater(elapsedTime),
        totalPrice: Ammount.toFixed(2),
      },
    };
    weekData.push(dayData);
    localStorage.setItem("weekData", JSON.stringify(weekData));
    displayData();
    getSallery();
    getTotalHours();
  };

  const resetData = () => {
    setElapsedTime(0);
    settotalBreakTime(0);
    localStorage.removeItem("startTime");
    localStorage.removeItem("elapsedTime");
    localStorage.removeItem("breakTime");
    localStorage.removeItem("startBreakTime");
  };

  const createNewWeek = () => {
    localStorage.removeItem("weekData");
    displayData();
    getSallery();
    getTotalHours();
    resetData();
  };

  const getSallery = () => {
    const weekData = JSON.parse(localStorage.getItem("weekData")) || [];
    const totalPrice = weekData.reduce((acc, curr) => {
      return acc + parseFloat(curr.data.totalPrice);
    }, 0);
    setTotalSallery(totalPrice);
  };

  const getTotalHours = () => {
    const weekData = JSON.parse(localStorage.getItem("weekData")) || [];
    const totalHours = weekData.reduce((acc, curr) => {
      return acc + parseFloat(curr.data.elapsedTime.split(":")[0]);
    }, 0);
    setTotalHours(totalHours);
  };

  const initializeButtons = () => {
    const storedStartBtnStatus = localStorage.getItem("startBtn") || "true";
    const storedEndBtnStatus = localStorage.getItem("endBtn") || "false";
    const storedBreakBtnStatus = localStorage.getItem("breakBtn") || "false";
    const storedEndBreakBtnStatus =
      localStorage.getItem("endBreakBtn") || "false";

    if (storedStartBtnStatus === "true") {
      setStartBtn(true);
    }
    if (storedEndBtnStatus === "true") {
      setEndBtn(true);
    }
    if (storedBreakBtnStatus === "true") {
      setBreakBtn(true);
    }
    if (storedEndBreakBtnStatus === "true") {
      setEndBreakBtn(true);
    }
  };
  return (
    <>
      <div className="homePage">
        <div className="box">
          <h1 className="siteName">WORK METER</h1>
          <div className="timer">{formatTime()}</div>
          {startBtn && (
            <div className="startBtn" id="startBtn" onClick={startWork}>
              <button>Begin Work</button>
            </div>
          )}

          {breakBtn && (
            <div className="breakBtn" onClick={getBreak}>
              <button>Obtain Break</button>
            </div>
          )}

          {endBreakBtn && (
            <div className="endBreakBtn" onClick={endBreak}>
              <button>Resume Work</button>
            </div>
          )}

          {endBtn && (
            <div className="endBtn" onClick={endWork}>
              <button>Finish This Session</button>
            </div>
          )}

          <div className="infoTable">
            <table>
              <thead>
                <tr>
                  <th>From</th>
                  <th>To</th>
                  <th>Break Time</th>
                  <th>Total Time</th>
                  <th>Session Amount</th>
                </tr>
              </thead>
              <tbody ref={tableRef}></tbody>
            </table>
          </div>
          <div className="finalDetails">
            <div className="inputContainer">
              <label htmlFor="">Total Weekly Time</label>
              <strong>{totalHours} MIN</strong>
            </div>
            <div className="inputContainer">
              <label htmlFor="">Weekly Total Amount</label>
              <strong>{totalSallery} EGP</strong>
            </div>
          </div>
          <div className="NewWeekBtn" onClick={createNewWeek}>
            <button>Create New Week </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WorkMeter;
