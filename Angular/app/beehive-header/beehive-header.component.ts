
import { Component, OnInit, NgZone } from '@angular/core';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { EnvService } from '../../env.service';
import { DataService } from '../shared/data.service';
import { BeehiveMessageService } from '../shared/message-service';
import { first } from 'rxjs/operators';
import { AuthenticationService } from '../shared/services/authentication.service';
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'beehive-header',
  templateUrl: './beehive-header.component.html',
  styleUrls: ['./beehive-header.component.css'],
})
export class BeehiveHeaderComponent implements OnInit {
  navbarOpen = false;
  menuItems = this.environment.menuItems;
  bernsteinLogo = this.environment.bernsteinLogo;
  constructor(private dataService: DataService, private service: BeehiveMessageService, 
    private cookiesService: BeehiveCookiesService, private environment: EnvService,
    private authenticationService: AuthenticationService,
    private ngZone: NgZone,private http: HttpClient ) { }
 
  cartSize;
  loggedInUser = "";
  showComponent: boolean = true;
  cartArray = [];
  message: string = ''; 
  myTemplate: any = "";

  ngOnInit() {   
    this.service.currentMessage.subscribe((data: any) => {
      if (data) {
        if (data.hide) {
          this.showComponent = false;
        }
        if (data.itemAdded) {
          this.cartSize++;
          this.message = ' contains ' + this.cartSize + ' items';
          console.log(this.message);
        }
        if (data.itemRemoved) {
          this.cartSize--;
          this.message = ' contains ' + this.cartSize + ' items';
          console.log(this.message);
        }
        if (data.itemRemovedAll) {
          this.cartSize = 0;
          this.message = ' is empty';
          console.log(this.message);
        }
      }
    });
    if (this.cookiesService.GetUserID()) {
      this.dataService.getCart(this.cookiesService.GetUserID()).subscribe(
        (val) => {
          if (val) {
            this.cartSize = val.length;
            if (this.cartSize > 0) {
              this.message = ' contains ' + this.cartSize + ' items';
            }
            else if (this.cartSize == 0) {
              this.message = ' is empty';
            }
          }
        });
    }

    this.loggedInUser = this.cookiesService.GetLoggedInUser();

    // if(!this.loggedInUser){
    //   let relative_path = window.location.pathname+window.location.hash+window.location.search;
    //   console.log(relative_path);
    //   window.location.href = "/auth.asp?"+relative_path;
    // }

    window.my = window.my || {};
    window.my.namespace = window.my.namespace || {};
    window.my.namespace.updateCart = this.updateCart.bind(this);

    // this.cartSize = this.cookieService.GetCartItems().length;
    //Uncomment this when the research grid is in angular
    this.cookiesService.GetCartSubject().subscribe((cookies: string[]) => {
      this.cartSize = cookies.length;
    })

    this.readHtmlFile(false);
  }


  onMenuItemClick(url: string) {
    window.location.href = url;
    //this.router.navigate(['/beehive-route', {route : 'models'}]);
  }

  updateCart() {
    this.ngZone.run(() => this.updateCartPrivate());
  }
  updateCartPrivate() {
    // this.cartSize = this.cookieService.GetCartItems().length;
    this.cookiesService.UpdateCart();
    //   this.cookieService.GetCartSubject().subscribe((cookies: string[]) =>{
    //     this.cartSize = cookies.length;
    //     console.log(cookies);
    //     console.log("cookie lenght "+ cookies.length)
    //     console.log("cart size" + this.cartSize);
    //   })
    // }

  }

  navigateToCart() {
    window.open(this.environment.cartUrl, "_self");
    // let isProduction = this.cookiesService.GetEnvironment();
    // if (isProduction === 'YES') {
    //   this.router.navigate(['/cart']);
    // }
    // else {
    //   let url = '../research/cart.aspx';
    //   console.log(window.location.href + url);
    //   window.open(url, "_self");
    // }
  }
  
  refreshTokenCall(){
    this.authenticationService.refreshToken(this.cookiesService.GetUserID())
    .pipe(first())
    .subscribe(
        data => {
          this.getCartCall();
        },
        error => {
            console.log('error');
        });
  }
  getCartCall(){
    this.dataService.getCart(this.cookiesService.GetUserID()).subscribe(
      (val) => {
        if (val) {
          this.cartSize = val.length;
          if (this.cartSize > 0) {
            this.message = ' contains ' + this.cartSize + ' items';
          }
          else if (this.cartSize == 0) {
            this.message = ' is empty';
          }
        }
      });
  }

  private getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;
    for (let i: number = 0; i < caLen; i += 1) {
        c = ca[i].replace(/^\s+/g, '');
        if (c.indexOf(cookieName) == 0) {
            return c.substring(cookieName.length, c.length);
        }
    }
    return '';
}
private tokenExpired(ExpiryTime: Date) {
  const expiry = ExpiryTime;
  var today = new Date();
  return (today >= expiry);
}

private readHtmlFile(isAdmin){

  // location menuItems
  const url = window.location.protocol + "//" + window.location.hostname + this.environment.menuLocation;
  
  this.http
  .get(url,
       { responseType: 'text' })
  .subscribe(data => {
    var doc = new DOMParser().parseFromString(data, "text/html");
    let items = doc.getElementsByTagName('a');
    var actualRoles = this.cookiesService.GetRoleList().split(',');
    const isAdmin = actualRoles.indexOf("1")
    if (isAdmin == -1) {
    for(var i=0; i< items.length; i++){
        var item = items[i].getAttribute('role-group');      
        if (item != null){
          let roles = items[i].getAttribute('role-group').split(','); 
        let isExist=actualRoles.some(r=>roles.indexOf(r) >= 0);
         console.log("actualRoles:",JSON.stringify(actualRoles),'role-group:',JSON.stringify(roles), "isExist:",isExist);
         !isExist ?  items[i].classList.add('disabled-link') : null
        }
    }
  }
      this.myTemplate = doc.documentElement.innerHTML;
  }
);
}

toggleNavbar() {
  console.log("Navbar:",this.navbarOpen);
  this.navbarOpen = !this.navbarOpen;
}

}
