import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor
} from '@angular/common/http';

import {
  Observable, throwError, tap, 
  share, catchError, switchMap, map
} from 'rxjs';

import { AUTHORIZE } from '../../http-contexts/http-contexts';
import { HttpRequestService } from 'src/app/http-service.service';


@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpRequestService) {}

  private refreshToken$ = this.httpService.refresh().pipe(
    tap(res => {
      localStorage.setItem('access', res.access);
      localStorage.setItem('refresh', res.refresh);
    }),
    share(),
  );

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = request.url;

    let authorize = request.context.get(AUTHORIZE);

    if (!authorize)
      return next.handle(request);

    const token = localStorage.getItem('access');

    if (!token)
      return throwError(() => "Access token missing");

    const authorizedRequest = request.clone({
      setHeaders: {Authorization: `Bearer ${token}`}
    })

    return next.handle(authorizedRequest).pipe(
      catchError(err => {
        if (err.status != 401)
          return throwError(() => err);

        return this.refreshThenRetry(authorizedRequest, next)
      }
      ),
    );
  }

  private refreshThenRetry(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.refreshToken$.pipe(
      switchMap(res => {
        const token = res.access;

        const authorizedRequest = request.clone({
          setHeaders: {Authorization: `Bearer ${token}`}
        })

        return next.handle(authorizedRequest);
      }
    ));
  }
        
}
