const path =require('path');
const express = require('express');
const socketio =require('socket.io');
const http = require('http');
const Filter = require('bad-words')
 
const app = express();
const server = http.createServer(app);
const io =socketio(server)

const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public')
app.use(express.static(publicDirectoryPath))

io.on('connection',(socket)=>{
    console.log('New webSocket Connection')
    socket.emit('message','Welcome!')

    socket.broadcast.emit('message', 'A new user has joined')
    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity not allowed')
        }
        io.emit('message', message);
        callback();
    })
    socket.on('send-location', (location, callback)=>{
        // if(!location.latitude || !location.longitude){
        //     return callback('Location sharing error!')
        // }
        io.emit('locationMessage', `https://google.com/maps?q=${location.latitude},${location.longitude}`)
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', 'A user has left')
    })
})


server.listen(port, ()=>{
    console.log(`Server is up at ${port}`)
})