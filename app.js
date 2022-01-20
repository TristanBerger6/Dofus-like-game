import { vh,vw,gameGrid,homeGrid,startCellI,startCellJ,gameStartCellI,gameStartCellJ, pourpreI, pourpreJ,PVStart} from "./modules/const.js";
import { Grid } from "./modules/grids.js";
import { Player, playerCanvas } from "./modules/player.js";
import { Mobs } from "./modules/mobs.js";
import { gameLayoutInit, gameLayoutUpdate, homeLayoutInit } from "./modules/layout.js";
import { audioInit, audioMainTheme, audioFightTheme, audioSwitch } from "./modules/audio.js";
import { getTimeMilli } from "./modules/utils.js";

window.addEventListener ('resize', ()=> location.reload()); // reload on resize
window.addEventListener('load', ()=>{
    if ( (window.innerWidth <= 800) && (window.innerHeight <= 600) ){
        alert('This game is not optimized for small screen')
    }
})

////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  VARIABLES ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////


// ---------- GAME VARIABLES --------------------------//

let pass = false;
let quit = false;
let newClick = null;
let lastClick = null;
let currentRound = 1;
let dofusFound = false;


// ---------- HTML ELT ----------------------------------//

let eltStart = document.getElementById("start-page");
let eltHome = document.getElementById("home-page");
let eltGame = document.getElementById("game-page");
let eltEnd = document.getElementById("end-page");
let eltEndWin = document.getElementById("end-page-win");
let eltEndLose = document.getElementById("end-page-lose");

let eltStartBtn = document.getElementById("start-page-btn");
let eltBtnWin = document.getElementById("end-page-btnWin");
let eltBtnLose = document.getElementById("end-page-btnLose");

let eltPourpre = document.getElementById('pourpre');
let eltPortal = document.getElementById('portal');
let eltPass = document.getElementById("pass");
let eltQuit = document.getElementById("quit");


////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  INIT GAME - GLOBAL FUNCTIONS ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////


let homePageGrid = new Grid(homeGrid.elt,homeGrid.row,homeGrid.col,homeGrid.startCellX,homeGrid.startCellY,homeGrid.obstaclePos,"none");
let player = new Player(homePageGrid,startCellI,startCellJ);
let gamePageGrid = new Grid(gameGrid.elt,gameGrid.row,gameGrid.col,gameGrid.startCellX,gameGrid.startCellY,gameGrid.obstaclePos,"rgb(142,134,94)");
let myMob = new Mobs(player,gamePageGrid);
gameInit();



function gameInit(){
    eltStartBtn.addEventListener("click",callbackStartPage);// Starting page event listener
    eltPourpre.addEventListener("click", foundDofus); // Check if dofus is catchable
    eltBtnWin.addEventListener("click",callbackEndpage) // Ending page event listener, reload the game on click
    eltBtnLose.addEventListener("click",callbackEndpage) // Ending page event listener, reload the game on click
    homeLayoutInit(); // layout init for home and game
    gameLayoutInit(gamePageGrid,currentRound,myMob);
    audioInit();
    
    startGame(); // start the game
}

function callbackStartPage(){
    eltStart.style.zIndex = '-99'; // remove starting page forever ( until next reload of the page)
    audioMainTheme();
}

function callbackEndpage(){
    audioMainTheme(); // replace the fight theme by the main theme
    startGame(); // restart the game
}

function startGame(){
    // Clean up if player has already played
    eltEnd.style.zIndex = '-2'; // reset the pages z-index to have home -> game -> end
    eltGame.style.zIndex = '-1';
    eltHome.style.zIndex = '1';
    myMob.removeRocks(eltGame); // remove rocks of the mobs
    player.defaultCell(); // erase proposed cells
    player.myGrid = homePageGrid; // home page grid attached to the player
    player.teleportTo(startCellI,startCellJ); // teleport player to the start position in the home page  
    eltHome.appendChild(playerCanvas);
    gamePageGrid.clearCell(); // reset cells of the grid

    //prepare the game phase
    activatePortal();
    homePageGrid.eltGrid.addEventListener("click", player.gridEvent ); 
    document.addEventListener("mousemove",player.playerOrientation);
    myMob.init(); // random nextRounds and mob names
    player.PV = PVStart;
    currentRound = 1;
    gameLayoutUpdate(gamePageGrid,currentRound,myMob); // update layout values of the game page

}

function endGame(state){
    eltEnd.style.zIndex ='3'; // display end game page
    eltGame.removeEventListener("click", gameLoop); //remove event listener relative to the game
    eltPass.removeEventListener("click", passCallback);
    eltQuit.removeEventListener("click", quitCallback);
    
    switch (state){ // display the according end page ( win or lose)
        case "win" :
            eltEndWin.style.transform = 'scaleZ(1)';
            eltEndLose.style.transform = 'scaleZ(0)';
        break;
        case "lose":
            eltEndWin.style.transform = 'scaleZ(0)';
            eltEndLose.style.transform = 'scaleZ(1)';
        break;
    }
}

function foundDofus(){ // when click on the dofus, check if it is catchable ( player on a neighbouring cell)
    for ( let i = -1; i<2; i++ ){
        for ( let j = -1; j<2; j++){
            if ( pourpreI+i >= 0 && pourpreJ+j >= 0 && pourpreI+i <= gamePageGrid.row && pourpreJ+j <= gamePageGrid.col-1){
                if ( player.currentCell.i == gamePageGrid.grid[pourpreI+i][pourpreJ+j].i && player.currentCell.j == gamePageGrid.grid[pourpreI+i][pourpreJ+j].j  ){
                    dofusFound = true;  
                }
            }
            
        }
    }
}



////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  PORTAL ACTIVATION ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

function activatePortal(){ // portal between home page and game page
    eltPortal.addEventListener('click', portalCallback);
}

async function portalCallback(event){
    player.newMotion = true; // in case the player is currently on movement, stops him
    homePageGrid.eltGrid.removeEventListener("click", player.gridEvent ); // disable event on home page grid
    document.removeEventListener("mousemove",player.playerOrientation);

    setTimeout(()=>{ // wait 1s to let time to the animation to stop
        player.movementPlayerOnClick(homePageGrid.grid[1][13].coordX,homePageGrid.grid[1][13].coordY).then(() => {
            eltGame.style.zIndex = '2';  // game page visible
            player.myGrid = gamePageGrid; // game grid attached to the player
            player.teleportTo(gameStartCellI,gameStartCellJ);   
            eltGame.appendChild(playerCanvas); 
            GameOn();  // starts the game
            audioFightTheme(); // switch audio theme
         } );
    },1000)
    eltPortal.removeEventListener('click', portalCallback);
}




////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  GAME LOOP ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

async function GameOn(){
    player.proposeCell(); // propose cells to the player
    eltGame.addEventListener("click", gameLoop); // add eventlistener relative to the game
    eltPass.addEventListener("click", passCallback); // eltpass and eltquit are childrens of eltGame. when cliqued, 
    eltQuit.addEventListener("click", quitCallback); // the propagation trigger the eltGame callback function
}

async function gameLoop(event){

    if ( quit == true ){ // user quitted
        endGame("lose");
        dofusFound = false; // reset variables instantly
        quit = false;
    }
    else if ( dofusFound == false){
        newClick = getTimeMilli(); // To avoid spam clicking
        if ( (newClick - lastClick)<1000 ) { return;}  
        lastClick = newClick;
        let xClick = event.clientX + window.scrollX;
        let yClick = event.clientY + window.scrollY;
        
        for ( let cell of player.proposedCell ){
            if ( player.testInCell(xClick,yClick,cell,player.myGrid) == true ){
                player.movementPlayerOnClick(xClick,yClick).then(() => {
                    player.inMotion = false;
                    player.defaultCell(); // erase proposed cells 
                    player.PV --;
                    currentRound ++;
                    setTimeout(() => { // Mob switch 500ms after user played
                        myMob.play(myMob.nextRound[0]);
                        audioSwitch();
                        myMob.nextRound.shift(); // new random color for nextRound
                        myMob.nextRound.push(myMob.randomToColor(Math.floor(Math.random()*3)));
                        gameLayoutUpdate(gamePageGrid,currentRound,myMob);
                        player.proposeCell();  
                        if ( player.PV <= 0 ){
                            endGame("lose");
                            dofusFound = false;
                            quit = false;
                        }             
                    }, 500);
                   
                }); 
            }
        }
        if ( pass == true ){ // user has cliqued on pass, which also triggers the gameLoop event by propagation
            player.PV --;
            currentRound ++;
            myMob.play(myMob.nextRound[0]);
            audioSwitch();
            myMob.nextRound.shift();
            myMob.nextRound.push(myMob.randomToColor(Math.floor(Math.random()*3)))
            gameLayoutUpdate(gamePageGrid,currentRound,myMob);
            pass = false;
        }
    }
    else if ( dofusFound == true) { // user has cliqued on dofus pourpre
        endGame("win");
        dofusFound = false;
    }
    
}

async function passCallback(event){
    pass = true;
}

async function quitCallback(event){
    quit = true;
}









