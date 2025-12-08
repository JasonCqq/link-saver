import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";
import { environment } from "../../../../environments/environment";

@Injectable({
  providedIn: "root", // Singleton service
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io(environment.apiUrl, {
      withCredentials: true,
    });
  }
  getSocket(): Socket {
    return this.socket;
  }
}
