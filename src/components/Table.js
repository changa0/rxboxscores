import React, { useState, useEffect } from 'react';
import './Table.css';
import * as samples from '../samples.js';

// helper to create header, put it outside of component to prevent re-creation upon re-render
function createHeader(currentQuarter) {
  let extra = [];

  // OT tonight
  if ( currentQuarter > 4 ) {
    for ( let i = 1; i <= currentQuarter - 4; i++ ) {
      if ( i === 1 ) {
        extra.push("OT");
      } else {
        extra.push(`OT${i}`);
      }
    }
  }

  return (
      <thead>
        <tr>
          <th>Team</th>
          <th>Q1</th>
          <th>Q2</th>
          <th>Q3</th>
          <th>Q4</th>
          {extra.map( (ot) => <th key={ot}>{ot}</th> )}
        </tr>
      </thead>
  )
}

// helper to create scores for quarter box
function createQuarterScores(currentQuarter, team) {
  let showQuarters = 4; // make 4 cells/quarters at the least
  let quarterScores = [];

  if ( currentQuarter > 4 ) showQuarters = currentQuarter;
    for ( let i = 1; i <= showQuarters; i++ ) {
      if ( i < 5 && i <= currentQuarter ) {
        quarterScores.push( team[`q${i}`] );
      } else if ( i > 4 ) {
        quarterScores.push( team[`ot${(i - 4)}`] );
      } else { // if quarter hasn't been played yet
        quarterScores.push("-");
      }
  }

  return (
    <>{quarterScores.map( (score, index) => <td key={index}>{score}</td> )}</>
  )
}

function QuarterBox(props) {
  const currentQuarter = props.currentQuarter;
  const away = props.away;
  const home = props.home;

  return (
    <table id="quarter-table">
      {createHeader(currentQuarter)}
      <tbody>
        <tr>
          <td>{away.ta}</td>
          {createQuarterScores(currentQuarter, away)}
        </tr>
        <tr>
          <td>{home.ta}</td>
          {createQuarterScores(currentQuarter, home)}
        </tr>
      </tbody>
    </table>
  );
}

function Row(props) {
  const { num, fn, ln, pos, min, sec, pts, fgm, fga, tpm, tpa, ftm, fta, reb, oreb, dreb, ast, blk, stl, tov, blka, pf, pm, court } = props.player;

  return (
    <tr className={court ? 'on-court' : ''}>
      <td>{fn} {ln}</td>
      <td>{pos}</td>
      <td>{min}:{sec}</td>
      <td>{pts}</td>
      <td>{fgm}-{fga}</td>
      <td>{tpm}-{tpa}</td>
      <td>{ftm}-{fta}</td>
      <td>{reb}</td>
      <td>{oreb}</td>
      <td>{dreb}</td>
      <td>{ast}</td>
      <td>{blk}</td>
      <td>{stl}</td>
      <td>{tov}</td>
      <td>{blka}</td>
      <td>{pf}</td>
      <td>{pm}</td>
    </tr>
  )
}

function TeamBoxscore(props) {
  const teamData = props.teamData;

  const playerData = teamData.pstsg ? teamData.pstsg : []; // player data might not be generated if game hasn't started
  let inactive = []
  
  const body = playerData.map( (player) => {
    if ( player.status === "I" ) {
      inactive.push(`${player.fn} ${player.ln}`);
    } else {
      return (
        <Row key={`${player.fn}${player.ln}`} player={player}/>
      );
    }
    return null;
  });

  return (
    <React.Fragment>
      <h2>{`${teamData.tc} ${teamData.tn}`}</h2>
      <table className="box-table">
        <thead className="tooltippable">
          <tr>
            <th></th>
            <th>Pos</th>
            <th>Min</th>
            <th>Pts</th>
            <th>FG</th>
            <th>3Pt</th>
            <th>FT</th>
            <th>Reb</th>
            <th>Off</th>
            <th>Def</th>
            <th>Ast</th>
            <th>Blk</th>
            <th>Stl</th>
            <th>TO</th>
            <th>BA</th>
            <th>PF</th>
            <th>+/-</th>
          </tr><span>Off: Offensive rebounds<br/>Def: Defensive rebounds<br/>BA: Blocked shot attempts<br/>Bolded players: On court</span>
        </thead>
        <tbody>
          {body}
        </tbody>
      </table>
      <h5>Inactive: {inactive.join(' | ')}</h5>
    </React.Fragment>
  )
}

function TeamRecords(props) {
  const game = props.game;

  const homeAbbrev = game.hTeam.triCode;
  const homeRecord = `${game.hTeam.win}-${game.hTeam.loss}`;
  const awayAbbrev = game.vTeam.triCode;
  const awayRecord = `${game.vTeam.win}-${game.vTeam.loss}`;

  return (
    <React.Fragment>
      <h4>Team Records</h4>
      <table id="record-table">
        <tbody>
          <tr>
            <td>{awayAbbrev}</td>
            <td>{awayRecord}</td>
          </tr>
          <tr>
            <td>{homeAbbrev}</td>
            <td>{homeRecord}</td>
          </tr>
        </tbody>
      </table>
    </React.Fragment>
  )
}

function MainBoxscore(props) {
  const data = props.data;

  return (
    <div className="box-area">
        <TeamBoxscore teamData={data.vls} />
        <TeamBoxscore teamData={data.hls} />
    </div>
  )
}

function genUrl(gameId, season) {
  const GAME_URL_PRE = "https://data.nba.com/data/v2015/json/mobile_teams/nba/";
  const GAME_URL_PART = "/scores/gamedetail/";
  const GAME_URL_SUFFIX = "_gamedetail.json";
  // can't use proxy on local since not whitelisted
  const PROXY_URL = !window.location.href.match(/github.io/) ? '' : 'https://corsrouter.herokuapp.com/';
  const url = PROXY_URL + GAME_URL_PRE + season + GAME_URL_PART + gameId + GAME_URL_SUFFIX;
  return url;
}

function Table(props) {
  const scoreboard = props.scoreboard;
  const selected = props.selected;
  const lastRefreshed = props.lastRefreshed;

  const gameId = scoreboard[selected].gameId;
  const season = scoreboard[selected].seasonYear;

  // const [ boxscore, setBoxscore ] = useState(samples.longOt.g); // use for debugging
  const [ boxscore, setBoxscore ] = useState(samples.blankData.g);
  const [ tableHasError, setTableHasError ] = useState(false);

  const leftScore = boxscore.lpla ? boxscore.lpla.vs : 0;
  const rightScore = boxscore.lpla ? boxscore.lpla.hs : 0;
  let gameStatus;

  if ( boxscore.stt === 'Final' ) {
    gameStatus = 'Final';
  } else {
    const clock = boxscore.cl ? boxscore.cl.replace(/^0+/, '') : '';
    gameStatus = `${boxscore.stt}  ${clock}`;
  }

  useEffect(() => {
    const gameUrl = genUrl(gameId, season);

    fetch(gameUrl)
    .then(res => res.json())
    .then(
      (result) => {
        setBoxscore(result.g);
        console.log(lastRefreshed);
      },
      (error) => {
        setTableHasError(true);
        console.log("error");
      }
    )
  }, [gameId, season, lastRefreshed]);

  // what to display before ajax completes
  if ( !boxscore ) {
    return (<h2>Loading...</h2>)
  }

  if (!tableHasError) {
    if (!boxscore.p) {
      return (
        <div id="placeholder">
          <h2>{`${boxscore.vls.tc} ${boxscore.vls.tn}`} at {`${boxscore.hls.tc} ${boxscore.hls.tn}`}</h2>
          <h1 className="message">Game begins at</h1>
          <h2 className="message">{gameStatus}</h2>
          { scoreboard ? <TeamRecords game={scoreboard[selected]} /> : <span>Loading...</span> }
        </div>
      );
    }
    return (
      <div id="placeholder">
        <h2>{`${boxscore.vls.tc} ${boxscore.vls.tn}`} at {`${boxscore.hls.tc} ${boxscore.hls.tn}`}</h2>
        <h1 className={leftScore > rightScore ? 'leading' : ''}>{leftScore}</h1>
        <h1>–</h1>
        <h1 className={rightScore > leftScore ? 'leading' : ''}>{rightScore}</h1>
        <h2>{gameStatus}</h2>
        <QuarterBox currentQuarter={boxscore.p} away={boxscore.vls} home={boxscore.hls} />
        <MainBoxscore data={boxscore}/>
        { scoreboard ? <TeamRecords game={scoreboard[selected]} /> : <span>Loading...</span> }
      </div>
    );
  } else {
    return (<h3>Error loading ajax request for table</h3>)
  }

}

export default Table;