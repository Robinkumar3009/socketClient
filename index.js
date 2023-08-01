const WebSocket = require("ws");
const { v4: uuidv4 } = require("uuid");
const { json } = require("stream/consumers");
const CLIENTS = new Set();
const connectedClients = {
}
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (wsConection) => {
    console.log("websocket running on 8080")
    // CLIENTS.add(wsConection);
    const userId = uuidv4();
    connectedClients[userId] = wsConection;
    const userObj = {
        method: "connectionId",
        id: userId
    };
    const rawString = JSON.stringify(userObj);
    wsConection.send(rawString);

    wsConection.on("message", (message) => {
        // const jsonString = JSON.stringify(message);
        const jsonObj = JSON.parse(message);
        if (jsonObj.method == "connect") {
            if (!connectedClients[jsonObj.username]) return;
            wsConection.send(JSON.stringify({
                method: 'status',
                status: true
            }))
        }
        if(jsonObj.method == "message"){
        //     username: userName,
        // targetId: userId,
        // method: "message"
        connectedClients[jsonObj.targetId].send(JSON.stringify({
            senderId: jsonObj.username,
            message: jsonObj.message
        }))
        }

        if(jsonObj.method == "wantToConnect"){
            connectedClients[jsonObj.targetId].send(JSON.stringify({
                senderId: jsonObj.username,
                method: "wantToConnect"
            }))
        }
    });

    // wsConection.on("message", (message) => {
    //     CLIENTS.forEach(client => {
    //         // if(client !== wsConection && client.readyState === WebSocket.OPEN){
    //         console.log(message);
    //         const decodedMsg = message.toString('utf-8');
    //         client.send(decodedMsg);
    //         // }
    //     })
    // });

    wsConection.on('close', (e) => {
        CLIENTS.delete(wsConection);
    });
});

