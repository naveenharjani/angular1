import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, SecurityContext } from '@angular/core';
import { BeehivePageHeaderComponent } from '../beehive-page-header/beehive-page-header.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from '../shared/data.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { MatSnackBar } from '@angular/material';
import { EnvService } from '../../env.service';
import { BeehiveMessageService } from '../shared/message-service';
declare var ActiveXObject: (type: string) => void;
@Component({
  selector: 'app-email-form',
  templateUrl: './email-form.component.html',
  styleUrls: ['./email-form.component.css']
})
export class EmailFormComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  @ViewChild('outlookintegration', { read: ViewContainerRef }) outlookintegration: ViewContainerRef;
  childComponent: BeehivePageHeaderComponent;
  emailBody: any;
  distributionList: any[] = [];
  itemType: string = '';
  itemId: string;
  showEditor: boolean;
  mailText: string = "";
  mailType: any;
  attachmentsEmailBody: any;
  rowData: any;
  userID: string;

  constructor(private service: BeehiveMessageService, private resolver: ComponentFactoryResolver, private sanitizer: DomSanitizer, private dataService: DataService,
    private formBuilder: FormBuilder, private route: ActivatedRoute, private cookieService: BeehiveCookiesService, private snackBar: MatSnackBar, private environment: EnvService) { }

  currentDate = new Date();
  distributionGroupForm: FormGroup;


  ngOnInit() {
    this.service.changeMessage({ 'hide': true });
    this.createForm();
    this.route.queryParams.subscribe(val => {
      if (val.style == '1') {
        this.showEditor = false;
      }
      else {
        this.showEditor = true;
      }
      if (val && val.type && val.id && val.mailType) {
        this.itemType = val.type;
        this.itemId = val.id;
        this.mailType = val.mailType;
        if (this.mailType === '3') {
          this.dataService.getCart(val.id).subscribe((data: any) => {
            if (data) {
              this.rowData = data.filter((data: any) => data.Type === 'research');
              let htmlBody = ' &nbsp &nbsp Summary of Attachment(s):';
              this.rowData.forEach((element: any) => {
                htmlBody = htmlBody + '<br /> &nbsp &nbsp ' + (val.id) + '_' + element.FileName + '-' + element.Title;
              });
              this.emailBody = htmlBody;
            }
          });
        }
        else {
          this.userID = val.mailType;
          this.dataService.getEmailBody(val.type, val.id).subscribe(
            (val) => {
              if (!this.showEditor) {
                this.emailBody = this.sanitizer.bypassSecurityTrustHtml(val);
              }
              else {
                this.emailBody = val.toString();
                console.log(this.emailBody);
              }
            },
            (err) => {
              if (this.itemId.indexOf(',') > 0) {
                this.emailBody = err.error.text;
              }
            },
            () => console.log('HTTP request completed.')

          );
        }
        if (this.itemType === 'cart') {
          this.getDistributionList(this.itemId);
        }
        else {
          this.getDistributionList(this.mailType);
        }
      }
    });

  }

  getDistributionList(userID: any) {
    this.dataService.getDistributionList(userID).subscribe((val) => {
      if (val) {
        let result = val.distributionList;
        result = JSON.parse(result);
        result.forEach((element: any) => {
          let item = element.split(';');
          this.distributionList.push({ Value: item[0], Display: item[1] });
        });
      }
    });
  }

  createForm() {
    this.distributionGroupForm = this.formBuilder.group({
      distributionGroups: new FormControl('', Validators.required),
      subject: new FormControl('', Validators.required)
    })
  }

  removeChip(value: any, control: string) {
    let deletedValue = this.distributionGroupForm.controls[control].value;
    if (control === 'distributionGroups')
      deletedValue = deletedValue.filter((data: any) => data.Value !== value.Value);
    this.distributionGroupForm.controls[control].setValue(deletedValue);
  }

  ngAfterContentInit() {
    let factory = this.resolver.resolveComponentFactory(BeehivePageHeaderComponent);
    let component = this.container.createComponent(factory);
    this.childComponent = component.instance;
    this.childComponent.beehivePageName = 'EMAIL';
    if (!this.showEditor) {
      this.childComponent.buttonList = [{ text: 'Close', isRoleNeeded: false }, { text: 'Copy to Outlook', isRoleNeeded: false }];
    }
    else {
      this.childComponent.buttonList = [{ text: 'Queue', isRoleNeeded: false }];
    }
    this.childComponent.onButtonClick.subscribe((buttonText: any) => {
      if (buttonText === 'queue') {
        this.queue();
      }
      if (buttonText === 'close') {
        window.close();
      }
      if (buttonText === 'copy to outlook') {
        if (this.mailType === '3') {
          let filesNames = '';
          this.rowData.forEach((element: any) => {
            filesNames = filesNames + element.FileName + '-';
          });
          filesNames = filesNames.substring(0, filesNames.length - 1);
          this.dataService.impersonate(filesNames, this.itemId).subscribe((data) => {
            this.goEmail(this.mailType);
          });
        }
        else {
          this.goEmail(this.mailType);
        }
      }
    })
  }

  goEmail(mailType: any) {
    try {
      let emailList = '';
      this.distributionGroupForm.controls.distributionGroups.value ? this.distributionGroupForm.controls.distributionGroups.value.map((data: any) => data.Display).forEach((data: any) => emailList = emailList + data + ',')
        : [] ;
      emailList = emailList.substring(0, emailList.length - 1);
      var oApp = new ActiveXObject("Outlook.Application");
      var oMailItem = oApp.CreateItem(0);
      oMailItem.To = emailList === '' ? 'Replace with analyst email address when ready to send...' : emailList;
      oMailItem.Subject = 'BERNSTEIN RESEARCH * ' + this.distributionGroupForm.controls['subject'].value;
      if (mailType !== '3') {
        oMailItem.HTMLBody = this.emailBody.changingThisBreaksApplicationSecurity;
      }
      else {
        var path = this.environment.cartAttachmentsUrl;
        oMailItem.HTMLBody = this.emailBody;
        this.rowData.forEach((element: any) => {
          if (element.FileName.toUpperCase().indexOf('.PDF') != -1) { oMailItem.Attachments.Add(path + (this.itemId) + '_' + element.FileName); }
        });
      }
      oMailItem.Display();
      return true;
    }
    catch (_exception) {
      switch (_exception.number) {
        case -2146827859: // Automation server can't create object
          this.outlookintegration['style'].display = "block";
          return false;
          break;
        default:
          alert('Number:\t\t' + _exception.number + '\nMessage:\t\t' + _exception.message);
          return false;
      }
    }
  }

  queue() {
    if (this.distributionGroupForm.valid) {
      let payload = {
        itemId: this.itemId,
        itemType: this.itemType,
        userName: this.cookieService.GetUserID(),
        distributionGroups: this.distributionGroupForm.controls['distributionGroups'].value.map((data: any) => { return data.Value }).toString(),
        emailBody: this.emailBody,
        subject: this.distributionGroupForm.controls['subject'].value
      }
      this.dataService.queueEmail(payload).subscribe(() => {
        this.snackBar.open('Email Queued Successfully !!', 'Close', {
          duration: 2000
        });
      });
    }
    else {
      console.log('Form invalid. Please ensure Distribution List and Subject are not empty')
    }
  }

}
