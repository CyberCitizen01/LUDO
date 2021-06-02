let socket = io(window.location.href.substring(0,window.location.href.length-7));

const room_code = window.location.href.substring(window.location.href.length-6);
const USERNAMES = ['Green Warrior', 'Red Fire', 'Blue Fox', 'Yellow Rhino'];
const PIECES = [];
const colors = ["green","red","blue","yellow"];
let MYROOM = [];
let myid = -1;
let chance = -1;
var PLAYERS = {};

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
        this.id = String(id);
        this.myPieces = new Object();
        for(let i=0;i<4;i++){
            this.myPieces[i] = new Piece(String(i),String(id));
        }
        this.won = parseInt(0);        
    }
    draw(){
        for(let i=0;i<4;i++){
            this.myPieces[i].draw();
        }
    }

    didIwin(){
        if(this.won == 4){
            return 1;
        }else{return 0;}
    }
}

class Piece{
    constructor(i,id){
        this.path = [];
        this.color_id = String(id);
        console.log(this.color_id,typeof(this.color_id));
        this.Pid = String(i);
        this.pos = -1;
        this.x = parseInt(allPiecesePos[this.color_id][this.Pid].x);
        this.y = parseInt(allPiecesePos[this.color_id][this.Pid].y);
        this.image = PIECES[this.color_id];
        switch(id){
            case '0':
                console.log('switch is working');
                for(let i=0;i<4;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepToTop)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToRight)}
                break;
            case '1':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepToRight)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToBottom)}
                break;
            case '2':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepToBottom)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToLeft)}
                break;
            case '3':
                for(let i=0;i<4;i++){this.path.push(this.oneStepToTop)}
                this.path.push(this.oneStepTowards135)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                this.path.push(this.oneStepTowards45);
                for(let i=0;i<5;i++){this.path.push(this.oneStepToTop)}
                for(let i=0;i<2;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepTowards315)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToRight)}
                for(let i=0;i<2;i++)this.path.push(this.oneStepToBottom)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToLeft)}
                this.path.push(this.oneStepTowards225)
                for(let i=0;i<5;i++){this.path.push(this.oneStepToBottom)}
                this.path.push(this.oneStepToLeft)
                for(let i=0;i<6;i++){this.path.push(this.oneStepToTop)}
                break;
        }
    }

    draw(){
        ctx.drawImage(this.image, this.x, this.y, 50, 50);
    }

    update(num){
        if(this.pos != -1 && this.pos+num<=56){

            for(let i=this.pos;i<this.pos+num;i++){
                this.path[i](this.color_id,this.Pid);console.log('hemilo selmon')
            }
            this.pos += num;
            if(this.pos ==56){
                window.PLAYERS[this.color_id].won +=1;
            }

        }else if(num == 6){
            this.x = homeTilePos[this.color_id].x
            this.y = homeTilePos[this.color_id].y
            this.pos = 0;
        }
    }

    oneStepToRight(id,pid){
        window.PLAYERS[id].myPieces[pid].x += 50;
        console.log('to r',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepToLeft(id,pid){
        window.PLAYERS[id].myPieces[pid].x -= 50;
        console.log('to l',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepToTop(id,pid){
        window.PLAYERS[id].myPieces[pid].y -= 50;
        console.log('to t',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepToBottom(id,pid){
        window.PLAYERS[id].myPieces[pid].y += 50;
        console.log('to b',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepTowards45(id,pid){
        window.PLAYERS[id].myPieces[pid].x += 50;
        window.PLAYERS[id].myPieces[pid].y -= 50;
        console.log('to 45',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepTowards135(id,pid){
        window.PLAYERS[id].myPieces[pid].x -= 50;
        window.PLAYERS[id].myPieces[pid].y -= 50;
        console.log('to 135',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepTowards225(id,pid){
        window.PLAYERS[id].myPieces[pid].x -= 50;
        window.PLAYERS[id].myPieces[pid].y += 50;
        console.log('to 225',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    oneStepTowards315(id,pid){
        window.PLAYERS[id].myPieces[pid].x += 50;
        window.PLAYERS[id].myPieces[pid].y += 50;
        console.log('to 315',this.x,this.y,typeof(this.x),typeof(this.y));
    }

    kill(){
        this.x = allPiecesePos[this.color_id][this.Pid].x;
        this.y = allPiecesePos[this.color_id][this.Pid].y;
        this.pos = -1;  
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
        document.querySelector('#randomButt').addEventListener('click',function(event){
        event.preventDefault();
        console.log('chance is working');
        styleButton(0);
        diceAction();
        });
    }
    
    socket.on('imposter',()=>{window.location.replace("/error-imposter");});

    socket.on('is-it-your-chance',function(data){
        if(data===myid){
            styleButton(1);
            outputMessage({Name:'your',id:data},4)
        }else{outputMessage({Name:USERNAMES[data]+"'s",id:data},4)}
        chance = data;
    });

    socket.on('new-user-joined',function(data){
        MYROOM.push(data.id);
        loadNewPiece(data.id);
        outputMessage({Name:USERNAMES[data.id],id:data.id},0);
    });

    socket.on('rolled-dice',function(data){
        data.id != myid?outputMessage({Name:USERNAMES[data.id],Num:data.num,id:data.id},1):outputMessage({Name: 'you', Num:data.num, id:data.id},1);
    });

    socket.on('Thrown-dice',async function(data){
        console.log(data);
        await PLAYERS[data.id].myPieces[data.pid].update(data.num);
        if(iKill(data.id,data.pid)){
            outputMessage({msg:'Oops got killed',id:data.id},5);
            allPlayerHandler();
        }else{
            allPlayerHandler();
        }
        if(PLAYERS[data.id].didIwin()){
            socket.emit('WON',{
                room: data.room,
                id: data.id,
                player:myid
            });
        }
    });

    socket.on('winner',function(data){
        showModal(data);
    })

});


//To know if the client has disconnected with the server
socket.on('disconnect', function(){
    console.log('You are disconnected to the server');
})

//Output the message through DOM manipulation
function outputMessage(anObject,k){
    let msgBoard = document.querySelector('.msgBoard');

    if(k===1 && !(anObject.Name.includes('<') || anObject.Name.includes('>') || anObject.Name.includes('/'))){    
        const div = document.createElement('div');
        div.classList.add('message')
        div.innerHTML = `<p><strong>&#9733;  <span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span></strong><span id="color-message-span2"> got a ${anObject.Num}</span></p>`;
        msgBoard.appendChild(div);
    }
    else if(k===0 && !(anObject.Name.includes('<') || anObject.Name.includes('>') || anObject.Name.includes('/'))){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p>&#8605;  <span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> entered the game</span></p>`;
        msgBoard.appendChild(div);
    }
    else if(k===3){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<span id="color-message-span2" style="text-shadow: 0 0 4px ${colors[myid]};">${anObject}!!</span>`
        msgBoard.appendChild(div);
    }
    else if(k===4){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<p><span id="color-message-span2">Its </span><span id="color-message-span1"style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.Name}</span><span id="color-message-span2"> chance!!</span></p>`
        msgBoard.appendChild(div);
    }

    else if(k===5){
        const div = document.createElement('div');
        div.classList.add('messageFromServer');
        div.innerHTML = `<span id="color-message-span2" style="text-shadow: 0 0 4px ${colors[anObject.id]};">${anObject.msg}!!</span>`
        msgBoard.appendChild(div);
    }
    msgBoard.scrollTop = msgBoard.scrollHeight - msgBoard.clientHeight;
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
    socket.emit('roll-dice',{room:room_code,id:myid},function(num){
        let spirit = [];
        for(let i=0;i<4;i++){
            if(PLAYERS[myid].myPieces[i].pos>-1 && PLAYERS[myid].myPieces[i].pos<56){
                spirit.push(i);

            }
        }
        if(spirit.length!=0 || num==6){
            outputMessage('Click on a piece',3)
            canvas.addEventListener('click',function clickHandler(e){
                console.log('clicked Random Button');
                let Xp = e.clientX - e.target.getBoundingClientRect().left;
                let Yp = e.clientY - e.target.getBoundingClientRect().top;
                let myTurn = {
                    room: room_code,
                    id: myid,
                    num: num
                }
                let alert1 = true;

                for(let i=0;i<4;i++){
                    if(Xp-PLAYERS[myid].myPieces[i].x<45 && Xp-PLAYERS[myid].myPieces[i].x>0 && Yp-PLAYERS[myid].myPieces[i].y<45 && Yp-PLAYERS[myid].myPieces[i].y>0){
                        console.log(i,'okokokok');
                        if(spirit.includes(i) || num==6){
                            myTurn['pid'] = i;
                            console.log(myTurn);
                            socket.emit('random',myTurn, function(data){
                                styleButton(0);
                                console.log('random acknowledged');
                                socket.emit('chance',{room: room_code, nxt_id: chanceRotation(myid,data)});
                            });
                            canvas.removeEventListener('click',clickHandler);
                            return 0;
                        }else{
                            alert('Please click on a valid Piece.');
                            alert1 = false;
                            break;
                        }
                    }
        
                }
                if(alert1){alert('You need to click on a piece of your color');}
            })
        }else{socket.emit('chance',{room: room_code, nxt_id: chanceRotation(myid,num)});}
    })
}

//Initialise the game with the one who created the room.
function StartTheGame(){
    MYROOM.forEach(function(numb){
        numb==myid?outputMessage({Name:'You',id:numb},0):outputMessage({Name:USERNAMES[numb],id:numb},0)
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

//draws 4 x 4 = 16 pieces per call
function allPlayerHandler(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(let i=0;i<Object.keys(PLAYERS).length;i++){
        PLAYERS[MYROOM[i]].draw();
    }
}

//Load a new Player instance
function loadNewPiece(id){
    PLAYERS[id] = new Player(id);
    allPlayerHandler();
}

function iKill(id,pid){
    let boss = PLAYERS[id].myPieces[pid];
    for(let i=0;i<4;i++){
        for(let j=0;j<4;j++){
            if(i!=id && boss.x == PLAYERS[i].myPieces[j].x && boss.y == PLAYERS[i].myPieces[j].y){
                if(!inAhomeTile(id,pid)){
                    PLAYERS[i].myPieces[j].kill();
                    return 1;
                }
            }
        }
    }
    return 0;
}

function inAhomeTile(id,pid){
    for(let i=0;i<4;i++){
        if(PLAYERS[id].myPieces[pid].x == homeTilePos[i].x && PLAYERS[id].myPieces[pid].y == homeTilePos[i].y){
            return true;
        }
    }

    return false;
}

function showModal(id){
    document.getElementById("myModal").style.display = "block";
    document.getElementById("win-win").innerHTML = `The winner is ${USERNAMES[id]}`

}

function goHome(){
    window.location.replace("/");
}
