import { createServer, Server as httpServer } from 'http';
import { Subject } from 'rxjs';
import { server as websocketServer } from 'websocket';
import * as _ from 'lodash';


export class WebSocketServer {

    private _httpServer: httpServer;
    private _websocketServer: websocketServer;
    public onConnectionsChanged$ = new Subject<any>();

    constructor(port: number) {
        this._startServer(port);
    }

    private _startServer(port: number): void {
        const self= this;

        this._httpServer = createServer();
        this._httpServer.listen(port, () => { });
        this._websocketServer = new websocketServer({ httpServer: this._httpServer });

        console.log(`Websocket server now listenening on port ${port}`);

        this._websocketServer.on('request',
            (request) => {
                const connection = request.accept(undefined, request.origin);

                connection.on('message', function (message) {
                    if (message.type === 'utf8') {
                        let json = JSON.parse(message.utf8Data);
                        connection["channels"] = json.channels || [];
                        connection["applicationId"] = json.applicationId || "";
                        connection["userId"] =  json.userId || "";
                        self._connectionsChanged.call(self);
                    }
                });
            }
        );

        this._websocketServer.on('close', this._connectionsChanged.bind(this));

    }

    private _connectionsChanged() : void{
        this.onConnectionsChanged$.next(_.map(this._websocketServer.connections, item => _.pick(item, ["userId", "applicationId", "channels", "remoteAddress"])));
    }

    public send(message: any): void {
        console.log("Received message: " + message);
        try {
            const json = JSON.parse(message);
            this._websocketServer.connections.forEach(connection => {
                if (connection["channels"] && connection["channels"].indexOf(json.channel) !== -1) {
                    connection.send(message);
                }
            });
        } catch (e) {
            console.log("Error parsing message as JSON: " + message);
        }
    }
}