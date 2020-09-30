import React, {useState, useEffect} from 'react';
import './App.css';
import Table from './components/Table.js';
import Nav from './components/Nav.js';

/**
 * returns today's date, a parameter that can be used to prevent caching, and month, day, year components
*/
function getDate() {
  const date = new Date( Date.now() );
  // added a param to prevent caching of the jsonp response
  const noCache = date.getTime() - 1.515e12;
  // set options for date format
  const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
  };
  const formatted = new Intl.DateTimeFormat("en-US", options).format(date);
  const validatedDate = dateValidationHelper(formatted); // ["11/12/2014", "11", "12", "2014"]
  const month = validatedDate[1];
  const day = validatedDate[2];
  const year = validatedDate[3];

  return [formatted, noCache, month, day, year];
}

/**
 * returns the month, day, year components in format ["11/12/2014", "11", "12", "2014"]
*/
function dateValidationHelper(date) {
  const dateRegex = /(\d{1,2})\/(\d{1,2})\/(\d{4})/;
  const validatedDate = dateRegex.exec(date);
  return validatedDate;
}

function App() {
  // const SCOREBOARD_URL = "https://data.nba.com/data/10s/v2015/json/mobile_teams/nba/2019/scores/gamedetail/0041900312_gamedetail.json";
  const SCOREBOARD_URL = "https://data.nba.net/prod/v2/";
  const SCOREBOARD_URL_SUFFIX = "/scoreboard.json?noCache=";

  // state objects
  const [ scoreboard, setScoreboard ] = useState();
  const [ hasError, setHasError ] = useState(false);
  const [ selectedGame, setSelectedGame ] = useState(0);
  const [ lastRefreshed, setLastRefreshed ] = useState();

  function fetchScoreboard(date = null) {
    let noCache;

    if ( !date ) {
        date = getDate();
        noCache = date[1];
    } else {
        noCache = new Date(Date.now()).getTime() - 1.515e12;
    }

    const validatedDate = dateValidationHelper(date);

    if ( !validatedDate ) {
        console.log("Invalid date, takes MM/DD/YYYY");
        return;
    }

    const year = validatedDate[3];
    const month = ( validatedDate[1].length > 1 ) ? validatedDate[1] : '0' + validatedDate[1];
    const day = ( validatedDate[2].length > 1 ) ? validatedDate[2] : '0' + validatedDate[2];
    const formattedDateComponent = year + month + day;

    const url = SCOREBOARD_URL + formattedDateComponent + SCOREBOARD_URL_SUFFIX + noCache;

    // const url = SCOREBOARD_URL + '20190127' + SCOREBOARD_URL_SUFFIX; //test purposes, long ot
    // const url = SCOREBOARD_URL + '20200930' + SCOREBOARD_URL_SUFFIX; //test purpose, reg game

    fetch(url)
    .then(res => res.json())
    .then(
      (result) => {
        setScoreboard(result.games);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        setHasError(true);
        console.log("error");
      }
    )
  }

  function handleRefresh(selected) {
    fetchScoreboard();
    const date = new Date();
    setLastRefreshed( date );
    return;
  }

  function handleSelectedGame(selected) {
    setSelectedGame(selected);
    return;
  }

  useEffect(() => {
    fetchScoreboard();
  }, [])

  // what to display before ajax completes
  if ( !scoreboard ) {
    return (<h1>Loading...</h1>)
  }

  if (!hasError) {
    return (
      <div className="App">
        <header className="App-header">
          <div id="title">
            <h2>Box Scores</h2>
            <p>Get a box score from today's games</p>
          </div>
          <Nav games={scoreboard} selectHandler={handleSelectedGame} selected={selectedGame} handleRefresh={handleRefresh}/>
        </header>
        {scoreboard.length > 0 ? <Table scoreboard={scoreboard} selected={selectedGame} lastRefreshed={lastRefreshed}/> : <h2 className="no-games">No games available today</h2>}
      </div>
    );
  } else if ( scoreboard.length === 0 ) {
    return (<h1>No games today</h1>)
  } else {
    return (<h1>Error loading ajax request</h1>)
  }

}

export default App;