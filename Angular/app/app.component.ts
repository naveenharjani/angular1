import { Component, HostListener } from '@angular/core';
import { BeehiveCookiesService } from './shared/cookies.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'beehive-root',
    templateUrl: './app.component.html',
    styles: []
})
export class AppComponent {
    title = 'Beehive App';
    public innerHeight: any;    
    constructor(private cookiesService: BeehiveCookiesService, private router: Router, private activatedRoute: ActivatedRoute) { }

    ngOnInit() {
        this.innerHeight = window.innerHeight;
        this.innerHeight = (this.innerHeight - 150) + 'px';
        console.log('Logged in User is :- ', + this.cookiesService.GetUserID());
        if (Number.isNaN(parseInt(this.cookiesService.GetUserID()))) {

            let relative_path = window.location.pathname+window.location.hash+window.location.search;
            console.log(relative_path);
            //window.location.href = "/auth.asp?"+relative_path;
        }
       
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        console.log(this.innerHeight);
    }
}
