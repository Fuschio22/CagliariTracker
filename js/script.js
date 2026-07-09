const minute=document.getElementById("minute");
const score=document.getElementById("score");
const event=document.getElementById("event");

const timeline=[

{
minute:"22'",
score:"0 - 0",
event:"Partita equilibrata"
},

{
minute:"34'",
score:"1 - 0",
event:"⚽ Mbappé porta avanti la Francia"
},

{
minute:"45+2'",
score:"1 - 0",
event:"⏸ Intervallo"
},

{
minute:"62'",
score:"1 - 0",
event:"🟨 Cartellino per Hakimi"
},

{
minute:"74'",
score:"2 - 0",
event:"⚽ Dembélé raddoppia"
},

{
minute:"90+4'",
score:"2 - 1",
event:"🏁 Fine partita"
}

];

let i=0;

setInterval(()=>{

if(i>=timeline.length)return;

minute.textContent=timeline[i].minute;
score.textContent=timeline[i].score;
event.textContent=timeline[i].event;

i++;

},5000);
