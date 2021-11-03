import { vw,vh,cellWidth,cellHeight } from "./const.js";

class Mob{ // 1 mob = 1 minogolem
    constructor(color,pos,posCoord){
        this.elt = document.getElementsByClassName(`mob--${color}`);
        this.color = color;
        this.pos = pos;
        this.posCoord = posCoord;
        this.elt[0].style.top = this.posCoord[0];
        this.elt[0].style.left = this.posCoord[1];
        this.elt[0].style.background = `url('./public/img/minogolem_${this.color}.png')`;
        this.elt[0].style.backgroundSize = "100% 100%";
    }
}

export class Mobs{

    constructor(player,grid){ 

        this.myGrid = grid;  
        this.player = player; // player attached to the mobs
        this.pos = {  // pos ofthe minogolems
            top : ['18%','21%'],
            left : ['70%','18%'],
            right : ['19%','67%'],
            bot : ['71%','72%']
        }

        this.mobList = [ new Mob('grey','top',this.pos.top), new Mob('blue','left',this.pos.left), new Mob('green','right',this.pos.right), new Mob('red','bot',this.pos.bot)]

        this.listEltRocks = [];
        this.nextRound = []; // contain the next rounds color of the minogolem
        this.init();

    }
    switch(mob1,mob2){ // switch 2 mobs place
        let topMob1 = mob1.elt[0].style.top;
        let leftMob1 = mob1.elt[0].style.left;
        let topMob2 = mob2.elt[0].style.top;
        let leftMob2 = mob2.elt[0].style.left;
        let posMob1 = mob1.pos;
        let posMob2 = mob2.pos;
        mob1.elt[0].style.top = `${topMob2}`;
        mob1.elt[0].style.left = `${leftMob2}`;
        mob1.pos = posMob2;
        mob2.elt[0].style.top = `${topMob1}`;
        mob2.elt[0].style.left =`${leftMob1}`;
        mob2.pos = posMob1;
    }

    init(){ 
        this.nextRound = []
        for ( let i=0; i<5; i++){  // random color for the 5 next rounds
            let random = Math.floor(Math.random()*3) ;
            this.nextRound.push( this.randomToColor(random)); 
        }
        this.mobList[0].elt[0].innerHTML ="<p> minogolem </p>";
        for ( let i=1; i<4; i++){
            this.mobList[i].elt[0].innerHTML ="<p>"+ this.mobList[i].color +" minogolem </p>";
        }
        
    }
    randomToColor(num){
        let C = ["blue","green","red"];
        return C[num]
    }
    ColorToIndex(color){ // color to this.mobList index
        let res;
        color == "grey" ? res = 0 : null;
        color == "blue" ? res = 1 : null;
        color == "green" ? res = 2 : null;
        color == "red" ? res = 3 : null;
        return res;
    }
    play(color){
        let currentIndex = this.ColorToIndex(color);
        if ( this.mobList[0].color != color ){ // no switch, the grey mob stays at the same position
            this.switch(this.mobList[currentIndex], this.mobList[0])
        }
        let pos;
        switch (this.mobList[0].pos){ 
            case "top":
                pos = [-1,0];
            break;
            case "bot":
                pos = [1,0];
            break;
            case "left":
                pos = [0,-1];
            break;
            case "right":
                pos = [0,1];
            break;
        }
        
        let propI = this.player.currentCell.i+pos[0];
        let propJ = this.player.currentCell.j+pos[1];
        
        // put a rock on the proposed cell if possible to block the path of the player
        if ( propI >=0  &&  propJ >= 0 && propI <=this.player.myGrid.row-1  && propJ <= this.player.myGrid.col-1){
            if(this.player.myGrid.grid[propI][propJ].state == "clickable"){

                this.player.myGrid.grid[propI][propJ].state = "unclickable";
                let newRock = document.createElement('div');
                newRock.setAttribute('class','rock');
                newRock.style.top = `${this.player.myGrid.grid[propI][propJ].coordY -2*vh/100}px` ;
                newRock.style.left = `${this.player.myGrid.grid[propI][propJ].coordX -1.25*vw/100}px`;
                document.getElementById('game-page').prepend(newRock);
                this.listEltRocks.push(newRock);
                this.player.myGrid.grid[propI][propJ].state="unclickable";
                this.player.myGrid.grid[propI][propJ].eltCell.setAttribute("stroke","rgb(147,152,122)");
                this.player.myGrid.grid[propI][propJ].eltCell.setAttribute("fill",this.player.myGrid.fill);
      
            }
        } 
    }
    removeRocks(eltGame){
        for( let e of this.listEltRocks ){
            eltGame.removeChild(e);
        }
        this.listEltRocks = [];
    }
}
