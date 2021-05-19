let socket = io(window.location.href.substring(0,window.location.href.length-7));

var canvas = document.getElementById('theCanvas');
var ctx = canvas.getContext('2d');
canvas.height = 750;
canvas.width = 750;

// var greenPiece = new Image(); greenPiece.src = "../images/pieces/green.png"
// var bluePiece = new Image(); bluePiece.src = "../images/pieces/blue.png"
// var redPiece = new Image(); redPiece.src = "../images/pieces/red.png"
// var yellowPiece = new Image(); yellowPiece.src = "../images/pieces/yellow.png"

// greenPiece.onload = ()=>{
//     ctx.drawImage(greenPiece, 72, 123.5);
//     ctx.drawImage(greenPiece, 122, 173.5);
//     ctx.drawImage(greenPiece, 122, 73.5);
//     ctx.drawImage(greenPiece, 172, 123.5);
// }

//context.clearRect(0, 0, canvas.width, canvas.height);
const room_code = window.location.href.substring(window.location.href.length-6);
const USERNAMES = ['Green Warrior', 'Yellow Rhino', 'Blue Fox', 'Red Fire'];
const MYROOM = [];
const PIECES = [];
const PLAYERS = [];
const colors = ["green","yellow","blue","red"];
let myid = -1;

let allPiecesePos = {
    0:[{x: 72,y:123.5},{x:122,y: 73.5},{x:172,y:123.5},{x:122,y:173.5}],
    1:[{x: 72,y:573.5},{x:122,y:523.5},{x:172,y:573.5},{x:122,y:623.5}],
    2:[{x:522,y:573.5},{x:572,y:523.5},{x:622,y:573.5},{x:572,y:623.5}],
    3:[{x:522,y:123.5},{x:572,y: 73.5},{x:622,y:123.5},{x:572,y:173.5}]
}

class Player{
    constructor(id){
        this.id = id;
        this.myPieces = new Array();
        for(let i=0;i<4;i++){
            this.myPieces.push(new Piece(i,this.id))
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
        this.parrentid = id
        this.x = allPiecesePos[this.parrentid][i].x
        this.y = allPiecesePos[this.parrentid][i].y
        this.image = PIECES[id]
    }

    draw(){
        ctx.drawImage(this.image, this.x, this.y);
    }
}

socket.on('connect',function(){
    console.log('You are connected to the server!!');
    // socket.emit('testestest',room_code,function(){console.log('test is ok on client!');});
    socket.on('refresh',()=>{location.reload()});
    socket.emit('fetch',room_code,function(data,id){
        console.log('hihello');
        for(let i=0;i<data.length;i++){
            MYROOM.push(data[i]);
        }
        myid = id;
        StartTheGame();
    });
    //socket.on('H',(data,cb)=>{console.log(data);cb()})
//To simulate dice
    //diceAction();
    

    socket.on('new-user-joined',function(data){
        MYROOM.push(data.id);
        loadNewPiece(data.id);
        outputMessage(USERNAMES[data.id],0);
    });

//When someone joins the game
    socket.on('messageFromAdmin',function(data){
        outputMessage(data,0);
    })

//When some other user throws the dice
    socket.on("otherUsersData",function(data){
        outputMessage(data,1)
        styleButton(1);
    })
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

function diceAction(){
    styleButton(1);
    document.querySelector('#randomButt').addEventListener('click', function(event){
        event.preventDefault();
        console.log('clicked Random Button');
        let myTurn = {
            room: room_code,
            Name: USERNAMES[myid],                      //need to 
            Num: Math.floor((Math.random() * 6) + 1)    //make changes here!!
        }
        socket.emit('random',myTurn, function(){
            outputMessage({Name: 'you', Num:myTurn.Num},1);
            styleButton(0);
        });
    });
}

function StartTheGame(){
    MYROOM.forEach(function(numb){
        numb==myid?outputMessage('You',0):outputMessage(USERNAMES[numb],0)
    });
    document.getElementById('my-name').innerHTML += USERNAMES[myid]
    if(MYROOM.length === 1){
        styleButton(1);
    }else{
        styleButton(0);
    }
    loadAllPieces();
}

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
                    PLAYERS.push(new Player(MYROOM[j]));
                }
                allPlayerHandler();
            }
        }
        PIECES.push(img);
    }
}

function chanceRotation(id){
    if(id+1 >= 4){
        return 0;
    }else{
        return id+1
    }
}

function allPlayerHandler(){
    for(let i=0;i<PLAYERS.length;i++){
        PLAYERS[i].draw();
    }
}

function loadNewPiece(id){
    //Yeah load some new pieces bruuh!!
    let img = new Image();
    img.src = "../images/pieces/"+colors[id]+".png";
    img.onload = ()=>{
        PLAYERS.push(new Player(id));
        allPlayerHandler();
    }
}
