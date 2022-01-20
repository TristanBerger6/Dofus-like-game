// ------------ AUDIO ELT -----------------------------//
let eltAudioMainTheme = document.getElementById('main-theme');
let eltAudioFightTheme = document.getElementById('fight-theme');
let eltAudioSwitch= document.getElementById('switch-song');

// ------------------ MUTE ICON --------------------------//
let eltMuteIcon = document.getElementById("mute-songs");
let ctxMute = eltMuteIcon.getContext('2d');
let muted = false;



export function audioInit(){
    let muteImg = new Image();
    muteImg.src = "./public/img/mute4.webp";
    muteImg.onload = () =>{
    ctxMute.drawImage(muteImg,0,0,muteImg.width,muteImg.height,0,0,eltMuteIcon.width*2,eltMuteIcon.height);        
    }

    eltMuteIcon.addEventListener("click",()=>{
        if(muted == false){
            ctxMute.drawImage(muteImg,0,0,muteImg.width,muteImg.height,-eltMuteIcon.width,0,eltMuteIcon.width*2,eltMuteIcon.height);
            muted = true;
            eltAudioMainTheme.muted = true;
            eltAudioFightTheme.muted = true;
            eltAudioSwitch.muted = true;
        }
        else if(muted == true){
            ctxMute.drawImage(muteImg,0,0,muteImg.width,muteImg.height,0,0,eltMuteIcon.width*2,eltMuteIcon.height);
            muted = false;
            eltAudioMainTheme.muted = false;
            eltAudioFightTheme.muted = false;
            eltAudioSwitch.muted = false;
        }
        
    });

    // Audio are on pause, and ready to be played
    eltAudioMainTheme.pause();
    eltAudioFightTheme.pause();
    eltAudioSwitch.pause();
    eltAudioMainTheme.currentTime = 0;
    eltAudioFightTheme.currentTime = 0;
    eltAudioSwitch.currentTime = 0;
    eltAudioMainTheme.muted = false;
    eltAudioFightTheme.muted = false;
    eltAudioSwitch.muted = false;
}

export function audioMainTheme() 
{
    eltAudioMainTheme.currentTime = 0;
    eltAudioMainTheme.play();
    eltAudioFightTheme.pause();
}
export function audioFightTheme()
{
    eltAudioFightTheme.currentTime = 0;
    eltAudioMainTheme.pause();
    eltAudioFightTheme.play();  
}
export function audioSwitch()
{
    eltAudioSwitch.currentTime = 0;
    eltAudioSwitch.play();
}
