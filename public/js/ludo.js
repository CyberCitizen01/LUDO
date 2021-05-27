let socket = io(window.location.href.substring(0,window.location.href.length-7));

const room_code = window.location.href.substring(window.location.href.length-6);
const USERNAMES = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const PIECES = [];
const PLAYERS = {};
const colors = ["green","red","blue","yellow"];
let MYROOM = [];
let myid = -1;
let chance = -1;
// let status = 0;
// let sum = 0;

var canvas = document.getElementById('theCanvas');
var ctx = canvas.getContext('2d');
canvas.height = 750;
canvas.width = 750;

let allPiecesePos = {
    0:[{x: 72,y:123.5},{x:122,y: 73.5},{x:172,y:123.5},{x:122,y:173.5}],
    1:[{x:522,y:123.5},{x:572,y: 73.5},{x:622,y:123.5},{x:572,y:173.5}],
    2:[{x:522,y:573.5},{x:572,y:523.5},{x:622,y:573.5},{x:572,y:623.5}],
    3:[{x: 72,y:573.5},{x:122,y:523.5},{x:172,y:573.5},{x:122,y:623.5}]
}

let homeTilePos = {
    0:{x: 50,y:300},
    1:{x:400,y: 50},
    2:{x:650,y:400},
    3:{x:300,y:650}
}

class Player{
    constructor(id){
        this.id = id;
        this.myPieces = new Object();
        for(let i=0;i<4;i++){
            this.myPieces[i] = new Piece(i,this.id);
        }        
    }
    draw(){
        for(let i=0;i<4;i++){
            this.myPieces[i].draw();
        }
    }
}

class Piece{
    constructor(i,id){
        this.color_id = id;
        this.Pid = i;
        this.status = 0;
        this.sum = 0;
        // this.slope = -2;
        this.x = allPiecesePos[this.color_id][this.Pid].x;
        this.y = allPiecesePos[this.color_id][this.Pid].y;
        this.image = PIECES[this.color_id];
    }

    draw(){
        ctx.drawImage(this.image, this.x, this.y, 50, 50);
        //this.slope = (allPiecesePos[this.color_id][this.Pid].y - this.y)/(allPiecesePos[this.color_id][this.Pid].x - this.x);
    }

    update(data){
        let xy = this.handleLogic(data)
        this.x = xy.x;
        this.y = xy.y;
    }

    handleLogic(data){
        let xy_ = {x:this.x,y:this.y};
        console.log(this.x,this.y,this.status,data.status);
        if(this.status === 0 && data.status === 1){
            this.status = data.status;
            this.sum = data.sum;
            return homeTilePos[this.color_id];
        }else if(this.status === 1 && data.status != 2){
            console.log('kamkarja',data.sum,this.sum,data.sum - this.sum);
            if(this.color_id == 0){xy_.x = this.x + (data.sum - this.sum)*50};
            if(this.color_id == 2){xy_.x = this.x - (data.sum - this.sum)*50};
            if(this.color_id == 1){xy_.y = this.y + (data.sum - this.sum)*50};
            if(this.color_id == 3){xy_.y = this.y - (data.sum - this.sum)*50};
            this.status = data.status;
            this.sum = data.sum;
            console.log(xy_,this.status,this.sum);
            return xy_;
        }
        return xy_
    }
}

socket.on('connect',function(){
    console.log('You are connected to the server!!');

    socket.emit('fetch',room_code,function(data,id){
        MYROOM = data;
        myid = id;
        StartTheGame();
    });

//To simulate dice
    if(chance === myid){    
        document.querySelector('#randomButt').addEventListener('click',(event)=>{
        event.preventDefault();
        console.log('chance is working');
        diceAction();
        });
    }
    
    socket.on('imposter',()=>{window.location.replace("/error-imposter");});

    socket.on('is-it-your-chance',function(data){
        if(data===myid){
            styleButton(1);
        }
        chance = data;
    });

    socket.on('new-user-joined',function(data){
        MYROOM.push(data.id);
        loadNewPiece(data.id);
        outputMessage(USERNAMES[data.id],0);
    });

    socket.on('Thrown-dice',async function(data){
        console.log(data);
        data.id != myid?outputMessage({Name:USERNAMES[data.id],Num:data.Num},1):outputMessage({Name: 'you', Num:data.Num},1);
        await PLAYERS[data.id].myPieces[data.statusSumPid.Pid].update({status:data.statusSumPid.status, sum:data.statusSumPid.sum});
        allPlayerHandler();
    });

    socket.emit('test','kya hal h bhidu',function(data){console.log(data);},function(data){console.log(data);})    
});


//To know if the client has disconnected with the server
socket.on('disconnect', function(){
    console.log('You are disconnected to the server');
})

//Output the message through DOM manipulation
function outputMessage(anObject,k){
    if(k===1 && !(anObject.Name.includes('<') || anObject.Name.includes('>') || anObject.Name.includes('/'))){    
        const div = document.createElement('div');
        div.classList.add('message')
        div.innerHTML = `<p><strong>&#9733;  ${anObject.Name}</strong> got a ${anObject.Num}</p>`;
        document.querySelector('.msgBoard').appendChild(div);
    }
    else if(k===0 && !(anObject.includes('<') || anObject.includes('>') || anObject.includes('/'))){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>&#8605;  ${anObject} entered the game</p>`;
        document.querySelector('.msgBoard').appendChild(div);
    }
};

//button disabling-enabling
function styleButton(k){
    let butt = document.getElementById("randomButt")
    if(k===0){
        butt.disabled = true;
        butt.style.opacity =  0.6;
        butt.style.cursor = "not-allowed"
        butt.style.backgroundImage = "linear-gradient(to bottom right, red, yellow)"
    }
    else if(k===1){
        butt.disabled = false;
        butt.style.opacity = 1;
        butt.style.cursor = "pointer";
        butt.style.backgroundImage = "linear-gradient(to bottom right, red, yellow)"
    }
}

//simulates the action of dice and also chance rotation.
function diceAction(){
    console.log('clicked Random Button');
    let myTurn = {
        room: room_code,
        id: myid,
        statusSumPid: statusChecker(myid)
    }
    socket.emit('random',myTurn, function(data){
        styleButton(0);
        console.log('random acknowledged');
        socket.emit('chance',{room: room_code, nxt_id: chanceRotation(myid,data)});
    });

}

//Initialise the game with the one who created the room.
function StartTheGame(){
    MYROOM.forEach(function(numb){
        numb==myid?outputMessage('You',0):outputMessage(USERNAMES[numb],0)
    });
    document.getElementById('my-name').innerHTML += USERNAMES[myid];console.log(myid);
    if(MYROOM.length === 1){
        styleButton(1);
        chance = myid;
    }else{
        styleButton(0);
    }
    loadAllPieces();
}

//Load all the images of the pieces
function loadAllPieces(){
    let cnt = 0;
    for(let i=0;i<colors.length;i++){
        let img = new Image();
        img.src = "../images/pieces/"+colors[i]+".png";
        img.onload = ()=>{
            ++cnt;
            if(cnt >= colors.length){
                //all images are loaded
                for(let j=0;j<MYROOM.length;j++){
                    PLAYERS[MYROOM[j]] = new Player(MYROOM[j]);
                }
                allPlayerHandler();
            }
        }
        PIECES.push(img);
    }
}

//rotate chance, required for the game
function chanceRotation(id,temp){
    if(temp != 6){
        if(id+1 >= 4){
            return 0;
        }else{
            return id+1;
        }
    }else{return id}

}

//This is the function that actually draws 4 x 4 = 16 pieces per call
function allPlayerHandler(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<Object.keys(PLAYERS).length;i++){
        PLAYERS[MYROOM[i]].draw();
    }
}

//It is not required, to just decrease the crowding in sockets' codeblock.
function loadNewPiece(id){
    PLAYERS[id] = new Player(id);
    allPlayerHandler();
}

//Plan is to make this as the root of the game Logic
// function gameLogicHandlerC(playerObj){
//     if(playerObj.statusSumPid.status === 1){
//         // PLAYERS[playerObj.id].myPieces[playerObj.statusSumPid.Pid].update(homeTilePos[id]);
//         allPlayerHandler();
//     }
// }

function statusChecker(id){
    for(let i = 0;i<4;i++){
        if(PLAYERS[id].myPieces[i].sum != 62){
            let k = {status:PLAYERS[id].myPieces[i].status, sum:PLAYERS[id].myPieces[i].sum, Pid:i};
            console.log('sending...',k);
            return k;
        }
    }
}
