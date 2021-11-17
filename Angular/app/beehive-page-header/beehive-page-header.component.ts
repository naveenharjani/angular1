import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ButtonProperties, Role } from './permissions.enums';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-beehive-page-header',
  templateUrl: './beehive-page-header.component.html',
  styleUrls: ['./beehive-page-header.component.css']
})
export class BeehivePageHeaderComponent {

  buttons: ButtonProperties[];
  @Input() isPopUp: any;
  @Input() set buttonList(value: ButtonProperties[]) {
    if (value) {
      this.buttons = [];
      let buttonsList = value;
      buttonsList.forEach((button: ButtonProperties) => {
        if (button.isRoleNeeded && this.dataService.IsInRole(Role.deAdministrator)) {
          this.buttons.push(button);
        }
        else if (!button.isRoleNeeded) {
          this.buttons.push(button);
        }
      });
    }
  };
  @Input() set componentList(value: any) {
    console.log(value);
  }
  @Input() beehivePageName: any;
  @Output() public onButtonClick = new EventEmitter<any>();
  ref: any;

  constructor(private cookieService: BeehiveCookiesService, private dataService: DataService) { this.buttons = []; }

  onClick(event: any) {
    let buttonText = event.target.innerText.toLowerCase();
    this.onButtonClick.emit(buttonText);
  }

}
