import {Injectable} from "@angular/core";
import {User} from "../interfaces/interfaces";

@Injectable({
  providedIn: "root"
})

export class StoreService {
  private _user: User;

  get user(): User {
    return this._user;
  }

  set user(value: User) {
    this._user = value;
  }
}
