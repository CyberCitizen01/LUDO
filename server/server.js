const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
      origin: '*'
    }});

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));

let rooms = {};
let messages = {};
let win = {};


//
///sockets
//
let nsp = io.of('/ludo');

nsp.on('connection',(socket)=>{
    console.log('A User has connected to the game');
    socket.on('fetch',(data,cb)=>{
        try{
            let member_id = generate_member_id(socket.id,data);
            socket.join(data);
            if(member_id !== -1){
                cb(Object.keys(rooms[data]),member_id);
                socket.to(data).emit('new-user-joined',{id:member_id});
            }else{
                console.log('There is someone with m_id = -1');
            }
        }
        catch(err){
            if(err.name === 'TypeError'){
                socket.emit('imposter');
            }
            console.log("hello",err,rooms);
        }
    });

    socket.on('roll-dice',(data,cb)=>{
        rooms[data.room][data.id]['num'] = Math.floor((Math.random()*6) + 1);
        data['num'] = rooms[data.room][data.id]['num']
        nsp.to(data.room).emit('rolled-dice',data);
        cb(rooms[data.room][data.id]['num']);
    })

    socket.on('chance',(data)=>{
        nsp.to(data.room).emit('is-it-your-chance',data.nxt_id);
    });

    socket.on('random',(data,cb)=>{
        if(data['num'] != rooms[data.room][data.id]['num']){
            console.log('Someone is trying to cheat!');
        }
        data['num'] = rooms[data.room][data.id]['num']
        nsp.to(data.room).emit('Thrown-dice', data);
        cb(data['num']);
    });

    socket.on('WON',(OBJ)=>{
        if(validateWinner(OBJ,socket)){
            nsp.to(OBJ.room).emit('winner',OBJ.id);
        }
    });

    socket.on('disconnect',()=>{
        let roomKey = deleteThisid(socket.id);
        if(roomKey != undefined){
            console.log(rooms[roomKey.room],socket.id);
            nsp.to(roomKey.room).emit('user-disconnected',roomKey.key)
        }
        console.log('A client just got disconnected');
    });
});


//
///Routes management
//
app.get('/', (req,res)=>{
    res.sendFile('index.html', { root: publicPath + '/html' });
});

app.post('/',(req,res)=>{
    if(req.body.action_to_do === 'create'){
        let p0th = randomPath()
        rooms[p0th] = {};
        win[p0th] = {};
        messages[p0th] = {};
        res.redirect(301, 'ludo/' + p0th);
    } else if(req.body.action_to_do === 'join'){
            if(Object.keys(rooms).includes(req.body.roomcode)){
                res.redirect(301, 'ludo/' + req.body.roomcode);
            } else{
                res.statusCode = 404;
                res.end('404!');
            }
        } else{
            res.statusCode = 404;
            res.end('404!');
        }
});

app.get('/ludo', (req,res)=>{
    res.redirect(301,'/');
});

app.get('/ludo/:ROOMCODE', (req,res)=>{
    if(Object.keys(rooms).includes(req.params.ROOMCODE) && Object.keys(req.query).length===0  &&  Object.keys(rooms[req.params.ROOMCODE]).length <= 3){
        res.sendFile('ludo.html', { root: publicPath + '/html' });
    } else{
        res.statusCode = 404;
        res.end('404!:(\nThis is either not a valid Room Code or The room is filled up, Go to home and create a room!');
    }
});

app.use(function (req, res) {
    res.statusCode = 404;
    res.end('404!');
});

server.listen(port,()=>{
    console.log(`The server has started working on http://localhost:${port}`);
})


//
///CUSTOM FUNCTIONS
//

//to generate unique rooms
function randomPath(){
    let randomPath = Math.random().toString(36).substr(2, 6);
    if(!Object.keys(rooms).includes(randomPath)){
        return randomPath;
    } else{ randomPath(); }
};

//to randomise the color a player can get when he 'fetch'es.
function generate_member_id(s_id,rc){
    let m_id = Math.floor(Math.random()*4);
    let m_r = Object.keys(rooms[rc]);
    if(m_r.length <= 4){
        if(m_r.includes(m_id.toString())){
            return generate_member_id(s_id,rc)
        }else{
            rooms[rc][m_id] = {sid:s_id,num:0};
            return m_id;
        }
    } else{
        return -1;
    }
}

//to delete the extra place when (only one) user refreshes.
function deleteThisid(id){
    for(var roomcd in rooms){
        if(rooms.hasOwnProperty(roomcd)){
            ky = Object.keys(rooms[roomcd]).find( key => rooms[roomcd][key]['sid'] == id);
            if(typeof(ky) === 'string'){
                delete rooms[roomcd][ky];
                return {key:ky,room:roomcd};
            }
            if(Object.keys(rooms[roomcd]).length == 0){
                delete rooms[roomcd];
                return undefined;
            }
        }
    }
    
}

function validateWinner(OBJ,socket){
    win[OBJ.room][OBJ.player] = {o:OBJ,s:socket.id};
    if(()=>{
        if(Object.keys(win[OBJ.room]).length == 4){
            for(let i=0;i<4;i++){
                if(win[OBJ.room][String(i)]['s']==rooms[OBJ.room][String(i)]['sid']){
                    continue;
                }else{return false}
            }
            return true;
        }else{return false;}
    }){
        for(let i=0;i<3;i++){
            if(win[OBJ.room][String(i)]['o'].id == win[OBJ.room][String(i+1)]['o'].id){
                continue;
            }else{return false}
        }
        return true;
    }else{return false;}
    
}

// rooms ={
//     'ax0fed':{
//                 0:{'sid':'akjldsaa',num:0},
//                 1:{'sid':'laiukfjh',num:0},
//                 2:{'sid':'asdlksfh',num:0},
//                 3:{'sid':'ufhdjaad',num:0}
//              },
//     'ghty12':{
//                 0:{'sid':'asdghfad',num:0},
//                 1:{'sid':'hydgdjdj',num:0},
//                 2:{'sid':'kujhsgdf',num:0},
//                 3:{'sid':'ghhgdsyl',num:0}
//              },
// }
//
// message ={
//     'ax0fed':{
//                 hasTheGameAlreadyStarted:false,
//                 allXY:{}
//}
//
// data = numb;
//
// playerObj ={
//     room: room_code,
//     id: myid,
//     pid: pid,
//     num: temp
// }