import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable ,  BehaviorSubject ,  ReplaySubject, throwError } from 'rxjs';

import { ApiService } from './api.service';
import { JwtService } from './jwt-service';
import { map ,  distinctUntilChanged, catchError } from 'rxjs/operators';
import { User } from '../models/user.model';
import { environment } from '../../../environments/environment';


@Injectable()
export class UserService {
  private currentUserSubject = new BehaviorSubject<User>({} as User);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);
  public isAuthenticated = this.isAuthenticatedSubject.asObservable();
  //baseUrl = 'https://localhost/api/FivepaisaAPI/';
  baseUrl= environment.api_url;

  constructor (
    private apiService: ApiService,
    private http: HttpClient,
    private jwtService: JwtService
  ) {}

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate():Observable<User>  {

    return this.http.get(this.baseUrl +'LoginRequestMobileNewbyEmail')
      .pipe((data: any) => {
      //handle api 200 response code here or you wanted to manipulate to response
        //this.setAuth(data);
        return data;
      },
        catchError((error) => {    // handle error

          if (error.status == 404) {
            //Handle Response code here
          }
          return throwError(error);
        })
      );

    //   this.http.get(`${environment.api_url}`+'/LoginRequestMobileNewbyEmail')
    //   .subscribe(data => {
    //     this.setAuth(JSON.parse(data));
    //   }
    // );
    // If JWT detected, attempt to get & store user's info
    // if (this.jwtService.getToken()) {
    //   this.apiService.get('/LoginRequestMobileNewbyEmail')
    //   .subscribe(
    //     data => this.setAuth(data.user),
    //     err => this.purgeAuth()
    //   );
    // } else {
    //   // Remove any potential remnants of previous auth states
    //   this.purgeAuth();
    // }
  }

  setAuth(user: User) {
    // Save JWT sent from server in localstorage
    this.jwtService.saveToken(user.jwtToken);
    localStorage.setItem('isLoggedin', 'true');

    // Set current user data into observable
    this.currentUserSubject.next(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
  }

  purgeAuth() {
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next({} as User);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
  }

//   attemptAuth(type, credentials): Observable<User> {
//     //const route = (type === 'login') ? '/login' : '';
//     return this.apiService.get('/LoginRequestMobileNewbyEmail')
//       .pipe(map(
//       data => {
//         this.setAuth(data.user);
//         return data;
//       }
//     ));
//   }

  getCurrentUser(): User {
    return this.currentUserSubject.value;
  }

  // Update the user on the server (email, pass, etc)
//   update(user): Observable<User> {
//     return this.apiService
//     .put('/LoginRequestMobileNewbyEmail', { user })
//     .pipe(map(data => {
//       // Update the currentUser observable
//       this.currentUserSubject.next(data.user);
//       return data.user;
//     }));
//   }

}
