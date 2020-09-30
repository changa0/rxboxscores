import React from 'react';
import './Nav.css';

function Selector(props) {
    const games = props.games;
    const handler = props.handler;
    const selected = props.selected;
    const selectedStatus = ( games && games.length > 0 ) ? games[selected].statusNum : 0;

    const options = games.map( (game, index) =>
    {
        const awayTeam = game.vTeam.triCode;
        const homeTeam = game.hTeam.triCode;
        const gameStatus = game.statusNum; // 1 for yet to start, 2 for in progress, 3 for finished
        const statusMessage = gameStatus === 3 ? 'Final' : game.startTimeEastern;
        const activeStatus = gameStatus !== 1 ? 'active' : 'inactive';

        return <option key={game.gameId} value={index} className={activeStatus}>{`${awayTeam} vs. ${homeTeam} - ${statusMessage}`}</option>
    });

    return (
        <select id="dropdown" className={selectedStatus === 1? 'inactive' : 'active'} onChange={e => handler(e.currentTarget.value)} value={selected}>
            {options}
        </select>
    )
}

function ButtonCluster(props) {
    const handleRefresh = props.handleRefresh;
    const handleSelectedGame = props.handleSelectedGame;
    const maxLength = props.maxLength;
    let selected = props.selected;

    function refreshBtnHandler() {
        handleRefresh();
    }

    // bug not sure from what yet loads 2nd selection
    function arrowNav(direction) {

        if ( direction === "l" ) {
            if ( selected === 0 ) return;
            selected--;
        } else if (direction === "r") {
            if ( selected === maxLength - 1 ) return;
            selected++;
        }
        handleSelectedGame(selected);
    }

    return (
        <div className="buttons" >
        <button type="button" className="directional" onClick={() => arrowNav('l')}>&laquo;</button>
        <button type="button" onClick={refreshBtnHandler}>Update scores</button>
        <button type="button" className="directional" onClick={() => arrowNav('r')}>&raquo;</button>
    </div>
    )
}

function Nav(props) {
    const games = props.games;
    const selectHandler = props.selectHandler;
    const selected = props.selected;
    const handleRefresh = props.handleRefresh;

    return (
        <React.Fragment>
            <Selector games={games} handler={selectHandler} selected={selected} />
            <ButtonCluster handleRefresh={handleRefresh} handleSelectedGame={selectHandler} selected={selected} maxLength={games.length}/>
        </React.Fragment>
    )
}

export default Nav;