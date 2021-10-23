import {Injectable} from "@angular/core";
import {webSocket, WebSocketSubject} from "rxjs/webSocket";

@Injectable()

export class WebsocketService {
  private static socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  private static baseAddress = "localhost:8080";

  public openActiveUsersConnection(): WebSocketSubject<any> {
    const echoSocketUrl = WebsocketService.socketProtocol + "//" + WebsocketService.baseAddress + "/get-active-users/";
    return webSocket({
      url: echoSocketUrl,
      deserializer: msg => msg
    });
  }

  public openChatConnection(): WebSocketSubject<any> {
    const echoSocketUrl = WebsocketService.socketProtocol + "//" + WebsocketService.baseAddress + "/get-new-message/";
    return webSocket({
      url: echoSocketUrl,
      deserializer: msg => msg
    });
  }
}
