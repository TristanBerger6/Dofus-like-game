import { vw,vh,cellWidth,cellHeight } from './const.js';

class Cell{
    constructor(coordX,coordY,i,j){
        this.i = i;
        this.j = j;
        this.coordX = coordX;
        this.coordY = coordY;
        this.state = null;
        this.eltCell = null;

        // path finding algorithm
        this.distance = null;
        this.toExplore = null;

    }
}

export class Grid{
    constructor(eltGrid,row,col,startCellX,startCellY,obstaclePos,fill){
        this.row = row;
        this.col = col;
        this.cellWidth = cellWidth;
        this.cellHeight = cellHeight;
        this.startCellX = startCellX;
        this.startCellY = startCellY;
        this.obstaclePos = obstaclePos;
        this.fill = fill;
        
        this.grid = null;
        this.eltGrid = eltGrid;

        this.init();
        this.display();
    }
    init(){
        this.grid = new Array(this.row);
        for ( let i= 0; i < this.row;i++ ){
            this.grid[i] = new Array(this.col);
            for ( let j = 0; j< this.col; j++){
                this.grid[i][j]= new Cell( this.startCellX +j*this.cellWidth+i*this.cellWidth, this.startCellY -j*this.cellHeight + i*this.cellHeight,i,j);
            }
        }   
    }
    display(){ // create and add cell elements to html, and display them
        for ( let i = 0; i< this.row; i++){
            for ( let j = 0; j< this.col; j++){
                this.grid[i][j].eltCell = document.createElementNS("http://www.w3.org/2000/svg","path");
                this.eltGrid.appendChild(this.grid[i][j].eltCell);
                this.grid[i][j].eltCell.setAttribute("d",`M ${this.grid[i][j].coordX-this.cellWidth},${this.grid[i][j].coordY}
                                        L ${this.grid[i][j].coordX},${this.grid[i][j].coordY- this.cellHeight}
                                        L ${this.grid[i][j].coordX+this.cellWidth},${this.grid[i][j].coordY} 
                                        L ${this.grid[i][j].coordX},${this.grid[i][j].coordY+ this.cellHeight}
                                        L ${this.grid[i][j].coordX-this.cellWidth},${this.grid[i][j].coordY}`);
                this.grid[i][j].eltCell.setAttribute("fill",this.fill);
                this.grid[i][j].eltCell.setAttribute("stroke","rgb(147,152,122)");
                this.grid[i][j].state ="clickable"; // by default, all cells are clickable.
            }
        }
        for ( let pos of this.obstaclePos){ // non clickable cells are not displayed
            this.grid[pos[0]][pos[1]].state="unclickable";
            this.grid[pos[0]][pos[1]].eltCell.setAttribute("stroke","none");
            this.grid[pos[0]][pos[1]].eltCell.setAttribute("fill","none");

        }
    }
    clearCell(){
        for ( let i = 0; i< this.row; i++){
            for ( let j = 0; j< this.col; j++){
                this.grid[i][j].eltCell.setAttribute("fill",this.fill);
                this.grid[i][j].eltCell.setAttribute("stroke","rgb(147,152,122)");
                this.grid[i][j].state ="clickable"; // by default, all cells are clickable.
            }
        }
        for ( let pos of this.obstaclePos){ // non clickable cells are not displayed
            this.grid[pos[0]][pos[1]].state="unclickable";
            this.grid[pos[0]][pos[1]].eltCell.setAttribute("stroke","none");
            this.grid[pos[0]][pos[1]].eltCell.setAttribute("fill","none");

        }
    }  
}               