// Dijkstra is a pathfinding algorithm // 

let pathFound;
let predecessor;

export function Dijkstra_init(myGrid,currentCell) {
	let i,j;
	pathFound=false;
	for (i=0;i<myGrid.row;i++) {
		for (j=0;j<myGrid.col;j++) {
			myGrid.grid[i][j].distance=99999; // every cell has an infinite distance, and is to explore
			myGrid.grid[i][j].toExplore=true;
		}
	}
	myGrid.grid[currentCell.i][currentCell.j].distance=0; // except the starting cell which as 0 as a distance
	predecessor=new Array(myGrid.row); // reset predecessor array, containing the previous cell of each cell, the key to get the final path
    for (let i =0; i< myGrid.row;i++){
        predecessor[i] = new Array(myGrid.col);
    }
}

export function Dijkstra(myGrid,currentCell,aimCell) {
	let min;
    let curI,curJ,ti,tj;
    curI = aimCell.i ; curJ = aimCell.j;

    while (!(predecessor[curI][curJ])){ // while the aimed cell is not reached
        if (!Dijkstra_explored_all(myGrid) && !pathFound) { // cell to explore and path not found yet
            min=Dijkstra_find_min(myGrid);
            if (min.i!=-1) { // cell with min distance found on the grid
                myGrid.grid[min.i][min.j].toExplore=false; // this cell has been explored
                for (let i=-1;i<=1;i++) { // update distances around this cell
                    for (let j=-1;j<=1;j++) {
                        if (!(i==0 && j==0)) { // make sure that the dimensions of the grid are not exceeded
                            min.i == 0 && i >=0 && min.j != myGrid.col-1 && min.j != 0 ?  Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) :null;
                            min.j == 0 && j >=0 && min.i != myGrid.row-1 && min.i != 0 ?  Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) :null;
                            min.i == myGrid.row-1 && i <=0 && min.j != myGrid.col-1 && min.j != 0 ?  Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;
                            min.j == myGrid.col-1 && j <=0 && min.i != myGrid.row-1 && min.i != 0 ?  Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;
                            min.i>0 && min.j>0 && min.i<myGrid.row-1 && min.j<myGrid.col-1 ?  Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;

							// 4 corners 
							min.i == 0 && min.j ==0 && i>= 0 && j >= 0 ? Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;
							min.i == 0 && min.j ==myGrid.col-1 && i>= 0 && j <= 0 ? Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;
							min.i == myGrid.row-1 && min.j == myGrid.col-1 && i<= 0 && j <= 0 ? Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;
							min.i == myGrid.row-1 && min.j ==0 && i<= 0 && j >= 0 ? Dijkstra_maj_distances(myGrid,min.i,min.j,min.i+i,min.j+j) : null;

                           
                        }
                    }
                }
            }
        }
    }

	// Aimed cell found, recreate the path
   
    let listOfCells=[]
	if (predecessor[curI][curJ]) {
		pathFound=true;
		while (!(curI==currentCell.i && curJ==currentCell.j)) {
			if (!(curI==currentCell.i && curJ==currentCell.j)) {
                listOfCells.unshift(myGrid.grid[curI][curJ]);
            }
			ti=predecessor[curI][curJ].i;
			tj=predecessor[curI][curJ].j;
			curI=ti;curJ=tj;
		}
	}
    return listOfCells;
}

function Dijkstra_find_min(myGrid) { // explore the grid to find the min distance
	let mini=99999;
	let sommeti, sommetj;
	sommeti=-1;
	sommetj=-1;
	for (let i=0;i<myGrid.row;i++) {
		for (let j=0;j<myGrid.col;j++) {
			if (myGrid.grid[i][j].toExplore && myGrid.grid[i][j].state=="clickable") {
				if (myGrid.grid[i][j].distance<mini) {
					mini=myGrid.grid[i][j].distance;
					sommeti=i;sommetj=j;
				}
			}
		}
	}
	return {
	  i: sommeti,
	  j: sommetj
	}
}

function Dijkstra_maj_distances(myGrid,i1,j1,i2,j2) {
	if (myGrid.grid[i2][j2].distance > myGrid.grid[i1][j1].distance + Dijkstra_weights(myGrid,i1,j1,i2,j2)) {
		myGrid.grid[i2][j2].distance=myGrid.grid[i1][j1].distance + Dijkstra_weights(myGrid,i1,j1,i2,j2);
		predecessor[i2][j2]={i:i1,j:j1}; // new zone explored, note where is the cell we're coming from
	}
}

function Dijkstra_weights(myGrid,i1,j1,i2,j2) {
	// return a weight between 2 points
	if (myGrid.grid[i2][j2].state == "unclickable") {
		// impossible to pass
		return 99999;
	} else {
		if (i1==i2 || j1==j2) {
			// adj cell prioritized
			return 1;
		} else {
			// diag cell
			return 1.5;
		}
	}
}

function Dijkstra_explored_all(myGrid) { // check if all cells are explored
	let i,j;
	let exploredAll=true; 
	for (i=myGrid.row-1;i>=0;i--) {
		for (j=myGrid.col-1;j>=0;j--) {
			if (myGrid.grid[i][j].toExplore) {exploredAll=false;i=-1;j=-1;}
		}
	}
	return exploredAll;
}