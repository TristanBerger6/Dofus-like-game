import { vw,vh,cellWidth,cellHeight,PVStart} from "./const.js";
import { getTimeMilli } from "./utils.js";
import { Dijkstra_init, Dijkstra } from './dijkstra.js'

// ----------------- Animation -------------------------------// 
let animPerCell = 10;
let forwardStepX = cellWidth/animPerCell;   // px 
let forwardStepY = cellHeight/animPerCell;   //px
let animDelay = 40 // ms


// -------------- Canvas Player creation -----------------//

let playerMoveOrigin = [Math.round(35*vw/1920),Math.round(85*vh/980)];   // x,y coords of the foot in the canvas
export let playerCanvas = document.getElementById("player");
playerCanvas.width = Math.round(69*vw/1920);  // canvas dimensions
playerCanvas.height = Math.round(100*vh/980);


// ------------------ Sprite --------------------------------//
let spriteRow = 8;
let spriteCol = 11;
let spriteUrl = "./public/img/sprite_global.webp";


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

        // Game mode
        this.proposedCell = [];
        this.PV = PVStart;

    }  

    // adjust the orientation of the player on mouse mouve
    playerOrientation(event){
        let xMousePos = event.clientX + window.scrollX;
        let yMousePos = event.clientY + window.scrollY;
        let deltaX = xMousePos - self.currentCell.coordX;
        let deltaY = yMousePos - self.currentCell.coordY;
    
        let quadrant = [ Math.sign(deltaX), Math.sign(deltaY)]; // distance's sign between mouse and player's cell

        // when the user is aiming an horizontal or verical cell
        if ( ( quadrant[0]*deltaX <= cellWidth/2 ) && ( quadrant[1]*deltaY > cellHeight/2 ) ){
            quadrant[0] = 0;
        }
        if ( ( quadrant[1]*deltaY <= cellHeight/2 ) && ( quadrant[0]*deltaX > cellWidth/2 ) ){
            quadrant[1] = 0;
        }

        if ( self.inMotion == false && self.newMotion == false) {
            self.ctxCanvas.clearRect(0,0,self.canvas.width,self.canvas.height);
            let currentRow = self.quadrantToRow(quadrant); // get the row of the sprite according to the quadrant
            self.ctxCanvas.drawImage(self.spriteImage,0,0,self.spriteImage.width,self.spriteImage.height,0,-self.canvas.height*currentRow,self.canvas.width*self.col,self.canvas.height*self.row);
        } 
    }

    // The player goes to the aimed cell on click
    async gridEvent(event){
        this.newClick = getTimeMilli(); // To avoid spam clicking
        if ( (this.newClick - this.lastClick)<1000) { return;}  
        this.lastClick = this.newClick;
    
        let xClick = event.clientX + window.scrollX;
        let yClick = event.clientY + window.scrollY;

        let aimCell = self.closestCell(xClick,yClick,self.myGrid); // get the aimed cell 
        if ( aimCell == null || aimCell.state == "unclickable" ){
            return;
        }

  
        if ( self.inMotion == false){ // no motion in progress
            self.movementPlayerOnClick(xClick,yClick).then(() => self.inMotion = false); 
        } 
        else{ // motion in progress, stop the motion in progress, wait 1s and start the new motion
            self.newMotion = true;
            setTimeout(()=>{
                self.movementPlayerOnClick(xClick,yClick).then(() => self.inMotion = false);
            }, 1000);
        }  
    
    }
    

    // bring the player to the position of the click 
    async movementPlayerOnClick(xClick,yClick){

        this.inMotion = true; 
        this.newMotion = false;

        let aimCell = this.closestCell(xClick,yClick,this.myGrid); // get the aimed cell 
        

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
                    },animDelay) 
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
        if ( (last == true) && (i == animPerCell-1)){ // if last image, set the first columns of the sprite
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

    testInCell(xClick,yClick,cell,myGrid){ // test if the click is in the specific cell
        let distCellX = null;
        let distCellY = null;
        distCellX = Math.abs(xClick - myGrid.grid[cell.i][cell.j].coordX);
        distCellY = Math.abs(yClick - myGrid.grid[cell.i][cell.j].coordY);
        if ( distCellY <= -(cellHeight/cellWidth)*distCellX + cellHeight ){ // cells are lozenges, check if y < -ax +b 
            return true;
        }
        else{
            return false;
        }
    }

    teleportTo(i,j){
        if ( (i <= this.myGrid.row-1) && (i>=0) && (j <= this.myGrid.col-1) && (j>=0)){
            this.posX = this.myGrid.grid[i][j].coordX-playerMoveOrigin[0] ;
            this.posY = this.myGrid.grid[i][j].coordY-playerMoveOrigin[1] ;
            this.canvas.style.top = this.posY+"px";
            this.canvas.style.left = this.posX+"px";
            this.currentCell = this.myGrid.grid[i][j];
        }
    }

    proposeCell(){ // propose available cells around the player
        let proposedCell = [];
        let coeff = [[1,0],[0,1],[-1,0],[0,-1]]; // right bot left top
        for ( let c of coeff ){
            let propI = this.currentCell.i+c[0];
            let propJ = this.currentCell.j+c[1];
            if ( propI >=0  &&  propJ >= 0 && propI <=this.myGrid.row-1  && propJ <= this.myGrid.col-1 ){
                if(this.myGrid.grid[propI][propJ].state == "clickable"){
                    proposedCell.push(this.myGrid.grid[propI][propJ]);
                    this.myGrid.grid[propI][propJ].eltCell.setAttribute("fill","green");
                    this.myGrid.grid[propI][propJ].eltCell.style.cursor = 'pointer';
                    this.myGrid.grid[propI][propJ].eltCell.addEventListener("mouseover",this.cellMouseOver);
                    
                }
            } 
        }
        this.proposedCell = proposedCell;
    }

    defaultCell(){ // erase the modification made on the proposed cells
        for ( let cell of this.proposedCell ){
            this.myGrid.grid[cell.i][cell.j].eltCell.setAttribute("fill",this.myGrid.fill);
            this.myGrid.grid[cell.i][cell.j].eltCell.setAttribute("stroke","rgb(147,152,122)");
            this.myGrid.grid[cell.i][cell.j].eltCell.style.cursor = 'default';
            this.myGrid.grid[cell.i][cell.j].eltCell.removeEventListener("mouseover",this.cellMouseOver);
            this.myGrid.grid[cell.i][cell.j].eltCell.removeEventListener("mouseout",this.cellMouseOut);
        }   
        this.proposedCell = [];  
    }
  
    cellMouseOver(event){
        event.target.setAttribute("fill","rgb(110, 204, 110)");
        event.target.addEventListener("mouseout",self.cellMouseOut);
    }
    cellMouseOut(event){
        event.currentTarget.setAttribute("fill","green");
    }
    
}






