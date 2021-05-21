const path = require('path');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;

app.use(express.static(publicPath));
app.use(express.urlencoded({ extended: true }));

let USERNAMES = ['Green Warrior', 'Yellow Rhino', 'Blue Fox', 'Red Fire'];
let rooms = {};
let messages = {};

let nsp = io.of('/ludo');

nsp.on('connection',(socket)=>{
    console.log('A User has connected to the game');
    //socket.emit('H',"HHHH",()=> console.log("hello"))
    //socket.on('testestest',(data,cb)=>{console.log(data);cb();});
    socket.on('fetch',(data,cb)=>{
        try{
            let member_id = generate_member_id(socket,data);
            console.log(rooms);
            socket.join(data);
            //console.log(socket);
            if(member_id !== -1){
                cb(Object.keys(rooms[data]),member_id);
                socket.to(data).emit('new-user-joined',{id:member_id});
            }else{
                console.log('There is someone with m_id = -1');
            }
        }
        catch(err){
            console.log(rooms);
            if(err.name === 'TypeError'){
                socket.emit('imposter');
            }
            console.log("hello",err);
        }
    });

    socket.on('disconnect',()=>{
        console.log('That client just got disconnected-',socket.id);
        deleteThisid(socket);
        //delete rooms[data.room][data.id];
    });
    // nsp.on('random',(data,cb)=>{
    //     socket.to(data.room).emit('otherUserData',{Name: data.Name, Num: data.Num});
    //     cb();
    // });
});

app.get('/', (req,res)=>{
    res.sendFile('index.html', { root: publicPath + '/html' });
});

app.post('/',(req,res)=>{
    // console.log(req.body.action_to_do);
    if(req.body.action_to_do === 'create'){
        let p0th = randomPath()
        rooms[p0th] = {};
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
    console.log(req.params.ROOMCODE,req.query);
    if(Object.keys(rooms).includes(req.params.ROOMCODE) && Object.keys(req.query).length===0  &&  Object.keys(rooms[req.params.ROOMCODE]).length <= 3){
        res.sendFile('ludo.html', { root: publicPath + '/html' });
    } else{
        res.statusCode = 404;
        res.end('404!:(\nThis is either not a valid Room Code or The room is filled up, Go to home and create a room!');
    }
});

app.use(function (req, res) {
    console.log(req.url,req.originalUrl,typeof(req.url),typeof(req.originalUrl));
    res.statusCode = 404;
    res.end('404!');
});

server.listen(port,()=>{
    console.log(`The server has started working on http://localhost:${port}`);
})

function randomPath(){
    let randomPath = Math.random().toString(36).substr(2, 6);
    if(!Object.keys(rooms).includes(randomPath)){
        return randomPath;
    } else{ randomPath(); }
};

function generate_member_id(s_id,rc){
    let m_id = Math.floor(Math.random()*4);
    let m_r = Object.keys(rooms[rc]);
    if(m_r.length <= 4){
        if(m_r.includes(m_id.toString())){
            return generate_member_id(s_id,rc)
        }
    } else{
        return -1;
    }
}

function deleteThisid(socket){
    for(var roomcd in rooms){
        if(rooms.hasOwnProperty(roomcd)){
            ky = Object.keys(rooms[roomcd]).find( key => rooms[roomcd][key] === socket.id);
            delete rooms[roomcd][ky];
        }
    }
}
