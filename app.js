import { vh,vw,cellWidth,cellHeight,eltGrid,gridRow,gridCol,startCellX,startCellY,startCellI,startCellJ,obstaclePos} from './modules/const.js';
import { Grid } from './modules/grids.js';
import { Player } from './modules/player.js'

window.addEventListener ('resize', ()=> location.reload());


let myGrid = new Grid(eltGrid,gridRow,gridCol,startCellX,startCellY,obstaclePos);

let player = new Player(myGrid,startCellI,startCellJ);
player.clickEventOn();














