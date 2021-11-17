import { Component, OnInit, Inject, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from './../../../app/shared/data.service'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BeehiveCookiesService } from '../../shared/cookies.service';
import { BeehivePageHeaderComponent } from '../../beehive-page-header/beehive-page-header.component';
import { Role } from '../../beehive-page-header/permissions.enums';

@Component({
  selector: 'app-industry-form',
  templateUrl: './industry-form.component.html',
  styleUrls: ['./industry-form.component.css']
})
export class IndustryFormComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  industryID: number = 0;
  header: string;
  industryForm: FormGroup;
  types: any[] = [{ Value: 'Y', Display: 'Research' }, { Value: 'N', Display: 'Non-Research' }, { Value: '*', Display: 'Both' }];
  labelPosition = 'before';
  reportUsage: number;
  lastSavedBy: string;
  lastSavedOn: string;
  industries: any;
  sectors: any;
  childComponent: BeehivePageHeaderComponent;
  beehivePageName: string;

  constructor(private dataService: DataService, private formBuilder: FormBuilder, public dialogRef: MatDialogRef<IndustryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private cookiesService: BeehiveCookiesService, private resolver: ComponentFactoryResolver) { }

  ngOnInit() {
    this.industryID = this.data.id;
    this.createForm();
    this.getIndustryData(this.industryID);
  }

  ngAfterContentInit() {
    let factory = this.resolver.resolveComponentFactory(BeehivePageHeaderComponent);
    let component = this.container.createComponent(factory);
    this.childComponent = component.instance;
    this.childComponent.beehivePageName = `Industry Administration`;
    this.dataService.IsInRole(Role.deAdministrator).subscribe((val) => val ? this.childComponent.buttonList = [{ text: 'Close' }, { text: 'Save' }] : this.childComponent.buttonList = [{ text: 'Close' }]);
    this.childComponent.isPopUp = true;

    this.childComponent.onButtonClick.subscribe((buttonText: any) => {
      if (buttonText === 'save') {
        this.save();
      }
      else if (buttonText === 'close') {
        this.close();
      }
    })

  }


  close() {
    this.dialogRef.close();
  }

  createForm() {
    this.industryForm = this.formBuilder.group({
      industry: new FormControl('', [Validators.required]),
      sector: new FormControl('', [Validators.required]),
      type: new FormControl('')
    });
  }

  getIndustryData(id: number) {
    if (id) {
      this.dataService.getIndustry(id).subscribe((data: any) => {
        if (data) {
          this.industries = data[0];
          this.sectors = data[1];
          //this.reportUsage = data[2].reportUsageCount[0].length > 0 ? data[2].reportUsageCount[0].ReportUsage : '';
          this.lastSavedBy = id !== -1 ? data[2].UserName : '';
          this.lastSavedOn = id !== -1 ? data[2].EditDate : '';
          this.patchForm(data[2]);
        }
      });
    }
  }


  patchForm(data: any) {
    this.industryForm.patchValue({
      industry: data.Industry ? data.Industry : '',
      sector: data.Industry ? data.SectorId : -1,
      type: data.Industry ? data.IsResearch : ''
    });
    this.industryID = data.Industry ? data.IndustryId : -1;
  }

  save() {
    let industryObj = {
      IndustryId: this.industryID > 0 ? this.industryID : -1,
      Industry: this.industryForm && this.industryForm.controls['industry'].value ? this.industryForm.controls['industry'].value : '',
      SectorId: this.industryForm && this.industryForm.controls['sector'].value ? this.industryForm.controls['sector'].value : '',
      IsResearch: this.industryForm && this.industryForm.controls['type'].value ? this.industryForm.controls['type'].value : '',
      Editor: this.cookiesService.GetUserID(),
      //reportUsageCount: this.reportUsage
    }
    if (this.industryForm.valid) {
      this.dialogRef.close({ formData: industryObj });
    }
  }
}
