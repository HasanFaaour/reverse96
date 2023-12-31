import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler,
  HttpEvent, HttpInterceptor
} from '@angular/common/http';
import { Router } from '@angular/router';

import {
  Observable, throwError, tap, 
  share, map, last, of, retry, defer
} from 'rxjs';

import { AUTHORIZE } from '../../http-contexts/http-contexts';
import { HttpRequestService } from 'src/app/http-service.service';


@Injectable()
export class AuthorizationInterceptor implements HttpInterceptor {

  constructor(private httpService: HttpRequestService, private router: Router) {}

  private refreshToken$ = defer(() =>
    this.httpService.refresh().pipe(
      tap(res => {
        localStorage.setItem('access', res.access);
        localStorage.setItem('refresh', res.refresh);
      }),
      map(res => res.access),
    )
  ).pipe(share());

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = request.url;

    let authorize = request.context.get(AUTHORIZE);

    if (!authorize)
      return next.handle(request);

    let token = localStorage.getItem('access');

    if (!token)
      return throwError(() => "Access token missing");

    return defer( () => {
      const authorizedRequest = request.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
      })
    
      return next.handle(authorizedRequest);
    }).pipe(
      retry({
        count: 3,
        delay: (error, retryCount) => {

          if (error.status != 401)
            return throwError(() => error);

          return this.refreshToken(token!).pipe(
            tap(res => token = res)
          );
        }
      })
    );
  }

  private refreshToken(usedToken: string): Observable<string> {
    let currentToken = localStorage.getItem('access');
   
    if (currentToken && currentToken != usedToken)      
      return of(currentToken);

    return this.refreshToken$.pipe(
      last(),
      tap({error: err => 
        this.router.navigateByUrl('/logout')
      }),
    );
  }
        
}
