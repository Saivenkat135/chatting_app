// from the node modules we import server from socket.io
const {Server} = require("socket.io");

// here we create a new instance of the server and we pass the port number and the cors configuration
const io= new Server(3001 , {
    // some configuration for the cors to allow the connection from the frontend
    cors:{
        origin:'http://localhost:3000'
    }
})
/* here it is an active listener whenever a new connection is established with the server 
    when we get new connection the callback function will be called  

    and the socket is Whenever a client connects, Socket.IO creates a special object 
        representing that specific connection.

*/

io.on("connection",(socket)=>{
    console.log("A new user conected with the id: " + socket.id);
});

