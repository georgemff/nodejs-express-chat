import {Component, HostListener, ViewChild} from "@angular/core";
import {StoreService} from "../../services/store.service";
import {webSocket, WebSocketSubject} from "rxjs/webSocket"
import {ActivatedRoute} from "@angular/router";
import {ApiService} from "../../services/api.service";
import {Message, NewMessage} from "../../interfaces/interfaces";
import {WebsocketService} from "./services/websocket.service";
import {catchError} from "rxjs/operators";
import {EMPTY} from "rxjs";

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

  @ViewChild("chatBody") chatBody: HTMLElement;

  public _chatParticipants: {
    target: string;
    sender: string;
  }

  private wsChatSocket: WebSocketSubject<any>;
  private wsUsersSocket: WebSocketSubject<any>;
  private sockets: Array<WebSocketSubject<any>> = [];

  public users: Array<{ id: string; nickname: string; active?: boolean }> = [];
  public targetMessages: Message[] = [];

  public newMessage: string = "";

  constructor(
    private store: StoreService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private websocketService: WebsocketService) {
    this.activatedRoute.data
      .subscribe(r => {
        console.log(r)
        this.store.user = r.user;
        this._chatParticipants = {
          target: '',
          sender: this.store?.user?.id
        }
        console.log('sb', this._chatParticipants)
      })
    this.webSocketInit();
    this.loadMessageTargets();
  }

  public getClassName(message: Message): boolean {
    return message.sender === this._chatParticipants.sender;
  }


  public chooseTarget(userId: string): void {
    this._chatParticipants.target = userId;
    console.log(this._chatParticipants)
    this.apiService.getMessages(userId)
      .subscribe(r => {
        console.log(r)
        this.targetMessages = r;
        this.chatBody.scrollTop = this.chatBody.scrollHeight
        const lastMessage = r[r.length - 1];
        if (!lastMessage.seenByTarget && lastMessage.target === this.store.user.id) {
          this.markMessagesAsSeen();
        }
      }, error => {
        console.error(error)
      })
  }

  public sendMessage(input: HTMLElement) {
    const body: NewMessage = {
      target: this._chatParticipants.target,
      message: input.innerText
    }

    if (!body.message || !body.target) return;
    console.log(false)
    this.apiService.sendMessage(body)
      .pipe(catchError(err => {
        console.error(err);
        return EMPTY
      }))
      .subscribe(r => {
        input.innerText = ""
      })
  }

  private markMessagesAsSeen() {
    this.apiService.markAsSeen(this._chatParticipants.target)
      .pipe(catchError(err => {
          console.error(err);
          return EMPTY;
        }
      ))
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

    if (activeUsers.length === 0) {
      this.users = this.users.map(el => {
        el.active = false;
        return el;
      });
    }

    activeUsers?.forEach(el => {
      let index = this.users.findIndex(u => u.id === el.id)
      if (index === -1) {
        this.users.push({...el, active: true})
      } else {
        this.users[index] = {...el, active: true}
      }
    })

  }

  private webSocketInit(): void {
    this.openChatConnection()
    this.openActiveUsersConnection();
  }

  private openChatConnection() {
    this.wsChatSocket = this.websocketService.openChatConnection();
    this.wsChatSocket.subscribe(r => {
      this.targetMessages = JSON.parse(r.data);
      this.chatBody.scrollTop = this.chatBody.scrollHeight


    }, error => {
      console.log(error)
    })
    this.wsChatSocket.next({id: this.store.user.id})
    this.sockets.push(this.wsChatSocket)

  }

  private openActiveUsersConnection() {
    this.wsUsersSocket = this.websocketService.openActiveUsersConnection();
    this.wsUsersSocket.subscribe(r => {
      console.log("Users", r)
      this.getUsers()
    }, error => {
      console.log(error)
    })
    this.wsUsersSocket.next({id: this.store.user.id})
    this.sockets.push(this.wsUsersSocket)
  }


  private closeConnection() {
    this.sockets.forEach(ws => {
      ws.error({code: 4000, reason: this.store.user.id});
    })
  }
}
