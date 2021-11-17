import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { BeehiveMessageService } from '../shared/message-service';

@Component({
  selector: 'app-beehive-footer',
  templateUrl: './beehive-footer.component.html',
  styleUrls: ['./beehive-footer.component.css']
})
export class BeehiveFooterComponent implements OnInit {
  currentDate = new Date();
  clientIPAddress: string = '';
  showComponent: boolean = true;
  constructor(private dataService: DataService, private service: BeehiveMessageService) { }

  ngOnInit() {
    this.service.currentMessage.subscribe((data: any)=>{
      if(data){
        if(data.hide){
          this.showComponent = false;
        }
      }
    })
    
  }
 
}
