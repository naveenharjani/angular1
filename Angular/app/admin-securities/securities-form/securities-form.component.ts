import { Component, OnInit, Inject, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from '../../shared/data.service';
import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { BeehivePageHeaderComponent } from '../../beehive-page-header/beehive-page-header.component';
import { Role } from '../../beehive-page-header/permissions.enums';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BeehiveCookiesService } from '../../shared/cookies.service';

@Component({
  selector: 'app-securities-form',
  templateUrl: './securities-form.component.html',
  styleUrls: ['./securities-form.component.css']
})
export class SecuritiesFormComponent implements OnInit {

  @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
  header: string;
  securitiesForm: FormGroup;
  securitiesFormData: any = {};
  keys: any = [];
  isPrimaryData: any = [];
  orderNumberData: any = [1, 2, 3, 4, 5, 6, 7, 8];
  tickerTypeData: any = [{ Value: 'STOCK', Display: 'STOCK' }, { Value: 'INDEX', Display: 'INDEX' }];
  typeData: any = [{ Value: 1, Display: 'Bernstein' }, { Value: 2, Display: 'Autonomous' }];
  companyID: any = -1;
  childComponent: BeehivePageHeaderComponent;
  beehivePageName: string;
  labelPosition = 'before';
  companyTickerMappings = [];

  constructor(private formBuilder: FormBuilder, public dialogRef: MatDialogRef<SecuritiesFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
    private dataService: DataService, private resolver: ComponentFactoryResolver, private cookiesService: BeehiveCookiesService) { }

  ngOnInit() {
    this.createForm();
    this.fetchData();
  }


  ngAfterContentInit() {
    let factory = this.resolver.resolveComponentFactory(BeehivePageHeaderComponent);
    let component = this.container.createComponent(factory);
    this.childComponent = component.instance;

    this.childComponent.beehivePageName = `Security Administration`;
    this.dataService.IsInRole(Role.deAdministrator).subscribe((val) => val ? this.childComponent.buttonList = [{ text: 'Close' }, { text: 'Save' }, { text: 'New' }] : this.childComponent.buttonList = [{ text: 'Close' }]);
    this.childComponent.isPopUp = true;

    this.childComponent.onButtonClick.subscribe((buttonText: any) => {
      if (buttonText === 'save') {
        this.save();
      }
      else if (buttonText === 'close') {
        this.close();
      }
      else if (buttonText === 'new') {
        this.newTickertoSameCompany();
      }
    })

  }

  fetchCompanyData() {
    alert('Are you sure you want to re-align Security under another Company?');
    this.dataService.getCompanySecurities(this.securitiesForm.controls.companies.value).subscribe((data: any) => {
      if (data) {
        this.securitiesForm && this.securitiesForm.patchValue({
          company: data[0].Company,
          companySecurities: data[0].Company
        });
        this.companyID = data[0].CompanyId;
        this.companyTickerMappings = [];
        data.forEach((company: any) => {
          this.addTickerList(company);
        });
        this.primaryDataChange();
      }
    });

  }

  fetchData() {
    this.dataService.getSecurity(this.data.securityID).subscribe((data: any) => {
      if (data) {
        this.companyTickerMappings = [];
        this.securitiesFormData.companies = data[1];
        this.securitiesFormData.exchanges = data[2];
        this.securitiesFormData.currencies = data[3];
        this.securitiesFormData.indexes = data[4];
        this.securitiesFormData.countries = data[5];
        this.securitiesFormData.regions = data[6];
        this.securitiesFormData.gics = data[7];
        this.securitiesFormData.companySecurities = data[8] !== null ? data[8].CompanyData : [];
        this.securitiesFormData.securityData = data[8] !== null ? data[8] : {};
        //this.securitiesFormData.usageCount = data[8].usageCount;

        this.securitiesFormData && this.securitiesFormData.companySecurities[0] ? this.keys = Object.keys(this.securitiesFormData.companySecurities[0]) : [];
        this.patchData();
        this.isPrimaryData = [{ Value: '1', Display: 'YES' }, { Value: '2', Display: 'NO' }];
      }
    });
  }

  get tickerList(): FormGroup {
    return this.formBuilder.group({
      isPrimary: "",
      orderNumber: "",
      securityID: "",
      ticker: ""
    });
  }

  addTickerList(companyTickerMapping: any) {
    //(this.securitiesForm.get("tickerList") as FormArray).push(this.tickerList);
    this.companyTickerMappings.push(companyTickerMapping);
  }

  createForm() {
    this.securitiesForm = this.formBuilder.group({
      companies: new FormControl(''),
      company: new FormControl(''),
      tickerList: this.formBuilder.array([this.tickerList]),
      tickerType: new FormControl(''),
      companySecurities: new FormControl({ value: '', disabled: true }),
      alias: new FormControl(''),
      bloomberg: new FormControl(''),
      ric: new FormControl(''),
      cusip: new FormControl({ value: '', disabled: true }),
      sedol: new FormControl({ value: '', disabled: true }),
      cins: new FormControl({ value: '', disabled: true }),
      isin: new FormControl({ value: '', disabled: true }),
      valoren: new FormControl({ value: '', disabled: true }),
      exchange: new FormControl(''),
      currency: new FormControl({ value: '', disabled: true }),
      benchmarkIndex: new FormControl({ value: '', disabled: true }),
      country: new FormControl({ value: '', disabled: true }),
      region: new FormControl({ value: '', disabled: true }),
      subIndustry: new FormControl(''),
      active: new FormControl(''),
      mobile: new FormControl(''),
      type: new FormControl('')
    })
  }

  patchData(type?: string) {
    this.bindForm(type);
    if (type === undefined && type !== 'newCompany' && this.securitiesFormData.securityData) {
      this.securitiesFormData.companySecurities.forEach((element: any) => {
        this.addTickerList(element);
      });
      this.companyID = this.securitiesFormData.CompanyId;
    }
  }

  bindForm(type?: string) {
    this.securitiesForm && this.securitiesForm.patchValue({
      tickerType: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.TickerType : -1,
      companySecurities: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.Company : '',
      alias: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.Alias : '',
      bloomberg: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.Ticker : '',
      ric: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.RIC : '',
      cusip: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.CUSIP : '',
      sedol: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.SEDOL : '',
      cins: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.CINS : '',
      isin: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.ISIN : '',
      valoren: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.VALOREN : '',
      exchange: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.ExchangeCode : -1,
      currency: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.CurrencyCode : -1,
      benchmarkIndex: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.BenchmarkIndex : -1,
      country: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.CountryCode : -1,
      region: this.securitiesFormData.securityData ? this.securitiesFormData.securityData.RegionId : -1,
      subIndustry: this.securitiesFormData.securityData ? (this.securitiesFormData.securityData.GICS_ID !== null ? this.securitiesFormData.securityData.GICS_ID : -1) : -1,
      active: (this.securitiesFormData.securityData && this.securitiesFormData.securityData.IsActive && this.securitiesFormData.securityData.IsActive === -1) ? true : false,
      mobile: (this.securitiesFormData.securityData && this.securitiesFormData.securityData.MobileStatus && this.securitiesFormData.securityData.MobileStatus === 1) ? true : false,
      type: (this.securitiesFormData.securityData && this.securitiesFormData.securityData.TypeId) ? this.securitiesFormData.securityData.TypeId : 1,
      companies: this.securitiesFormData.securityData.CompanyId,
      company: this.securitiesFormData.securityData.Company
    });
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.primaryDataChange();
    let security = {
      SecurityId: this.data.securityID,
      TickerType: this.securitiesForm.controls['tickerType'].value,
      Company: this.securitiesForm.controls['company'].value,
      Ticker: this.securitiesForm.controls['bloomberg'].value,
      RIC: this.securitiesForm.controls['ric'].value,
      CUSIP: this.securitiesForm.controls['cusip'].value,
      SEDOL: this.securitiesForm.controls['sedol'].value,
      CINS: this.securitiesForm.controls['cins'].value,
      ISIN: this.securitiesForm.controls['isin'].value,
      VALOREN: this.securitiesForm.controls['valoren'].value,
      ExchangeCode: this.securitiesForm.controls['exchange'].value === '-1' ? null : this.securitiesForm.controls['exchange'].value,
      CurrencyCode: this.securitiesForm.controls['currency'].value,
      BenchmarkIndex: this.securitiesForm.controls['benchmarkIndex'].value,
      CountryCode: this.securitiesForm.controls['country'].value,
      RegionId: this.securitiesForm.controls['region'].value,
      IsActive: this.securitiesForm.controls['active'].value === true ? (-1 * -1) : 0,
      MobileStatus: this.securitiesForm.controls['mobile'].value === true ? (-1 * -1) : 0,
      Editor: this.cookiesService.GetUserID(),
      GICS_ID: (this.securitiesForm.controls['subIndustry'].value === undefined || this.securitiesForm.controls['subIndustry'].value === null ||
       this.securitiesForm.controls['subIndustry'].value === 0) ? -1 : this.securitiesForm.controls['subIndustry'].value,
      Alias: this.securitiesForm.controls['alias'].value,
      CompanyId: this.securitiesForm.controls['companies'].value ? this.securitiesForm.controls['companies'].value : -1,
      TypeId: this.securitiesForm.controls['type'].value,
      CompanyData: this.companyTickerMappings
    }
    if (this.securitiesForm.valid) {
      this.dialogRef.close({ formData: security });
    }
  }

  newCompany() {
    this.securitiesFormData.securityData = [];
    this.patchData('newCompany')
  }

  primaryDataChange() {
    if (this.companyTickerMappings.length > 0) {
      this.companyTickerMappings[0].IsPrimary = 'Y';
      this.companyTickerMappings.forEach((data, index) => {
        if (index > 0) {
          data['IsPrimary'] = 'N';
        }
      });
      let companyTickerMappings = [];
      this.companyTickerMappings.forEach((data, index) => {
        let companyTickerMapping = {};
        companyTickerMapping['IsPrimary'] = data.IsPrimary;
        companyTickerMapping['OrdNo'] = (index + 1);
        companyTickerMapping['SecurityId'] = data.SecurityId;
        companyTickerMapping['Ticker'] = data.Ticker;
        companyTickerMapping['CompanyId'] = data.CompanyId;
        companyTickerMapping['Company'] = data.Company;
        companyTickerMappings.push(companyTickerMapping);
      });
      this.companyTickerMappings = [];
      this.companyTickerMappings = companyTickerMappings;
    }
  }


  drop(event: CdkDragDrop<any>) {
    moveItemInArray(this.companyTickerMappings, event.previousIndex, event.currentIndex);
    this.primaryDataChange();
  }

  refreshData(row: any) {
    this.data.securityID = row.SecurityId;
    this.fetchData();
  }

  newTickertoSameCompany() {
    let currentCompany = {
      companies: this.securitiesFormData.securityData.CompanyId,
      company: this.securitiesFormData.securityData.Company
    }
    this.securitiesForm.reset();
    this.securitiesForm && this.securitiesForm.patchValue({
      companies: currentCompany.companies,
      company: currentCompany.company
    });
    this.data.securityID = -1;
  }

}
