const {join} = require('path');
const express = require('express');
const {createServer} = require('http');
const socketIO = require('socket.io');

const {PORT} = require('./config/config');

const rootRouter = require('./routes/rootRouter')
const ludoRouter = require('./routes/ludoRouter')

let {rooms,NumberOfMembers,win} = require('./models/model');

const app = express();
const server = createServer(app);
const io = socketIO(server, {
    cors: {
      origin: '*'
    }});

app.use(express.static(join(__dirname, 'public/')));
app.use(express.urlencoded({ extended: true }));
app.enable('trust proxy');

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

    socket.on('random',(playerObj,cb)=>{
        // playerObj ={
        //     room: room_code,
        //     id: myid,
        //     pid: pid,
        //     num: temp
        // }
        if(playerObj['num'] != rooms[playerObj.room][playerObj.id]['num']){
            console.log('Someone is trying to cheat!');
        }
        playerObj['num'] = rooms[playerObj.room][playerObj.id]['num']
        nsp.to(playerObj.room).emit('Thrown-dice', playerObj);
        cb(playerObj['num']);
    });

    socket.on('WON',(OBJ)=>{
        if(validateWinner(OBJ,socket)){
            delete win[OBJ.room];
            delete NumberOfMembers[OBJ.room];
            if(rooms[OBJ.room]){
                delete rooms[OBJ.room];
            }
            nsp.to(OBJ.room).emit('winner',OBJ.id);
        }
    });

    socket.on('resume',(data,cb)=>{
        socket.to(data.room).emit('resume',data);
        NumberOfMembers[data.room].members<=2?2:NumberOfMembers[data.room].members -= 1;
        NumberOfMembers[data.room].constant = true;
        cb();
    });

    socket.on('wait',(data,cb)=>{
        socket.to(data.room).emit('wait',data);
        cb();
    });

    socket.on('disconnect',()=>{
        let roomKey = deleteThisid(socket.id);
        if(roomKey != undefined){
            console.log(rooms[roomKey.room],socket.id);
            socket.to(roomKey.room).emit('user-disconnected',roomKey.key)
        }
        console.log('A client just got disconnected');
    });
});


//
///CUSTOM FUNCTIONS
//

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

//to validate a winner, by comparing the data provided by all 4
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

//
///Routes management
//
app.use('/', rootRouter);
app.use('/ludo', ludoRouter);
app.use(function (req, res) {
    res.statusCode = 404;
    res.end('404!');
});

server.listen(PORT,()=>{
    console.log(`The server has started working on http://localhost:${PORT}`);
});
