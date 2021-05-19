let socket = io(window.location.href.substring(0,window.location.href.length-7));

var canvas = document.getElementById('theCanvas');
var ctx = canvas.getContext('2d');

canvas.height = 750;
canvas.width = 750;

var greenPiece = new Image(); greenPiece.src = "../images/pieces/green.png"
var bluePiece = new Image(); bluePiece.src = "../images/pieces/blue.png"
var redPiece = new Image(); redPiece.src = "../images/pieces/red.png"
var yellowPiece = new Image(); yellowPiece.src = "../images/pieces/yellow.png"

greenPiece.onload = ()=>{
    ctx.drawImage(greenPiece, 72, 123.5);
    ctx.drawImage(greenPiece, 122, 173.5);
    ctx.drawImage(greenPiece, 122, 73.5);
    ctx.drawImage(greenPiece, 172, 123.5);
}

//context.clearRect(0, 0, canvas.width, canvas.height);
let room_code = window.location.href.substring(window.location.href.length-6);
let MYROOM = [];
let myid = -1;
let USERNAMES = ['Green Warrior', 'Yellow Rhino', 'Blue Fox', 'Red Fire'];

socket.on('connect',function(){
    console.log('You are connected to the server!!');
    // socket.emit('testestest',room_code,function(){console.log('test is ok on client!');});
    socket.on('refresh',()=>{location.reload()});
    socket.emit('fetch',room_code,function(data,id){
        console.log('hihello');
        MYROOM = data;
        myid = id;
        iStartedTheGame();
        MYROOM.forEach(function(numb){numb==myid?outputMessage('You',0):outputMessage(USERNAMES[numb],0)});
        document.getElementById('my-name').innerHTML += USERNAMES[myid]
        styleButton(0);
    });
    //socket.on('H',(data,cb)=>{console.log(data);cb()})
//To simulate dice
    diceAction();
    

    socket.on('new-user-joined',function(data){
        MYROOM.push(data.id);
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
            Name: USERNAMES[myid],
            Num: Math.floor((Math.random() * 6) + 1)
        }
        socket.emit('random',myTurn, function(){
            outputMessage({Name: 'you', Num:myTurn.Num},1);
            styleButton(0);
        });
    });
}

function iStartedTheGame(){
    if(MYROOM.length===1){
        document.getElementById('i-started-the-game').style.display = "block"
    }
}
