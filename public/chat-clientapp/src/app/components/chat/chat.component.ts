import {AfterViewInit, Component, ElementRef, HostListener, ViewChild, ViewChildren} from "@angular/core";
import {StoreService} from "../../services/store.service";
import {webSocket, WebSocketSubject} from "rxjs/webSocket"
import {ActivatedRoute, Router} from "@angular/router";
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

  @HostListener('window:resize', ['$event'])
  onResize(event: HTMLElement) {
    // console.log(window.matchMedia('(max-width: 600px)'))
  }

  @ViewChild("chatBody") chatBody: ElementRef;

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

  lessThan600: boolean;
  show = false;

  constructor(
    private store: StoreService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private websocketService: WebsocketService,
    private router: Router) {
    this.activatedRoute.data
      .subscribe(r => {
        this.store.user = r.user;
        this._chatParticipants = {
          target: '',
          sender: this.store?.user?.id
        }
      })
    this.webSocketInit();
    this.loadMessageTargets();
    this.onMediaChange();
  }

  private onMediaChange() {
    const media = window.matchMedia('(max-width: 600px)')
    this.lessThan600 = media.matches;
    media.onchange = (e) => {
      this.lessThan600 = e.matches
    }
  }

  enter(event: KeyboardEvent, input: HTMLElement) {
    console.log(event)
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(input)
      return false;
    }
    return true
  }

  toggle(): void {
    this.show = !this.show;
  }

  logOut(): void {
    window.localStorage.removeItem('jwt');
    this.router.navigate(['main'])
  }


  public chooseTarget(userId: string): void {
    if (this._chatParticipants.target) {
      if (this._chatParticipants.target === userId) {
        this.targetMessages = [];
        this._chatParticipants.target = "";
        return;
      }
    }
    this._chatParticipants.target = userId;
    this.apiService.getMessages(userId)
      .subscribe(r => {
        this.targetMessages = r;
        setTimeout(() => {
          this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight
        }, 0)
        const lastMessage = r[r.length - 1] || null;
        if (!lastMessage?.seenByTarget && lastMessage?.target === this.store.user.id) {
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
      const target = r.sender === this._chatParticipants.sender ? r.target : r.sender;
      if (this._chatParticipants.target) {
        this.targetMessages.push(JSON.parse(r.data));
        setTimeout(() => {
          this.chatBody.nativeElement.scrollTop = this.chatBody.nativeElement.scrollHeight
        }, 0);
        if (!r.seenByTarget && r.target === this.store.user.id) {
          // markMessagesAsSeen();
        }
      } else {
        // addRedCircleToElement(target);
      }


    }, error => {
      console.error(error)
    })
    this.wsChatSocket.next({id: this.store.user.id})
    this.sockets.push(this.wsChatSocket)

  }

  private openActiveUsersConnection() {
    this.wsUsersSocket = this.websocketService.openActiveUsersConnection();
    this.wsUsersSocket.subscribe(r => {
      this.getUsers()
    }, error => {
      console.error(error)
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
