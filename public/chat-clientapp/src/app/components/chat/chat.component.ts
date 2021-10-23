import {Component, HostListener} from "@angular/core";
import {StoreService} from "../../services/store.service";
import {webSocket, WebSocketSubject} from "rxjs/webSocket"
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {Message} from "../../interfaces/interfaces";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
  styleUrls: ["./chat.component.scss"]
})

export class ChatComponent {
  @HostListener('window:beforeunload', ['$event'])
  onReload() {
    this.closeConnection();
  }

  public _chartParticipants = Object.create({
    target: '',
    sender: this.store?.user?.id
  })
  wsChat: WebSocketSubject<any>;
  wsUsers: WebSocketSubject<any>
  private sockets: Array<WebSocketSubject<any>> = [];
  public users: Array<{ id: string; nickname: string; active?: boolean }> = [];
  public targetMessages: Message[] = [];
  constructor(private store: StoreService, private activatedRoute: ActivatedRoute, private apiService: ApiService) {
    this.activatedRoute.data
      .subscribe(r => {
        console.log(r)
        this.store.user = r.user;
      })
    this.openChatConnection();
    this.openActiveUsersConnection();

    this.loadMessageTargets();
  }

  public chooseTarget(userId: string): void {
    this._chartParticipants.target = userId;

    this.apiService.getMessages(userId)
      .subscribe(r => {
        console.log(r)
        this.targetMessages = r;
      }, error => {
        console.error(error)
      })
  }

  private getUsers() {
    this.apiService.getUsers(this.store.user.id)
      .subscribe((r) => {
        this.compareActivesAndTargets(r.users);
      }, error => {
        console.error(error)
      })
  }

  private loadMessageTargets() {
    this.apiService.getTargets()
      .subscribe(r => {
        console.log(r)
        this.users = r;
      }, error => {
        console.error(error)
      })
  }

  private compareActivesAndTargets(activeUsers: { id: string, nickname: string }[]) {

    if(activeUsers.length === 0) {
      this.users = this.users.map(el => {
        el.active = false;
        return el;
      });
    }

    activeUsers?.forEach(el => {
      let index = this.users.findIndex(u => u.id === el.id)
      if(index === -1) {
        this.users.push({...el, active: true})
      } else {
        this.users[index] = {...el, active: true}
      }
    })

  }

  private openActiveUsersConnection(): void {
    const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const echoSocketUrl =
      socketProtocol + "//" + "localhost:8080" + "/get-active-users/";
    this.wsUsers = webSocket({
      url: echoSocketUrl,
      deserializer: msg => msg
    });
    this.wsUsers.subscribe(r => {
      console.log("Users", r)
      this.getUsers()
    }, error => {
      console.log(error)
    })
    this.wsUsers.next({id: this.store.user.id})
    this.sockets.push(this.wsUsers)

  }

  private openChatConnection(): void {
    const socketProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const echoSocketUrl = socketProtocol + "//" + "localhost:8080" + "/get-new-message/";
    this.wsChat = webSocket({
      url: echoSocketUrl,
      deserializer: msg => msg
    });
    this.wsChat.subscribe(r => {
      console.log(r)
    }, error => {
      console.log(error)
    })
    this.wsChat.next({id: this.store.user.id})
    this.sockets.push(this.wsChat)
  }

  private closeConnection() {
    this.sockets.forEach(ws => {
      console.log("unload")
      ws.error({code: 4000, reason: this.store.user.id});
    })
  }
}
