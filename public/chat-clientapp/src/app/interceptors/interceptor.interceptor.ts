import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpRequest, HttpHandler } from '@angular/common/http';
import {EMPTY, Observable} from 'rxjs';
import {StoreService} from "../services/store.service";
import {catchError} from "rxjs/operators";
import {Router} from "@angular/router";

@Injectable()
export class InterceptorInterceptor implements HttpInterceptor {
  constructor(private store: StoreService, private router: Router) {
  }
  intercept(httpRequest: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let jwtToken = window.localStorage.getItem("jwt") || '';
    return next.handle(httpRequest.clone({setHeaders: {
        "x-access-token": jwtToken,
      }}))
      .pipe(catchError(err => {
        console.error(err)
        if(err.status === 401) {
          this.router.navigate(['main']);
        }
        return EMPTY
      }))
  }
}
