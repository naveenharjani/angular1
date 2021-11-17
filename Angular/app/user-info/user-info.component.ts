import { Component, OnInit } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { BehaviorSubject, interval } from 'rxjs';

@Component({
  selector: 'user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.css']
})
export class UserInfoComponent implements OnInit {

  constructor(private cookies : CookieService) { }

  cartSize$ = new BehaviorSubject<number>(0);
  loggedInUser$ = new BehaviorSubject<string>('');

  ngOnInit() {
    interval(500).subscribe(x=>{
      this.getCartValue();
      this.getLoggedInUser();
    });

  }

  getCartValue(){
    let cart = this.cookies.get("DECART");
    let size = (cart && cart != 'empty') ? cart.split('|').length : 0;
    this.cartSize$.next(size);
  }

  getLoggedInUser(){
    let user = this.cookies.get("NTAccount");
    this.loggedInUser$.next(user);
  }

}
