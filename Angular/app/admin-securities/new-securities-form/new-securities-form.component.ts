import { Component, OnInit, Inject, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from '../../shared/data.service';
// import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { BeehivePageHeaderComponent } from '../../beehive-page-header/beehive-page-header.component';
// import { Role } from '../../beehive-page-header/permissions.enums';
// import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BeehiveCookiesService } from '../../shared/cookies.service';
import { ColDef, ColGroupDef, GridOptions, GridApi, RowDragEvent } from 'ag-grid-community';

@Component({
  selector: 'app-new-securities-form',
  templateUrl: './new-securities-form.component.html',
  styleUrls: ['./new-securities-form.component.css']
})
export class NewSecuritiesFormComponent implements OnInit {
  header: string;
  // securitiesForm: FormGroup;
  // securitiesFormData: any = {};
  keys: any = [];
  isPrimaryData: any = [];
  orderNumberData: any = [1, 2, 3, 4, 5, 6, 7, 8];
  tickerTypeData: any = [{ Value: 'STOCK', Display: 'STOCK' }, { Value: 'INDEX', Display: 'INDEX' }];
  type: any = [{ Value: 1, Display: 'Bernstein' }, { Value: 2, Display: 'Autonomous' }];
  companyID: any = -1;
  childComponent: BeehivePageHeaderComponent;
  beehivePageName: string;
  labelPosition = 'before';
  companyTickerMappings = [];
  securityData:any;
  
  columnDefs: (ColDef | ColGroupDef)[];
  style: { width: string, height: string, theme: string };
  //style:{ width: '80%',height:'210px', theme: 'ag-theme-balham my-grid' };
  gridOptions: GridOptions;
  gridApi: GridApi;
  gridColumnApi;
  gridName: string = 'Securities';
  frameworkComponents: any;
  buttonList = [{ text: 'Close'},{text:'Save' }];

securityId:any;
  companies:any;
  exchanges:any; 
  currencies:any;
  indexes:any;
  countries:any;
  regions:any;
  gics:any;
  companySecurities:any;


  selectedCompany:any;
  selectedCompanyName:any;
  selectedSecurity:any;
  selectedTickerList:any;
  selectedTickerType:any;
  selectedCompanySecurities:any;
  selectedAlias:any;
  selectedBloomberg:any;
  selectedRIC:any;
  selectedCusip:any;
  selectedSedol:any;
  selectedCINS:any;
  selectedISIN:any;
  selectedValoren:any;
  selectedExchange:any;
  selectedCurrency:any;
  selectedBenchmarkIndex:any;
  selectedCountry:any;
  selectedRegion:any;
  selectedSubIndustry:any;
  selectedActive:any;
  selectedMobile:any;
  selectedType:any;

  isDisabled:boolean=false;
 



  constructor( public dialogRef: MatDialogRef<NewSecuritiesFormComponent>, @Inject(MAT_DIALOG_DATA) public data: any,
  private dataService: DataService, private resolver: ComponentFactoryResolver, private cookiesService: BeehiveCookiesService) {
    console.log(this.data);
    this.securityId = this.data.securityID;
   // this.selectedCompany = this.data.companyID;
   }

  ngOnInit() {
    this.fetchData();
   // this.createForm();
   this.bindForm('') ;
   this.gridCustomize();
    this. buttonList = [{ text: 'Close'},{text:'Save' }];
  }

// get tickerList(): FormGroup {
//     return this.formBuilder.group({
//       isPrimary: "",
//       orderNumber: "",
//       securityID: "",
//       ticker: ""
//     });
//   }

  fetchData() {
    this.dataService.getSecurityScreenPickLists(this.securityId).subscribe((data: any) => {
      if (data) {
          this.companyTickerMappings = [];
          this.companies = data.Companies;
          this.exchanges = data.Exchanges;
          this.currencies = data.Currencies;
          this.indexes = data.Indexes;
          this.countries = data.Countries;
          this.regions = data.Regions;
          this.gics = data.GICS;
          this.companySecurities = data.SecurityCompanies !== null ? data.SecurityCompanies : [];
      }
    });
   
  }

  patchData(type: string) {
   // this.bindForm(type);
    if (type === undefined && type !== 'newCompany' ) {
      this.companySecurities.forEach((element: any) => {
        this.addTickerList(element);
      });
      //this.companyID = this.selectedCompany;
    }
  }

  bindForm(type: string) {
this.dataService.getCompanyDetailsBySecurity(this.securityId).subscribe((data: any) => {
      if (data) {
          this.selectedCompany = data.CompanyId;
          this.selectedCompanyName = data.Company;
          this.selectedTickerType = data.TickerType;
          this.companySecurities = data.Company;
          this.selectedAlias = data.Alias;
          this.selectedBloomberg = data.Ticker;
          this.selectedRIC = data.RIC;
          this.selectedCusip = data.CUSIP;
          this.selectedSedol = data.SEDOL;
          this.selectedCINS = data.CINS;
          this.selectedISIN = data.ISIN;
          this.selectedValoren = data.VALOREN;
          this.selectedExchange = data.ExchangeCode;
          this.selectedCurrency = data.CurrencyCode;
          this.selectedBenchmarkIndex = data.BenchmarkIndex;
          this.selectedCountry = data.CountryCode;
          this.selectedRegion = data.RegionId;
          this.selectedSubIndustry = data.GICS_ID;
          this.selectedActive = data.IsActive;
          this.selectedMobile = data.MobileStatus;
          this.selectedType = data.TypeId;

          this.fetchCompanyData(this.selectedCompany);
      } 
    });
  }

  close() {
    this.dialogRef.close();
  }

  addTickerList(companyTickerMapping: any) {
    //(this.securitiesForm.get("tickerList") as FormArray).push(this.tickerList);
    this.companyTickerMappings.push(companyTickerMapping);
  }
  // drop(event: CdkDragDrop<any>) {
  //   moveItemInArray(this.companyTickerMappings, event.previousIndex, event.currentIndex);
  //   this.primaryDataChange();
  // }

  refreshData(row: any) {
    this.data.securityID = row.SecurityId;
    this.fetchData();
  }

  newTickertoSameCompany() {
    // let currentCompany = {
    //   companies: this.securitiesFormData.securityData.CompanyId,
    //   company: this.securitiesFormData.securityData.Company
    // }
    // this.securitiesForm.reset();
    // this.securitiesForm && this.securitiesForm.patchValue({
    //   companies: currentCompany.companies,
    //   company: currentCompany.company
    // });
    this.data.securityID = -1;
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

  onChange(control:string,$event:any) {  
    console.log("onChange",$event.Value);
    if($event.Value != undefined && $event.Value != null)
     {  
     switch (control) {    
       case 'Company':
         console.log("condition true", $event.Value);
        alert('You are re-aligning the security under another Company');
          this.fetchCompanyData(null);
       break;  
       
       default:
         break;
     }
     }
   }

  fetchCompanyData(companyID:any) {
    if (this.selectedCompany != null){
     this.dataService.getCompanySecurities(this.selectedCompany).subscribe((data: any) => {
       if (data) {
         this.securityData = data;
         this.setGridHeight();
         this.gridApi && this.gridApi.setRowData(this.securityData);
         this.gridCustomize();
         this.selectedCompany = this.securityData[0].CompanyId;
         this.selectedCompanyName = this.securityData[0].Company;
       }
     });
    }
   }


setGridHeight(){
  let rows = this.securityData ? this.securityData.length : 1;
  let height= 0;
  switch(rows){
    case 7:
      height = rows*35;
      break;
    case 6:
      height = rows*35;
      break;
    case 5:
      height = rows*36;
      break;
    case 4:
      height = rows*37;
      break;
    case 3:
      height = rows*41;
      break;
    case 2:
      height = rows*48;
      break;
    case 1:
      height = rows*65;
      break;
    default:
      height = rows*40;
      break;
  }
  this.style = { width: '100%',height:height + 'px', theme: 'ag-theme-balham my-grid' };
}

gridCustomize(){
  var self = this;
  this.gridOptions = <GridOptions>{
    context: { componentParent: this },
    floatingFilter: false,
    suppressContextMenu:true,
    rowDragManaged:true,
    suppressMoveWhenRowDragging:true,
    colWidth:110,
    animateRows:true,
    enableSorting:false,
    onRowDragEnd: (event) => {
      this.reOrderSecurityData(event);
    },    
  }
  this.columnDefs = [    
      { headerName: 'OrdNo', field: 'OrdNo',  rowDrag:true, suppressSorting:true} ,   
      { headerName: 'Security ID', field: 'SecurityId' },
      { headerName: 'Ticker', field: 'Ticker', width:150 },
      { headerName: 'Is Primary', field: 'IsPrimary'}      
  ]

  //this.frameworkComponents = {checkboxRenderer:NormalCheckboxRendererComponent }
}

reOrderSecurityData(event: RowDragEvent){
  const currentRowIndex = Number(event.node.data.OrdNo)-1;
  const newRowIndex = event.overIndex;
  const currentGridData = this.securityData;
  this.swapRow(currentGridData,currentRowIndex,newRowIndex);
  for(var i = 0; i < currentGridData.length; i++) {
    var obj = currentGridData[i];
    if (i==0){
      obj.IsPrimary = "Y";
    }
    else{
      obj.IsPrimary = "N";
    }
    obj.OrdNo = i+1;
}
 this.securityData = currentGridData.sort(this.sortByProperty("OrdNo"));
 this.gridApi && this.gridApi.setRowData(this.securityData);
 this.gridCustomize();
}

swapRow(input, index_A, index_B) {
  [input[index_A], input[index_B]] = [input[index_B], input[index_A]]
  return input;
}

sortByProperty(property){  
  return function(a,b){  
     if(a[property] > b[property])  
        return 1;  
     else if(a[property] < b[property])  
        return -1;  
 
     return 0;  
  }  
}

onButtonClick(text: any) {
  console.log(text);
  if (text === 'save') {
    this.save();
  }
  if (text === 'close') {
   
      this.dialogRef.close();
  }
    
  }

  save() {
    this.primaryDataChange();
    let security = {
      SecurityId: this.data.securityID,
      TickerType: this.selectedTickerType,
      Company: this.selectedCompanyName,
      Ticker: this.selectedBloomberg,
      RIC: this.selectedRIC,
      CUSIP: this.selectedCusip,
      SEDOL: this.selectedSedol,
      CINS: this.selectedCINS,
      ISIN: this.selectedISIN,
      VALOREN: this.selectedValoren,
      ExchangeCode: this.selectedExchange,
      CurrencyCode: this.selectedCurrency,
      BenchmarkIndex: this.selectedBenchmarkIndex,
      CountryCode: this.selectedCountry,
      RegionId: this.selectedRegion,
      IsActive: this.selectedActive,
      MobileStatus: this.selectedMobile,
      Editor: this.cookiesService.GetUserID(),
      GICS_ID: this.selectedSubIndustry,
      Alias: this.selectedAlias,
      CompanyId: this.selectedCompany,
      TypeId: this.selectedType,
      CompanyData: this.companyTickerMappings
    }

    console.log(security);
    
      this.dialogRef.close({ formData: security });
    
  }

}
