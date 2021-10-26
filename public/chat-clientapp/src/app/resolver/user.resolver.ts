import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, Resolve, RouterStateSnapshot} from "@angular/router";
import {ApiService} from "../services/api.service";
import {Observable, of} from "rxjs";
import {User} from "../interfaces/interfaces";
import {catchError} from "rxjs/operators";

@Injectable()

export class UserResolver implements Resolve<any> {
  constructor(private apiService: ApiService) {
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
    return this.apiService.getUserInfo()
      .pipe(catchError(err => {
        console.error(err)
        return of({
          nickname: '',
          id: ''
        })
      }))
  }
}
