import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { routerTransition } from '../router.animations';
import { User } from '../shared/models/user.model';
import { FivePaisaService } from '../shared/services/Fivepaisa.service';
import { JwtService } from '../shared/services/jwt-service';
import { UserService } from '../shared/services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition()]
})
export class LoginComponent implements OnInit {
    user: User;
    constructor(public router: Router, public userService:
        UserService, private jwtService: JwtService, public fivePaisaService: FivePaisaService) {}

    ngOnInit() {}

    onLoggedin() {
        this.userService.populate().subscribe((data: any) => {
          this.user = data.responseData.body;
          this.jwtService.saveToken(this.user.jwtToken);
          localStorage.setItem('isLoggedin', 'true');
          localStorage.setItem('userName', this.user.clientName);

          this.router.navigateByUrl('/watchlist');
        });
    }

    onLoggedin1() {
        this.fivePaisaService.Login().subscribe((data: any) => {
            this.user = data.responseData.body;
            this.jwtService.saveToken(this.user.jwtToken);
            localStorage.setItem('isLoggedin', 'true');
            this.router.navigateByUrl('/watchlist');
          });
    }
}
