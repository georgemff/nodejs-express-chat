import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {AuthAPIResponse, Message, User, UserAuth} from "../interfaces/interfaces";
import {Observable} from "rxjs";

@Injectable({
  providedIn: "root"
})

export class ApiService {
  private readonly baseUrl: string = "http://localhost:8080/";

  constructor(private httpClient: HttpClient) {
  }

  public authOrRegister(body: UserAuth): Observable<AuthAPIResponse> {
    const url = this.baseUrl + "login-or-register";
    return this.httpClient.post(url, body) as Observable<AuthAPIResponse>
  }

  public hasUnreadMessages() {
    const url = this.baseUrl + "has-unread-messages";
    return this.httpClient.get(url);
  }

  public getMessages(target: string): Observable<Message[]> {
    const url = this.baseUrl + `target/${target}`;
    return this.httpClient.get(url) as Observable<Message[]>
  }

  public getUsers(userId: string): Observable<{users: User[]}> {
    const url = this.baseUrl + `users/${userId}`;
    return this.httpClient.get(url) as Observable<{users: User[]}>;
  }

  public markAsSeen(sender: string) {
    const url = this.baseUrl + `mark-messages-as-seen/${sender}`;
    return this.httpClient.get(url)
  }

  public getTargets(): Observable<User[]> {
    const url = this.baseUrl + `all-messages-targets`;
    return this.httpClient.get(url) as Observable<User[]>
  }

  public getUserInfo(): Observable<User> {
    const url = this.baseUrl + "user-info"
    return this.httpClient.get(url) as Observable<User>;
  }
}
