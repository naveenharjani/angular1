import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { EnvService } from '../../env.service';
import { AuthenticationService } from '../shared/services/authentication.service';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { first, catchError, switchMap, take, filter } from 'rxjs/operators';
 
@Injectable()
export class JwtInterceptor implements HttpInterceptor{
    private isgettingNewToken=false;
    private isRefreshing=false;
    private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    
    public isLoggedIn:any;  
    public currentUser:any;
    constructor(private authenticationService: AuthenticationService, private cookiesService: BeehiveCookiesService) {               
         }
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.authenticationService.findToken()) {
            request = this.addToken(request, this.authenticationService.findToken());
          }
          return next.handle(request).pipe(catchError(error => {
            if (error.statusText =="Invalid JWT Token" || error.statusText=="JWT Token is Missing") {
              return this.handle401Error(request, next);
            } 
            else if(error=="Invalid User or Token"){
                this.authenticationService.removeTokens();
                alert("Token Expired, Please refresh the page");
                return throwError(error);

            }else {
              return throwError(error);
            }
          }));
    }


        // this.currentUser =localStorage.getItem('currentUser')!=null? JSON.parse(localStorage.getItem('currentUser')):null ; 
       
        // console.log("Above interceptor ",this.currentUser);
        // if (this.currentUser!=null) {            
        //     console.log(this.currentUser);
        //     request = request.clone({ headers: request.headers.set('Authorization', `Bearer ${this.currentUser.JwtToken}`) });
        // }  
        // else
        // {
        //     request = request;
        // }     

        //return next.handle(request);
        private addToken(request: HttpRequest<any>, token: string) {
           return request.clone({ headers: request.headers.set('Authorization', `Bearer ${token}`) });
          }
         

private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);
  
      return this.authenticationService.refreshToken(this.cookiesService.GetUserID()).pipe(
        switchMap((token: any) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.JwtToken);
          return next.handle(this.addToken(request, token.JwtToken));
        })
        ,catchError(error => {
          console.log("error on catch",error);
          if (error.statusText=="Bad Request") {
             this.authenticationService.removeTokens();
             //console.log(error.body);
              //alert("Authorization failed, Please refresh the page");
              window.location.reload();
              return throwError(error);
          }
        })
        
        );
  
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(jwt => {
          return next.handle(this.addToken(request, jwt));
        })
        );
    }
  }

}
