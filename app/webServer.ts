import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { Subject } from 'rxjs';

export class WebServer {

    private _server: any;
    private _clients : any[] = [];
    public onPost$: Subject<any> = new Subject<any>();

    constructor(port: number) {
        this._startServer(port);
    }

    private _startServer(port: number): void {
        const self = this;
        this._server = express();
        this._server.use(bodyParser.text());

        this._server.post('/forwardJSON', function(request : Request, response : Response){
            self.onPost$.next(request.body);
            response.end();
        });

        this._server.get('/clients', function(request : Request, response : Response){
           response.send(self._clients);
        });

        this._server.listen(port);
        console.log(`Webserver now listenening on port ${port}`);
    }

    public setClients(clients : any[]){
        this._clients = clients;
    }

}