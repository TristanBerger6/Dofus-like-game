import { vw,vh,cellWidth,cellHeight } from "./const.js";
import { getTimeMilli } from "./utils.js";
import { Dijkstra_init, Dijkstra } from './dijkstra.js'

// ----------------- Animation -------------------------------// 
let animPerCell = 10;
let forwardStepX = cellWidth/animPerCell;   // px 
let forwardStepY = cellHeight/animPerCell;   //px
let FPS = 40;  // 25Hz => 40ms


// -------------- Canvas Player creation -----------------//

let playerMoveOrigin = [Math.round(35*vw/1920),Math.round(85*vh/980)];   // x,y coords of the foot in the canvas
let playerCanvas = document.getElementById("player");
playerCanvas.width = Math.round(69*vw/1920);  // canvas dimensions
playerCanvas.height = Math.round(100*vh/980);


// ------------------ Sprite --------------------------------//
let spriteRow = 8;
let spriteCol = 11;
let spriteUrl = "./public/img/sprite_global.png";


//  ------------------- Sprite class ------------------------//
export class Player{
    
    constructor(myGrid,startCellI,startCellJ){

        this.myGrid = myGrid; // grid currently attached to the player
        self = this;

        // player canvas position at loading 
        this.canvas = playerCanvas;
        this.ctxCanvas = this.canvas.getContext('2d');
        this.posX = this.myGrid.grid[startCellI][startCellJ].coordX-playerMoveOrigin[0]; 
        this.posY = this.myGrid.grid[startCellI][startCellJ].coordY-playerMoveOrigin[1]; 
        this.canvas.style.top = this.posY+"px";
        this.canvas.style.left = this.posX+"px";

        // Sprite
        this.row = spriteRow;
        this.col = spriteCol;
        this.currentCol = 1;

        this.spriteImage = new Image();
        this.spriteImage.src = spriteUrl;
        this.spriteImage.onload = () =>{
            this.ctxCanvas.drawImage(this.spriteImage,0,0,this.spriteImage.width,this.spriteImage.height,0,0,this.canvas.width*this.col,this.canvas.height*this.row);        
        }

        // Motion click event on grid
        
        this.currentCell = myGrid.grid[0][5];
        this.inMotion = false;
        this.newMotion = false;
        this.lastClick = null;
        this.newClick = null;

        document.addEventListener("click", async function(event){

            this.newClick = getTimeMilli(); // To avoid spam clicking
            if ( (this.newClick - this.lastClick)<1000 ) { return;}  
            this.lastClick = this.newClick;
        
            let xClick = event.clientX;
            let yClick = event.clientY;
            if ( this.inMotion == false){ // no motion in progress
                self.movementPlayerOnClick(xClick,yClick).then(() => this.inMotion = false); 
            } 
            else{ // motion in progress, stop the motion in progress, wait 1s and start the new motion
                this.newMotion = true;
                setTimeout(()=>{
                    self.movementPlayerOnClick(xClick,yClick).then(() => this.inMotion = false);
                }, 1000);
            }  
        });
    }  

    // when a click is detected on the windows, bring the player to the position of the click 
    async movementPlayerOnClick(xClick,yClick){

        this.inMotion = true; 
        this.newMotion = false;

        let aimCell = this.closestCell(xClick,yClick,this.myGrid); // get the aimed cell 
        if ( aimCell.state == "unclickable"){
            return;
        }

        Dijkstra_init(this.myGrid,this.currentCell); // Path finding algorithm
        let listOfCells = Dijkstra(this.myGrid,this.currentCell,aimCell); // return the path as a list of cell to go to
        
        let lastCell = false;
        for ( let i=0; i<listOfCells.length; i++){
            i == listOfCells.length-1 ? lastCell = true : lastCell = false;
            let nextCell = listOfCells[i];
            let DistX = nextCell.coordX - this.currentCell.coordX;
            let DistY = nextCell.coordY - this.currentCell.coordY;
            let quadrant = [ Math.sign(DistX), Math.sign(DistY)];// sign of x and y distance to make to go to the next cell
            
            for (let i =0 ; i < animPerCell; i++){
                let promise = new Promise((resolve,reject)=>{
                    setTimeout(()=>{
                        this.animate(quadrant,lastCell,i);  
                        resolve();  
                    },FPS) 
                })
                await promise;
                    
            }
            
            this.currentCell = nextCell;
            if (this.newMotion == true){ break;} // new motion detected, stop on this cell
            
        }
        return ;
    }

    async animate(quadrant,last,i){

        this.ctxCanvas.clearRect(0,0,this.canvas.width,this.canvas.height);
        let currentRow = this.quadrantToRow(quadrant); // get the row of the sprite according to the quadrant
        if ( (last == true) && (i == animPerCell-1)){ // last image, first columns of the sprite
            this.ctxCanvas.drawImage(this.spriteImage,0,0,this.spriteImage.width,this.spriteImage.height,0,-this.canvas.height*currentRow,this.canvas.width*this.col,this.canvas.height*this.row);
        }
        else{ // display the new image
            this.ctxCanvas.drawImage(this.spriteImage,0,0,this.spriteImage.width,this.spriteImage.height,-this.canvas.width * this.currentCol,-this.canvas.height*currentRow,this.canvas.width*this.col,this.canvas.height*this.row);
        }
             
        if (quadrant[1] == 0){ // horizontal mouvement
            this.canvas.style.left = this.posX + quadrant[0]*2*forwardStepX + 'px'; 
            this.posX += quadrant[0]*2*forwardStepX
        }
        else if (quadrant[0] == 0){ // vertical mouvement
            this.canvas.style.top = this.posY + quadrant[1]*forwardStepY + 'px';
            this.posY += quadrant[1]*2*forwardStepY;    
        }
        else{ // diag mouvement
            this.canvas.style.left = this.posX + quadrant[0]*forwardStepX + 'px'; 
            this.canvas.style.top = this.posY + quadrant[1]*forwardStepY + 'px';
            this.posX += quadrant[0]*forwardStepX;
            this.posY += quadrant[1]*forwardStepY;
        }
      
        this.posX=Math.round(this.posX*10)/10;
        this.posY=Math.round(this.posY*10)/10;
        this.currentCol++;
        if ( this.currentCol >= this.col){
            this.currentCol = 1;
        }   
               
    } 

    // return the row of the sprite corresponding to the direction of the next cell
    quadrantToRow(quadrant){
        let currentRow = null;
        let quadrantCol = [[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0]];
        for ( let i=0; i<quadrantCol.length;i++){
            (quadrant[0] == quadrantCol[i][0]) && (quadrant[1] == quadrantCol[i][1]) ? currentRow = i : null ;
        }
        return currentRow;
    }
    

    /* find the cell closest to the click in the grid */
    closestCell(xClick,yClick,myGrid){
        let theCell = null;
        let distCellX = null;
        let distCellY = null;
        for (let i = 0; i < myGrid.row; i++){
            for ( let j = 0; j< myGrid.col; j++){
                distCellX = Math.abs(xClick - myGrid.grid[i][j].coordX);
                distCellY = Math.abs(yClick - myGrid.grid[i][j].coordY);
                if ( distCellY < -(cellHeight/cellWidth)*distCellX + cellHeight ){ // cells are lozenges, check if y < -ax +b 
                    theCell = myGrid.grid[i][j];
                }
            }
        }
    return theCell;
    }
}






