import { Injectable, Injector } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtService } from './jwt-service';


@Injectable()
export class HttpTokenInterceptor implements HttpInterceptor {
  constructor(private jwtService: JwtService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headersConfig = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    const token = this.jwtService.getToken();

    if (token) {
      headersConfig['Authorization'] = `Token ${token}`;
    }
    const now = new Date().getHours()
    /**
     *  check if value in now is between 9am and 4pm
     *  9am -> 9
     *  6pm -> 18
     */
    if (now >= 9 && now <= 16) {
      console.log('Market is Open ')
      const request = req.clone({ setHeaders: headersConfig });
      return next.handle(request);
    } else {
      console.log('Sorry!! market is closed')
    }

  }
}
