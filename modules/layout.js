import { pourpreI, pourpreJ } from "./const.js";

let eltPV = document.getElementsByClassName("pv__text");
let eltRound = document.getElementsByClassName("Round");
let eltPourpre = document.getElementById('pourpre');

let eltNextRound = document.getElementsByClassName("nextRound");
let eltNextRoundOpenClose = document.getElementsByClassName("nextRound__openClose");
let eltNextRoundTable = document.getElementsByClassName("nextRound__table");

let eltRulesOpenClose = document.getElementsByClassName("rules__openClose");
let eltRulesText = document.getElementsByClassName("rules__text");

let eltPnjText = document.getElementById("pnj-text");
let eltPnj = document.getElementById("pnj-interrogation");
let eltCross = document.getElementById("cross");

let tableOpened = true;
let rulesOpened = true;

////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  HOME LAYOUT ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

export function homeLayoutInit(){
    eltPnj.addEventListener("click",()=>{
        eltPnjText.style.transform = 'scaleZ(1)';
    })
    eltCross.addEventListener("click",()=>{
        eltPnjText.style.transform = 'scaleZ(0)';
    })
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////  GAME LAYOUT ///////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////

export function gameLayoutInit(gamePageGrid,currentRound,myMob){
    // POURPRE 
    eltPourpre.style.top = `${gamePageGrid.grid[pourpreI][pourpreJ].coordY-eltPourpre.clientHeight*2/3}px`;
    eltPourpre.style.left = `${gamePageGrid.grid[pourpreI][pourpreJ].coordX-eltPourpre.clientWidth/2}px`;
    gamePageGrid.grid[pourpreI][pourpreJ].state = "unclickable";
   
    // ROUND
    eltRound[0].innerHTML = `Round ${currentRound}`;
    /// LIFE
    eltPV[0].innerHTML = `${myMob.player.PV}`;
    // TABLE ROUND
    let lastPos =[eltNextRound[0].style.top,eltNextRound[0].style.left];
    updateNextTable(currentRound,myMob);

    eltNextRoundOpenClose[0].addEventListener("click",roundOnMouseClick);
    function roundOnMouseClick(){
        if ( (eltNextRound[0].style.top == lastPos[0]) && (eltNextRound[0].style.left == lastPos[1])){
            if (tableOpened){
                eltNextRoundTable[0].style.transform = 'scaleX(0)';
                eltNextRoundOpenClose[0].style.transform = 'rotateZ(180deg)';
                tableOpened = false;
            }
            else{
                eltNextRoundTable[0].style.transform = 'scaleX(1)';
                eltNextRoundOpenClose[0].style.transform = 'rotateZ(0deg)';
                tableOpened = true;
            }
        }
        else{
            lastPos =[eltNextRound[0].style.top,eltNextRound[0].style.left];
        }
       
    }
    eltNextRoundOpenClose[0].addEventListener("mousedown",(event)=>{
            document.addEventListener('mousemove', roundOnMouseMove);
            function roundOnMouseMove(event){
                eltNextRound[0].style.top = `${event.pageY- eltNextRoundOpenClose[0].clientHeight/2 }px`;
                eltNextRound[0].style.left = `${event.pageX - eltNextRoundTable[0].clientWidth -eltNextRoundOpenClose[0].clientWidth/2 }px`;
            }
            eltNextRoundOpenClose[0].addEventListener('mouseup',()=>{
                document.removeEventListener('mousemove', roundOnMouseMove);
            })           
    })

    //RULES
    
    eltRulesOpenClose[0].addEventListener("click",rulesOnMouseClick);
    function rulesOnMouseClick(){
        
        if (rulesOpened){
            eltRulesText[0].style.transform = 'scaleX(0)';
            eltRulesOpenClose[0].style.transform = 'rotateZ(0deg)';
            rulesOpened = false;
            for ( let mob of myMob.mobList ){
                mob.elt[0].style.zIndex = '3';
            }
           
        }
        else{
            eltRulesText[0].style.transform = 'scaleX(1)';
            eltRulesOpenClose[0].style.transform = 'rotateZ(180deg)';
            rulesOpened = true;
            for ( let mob of myMob.mobList ){
                mob.elt[0].style.zIndex = '1';
            }
        }  
     
    }

}
export function gameLayoutUpdate(gamePageGrid,currentRound,myMob){
    //POURPRE
    gamePageGrid.grid[pourpreI][pourpreJ].state = "unclickable";
    /// LIFE
    eltPV[0].innerHTML = `${myMob.player.PV}`;
    // ROUND
    eltRound[0].innerHTML = `Round ${currentRound}`;
    // TABLE ROUND
    updateNextTable(currentRound,myMob);
}

function updateNextTable(currentRound,myMob){
    eltNextRoundTable[0].innerHTML = `<table> 
    <tr> <th> Round </th> <th> Minogolem's state </th> </tr>
    <tr> <td> ${currentRound+1} </td> <td> ${myMob.nextRound[0]} </td> </tr> 
    <tr> <td> ${currentRound+2} </td> <td> ${myMob.nextRound[1]} </td> </tr>
    <tr> <td> ${currentRound+3} </td> <td> ${myMob.nextRound[2]} </td> </tr>
    <tr> <td> ${currentRound+4} </td> <td> ${myMob.nextRound[3]} </td> </tr>
    <tr> <td> ${currentRound+5} </td> <td> ${myMob.nextRound[4]} </td> </tr> </table>`;
}


