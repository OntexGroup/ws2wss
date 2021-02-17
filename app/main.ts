import * as yargs from 'yargs';
import { WebServer } from './webServer';
import { WebSocketServer } from './webSocketServer';

let args = yargs
    .option('webServerPort', {
        alias: 'ws',
        description: "Port number the webserver will listen on",
        demand: true
    })
    .option('webSocketServerPort', {
        alias: 'wss',
        description: "Port number the Websocket Server will listen on",
        demand: true
    }).argv;

const ws = new WebServer(args.webServerPort);
const wss = new WebSocketServer(args.webSocketServerPort);

ws.onPost$.subscribe({
    next : wss.send.bind(wss)
});

wss.onConnectionsChanged$.subscribe({
    next : ws.setClients.bind(ws)
});
