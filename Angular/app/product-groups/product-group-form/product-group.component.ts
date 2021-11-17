import { Component, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver, Inject } from '@angular/core';
import { MatSnackBar,MAT_DIALOG_DATA,MatDialogRef } from '@angular/material';
import { DataService } from '../../shared/data.service';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { BeehiveCookiesService } from '../../shared/cookies.service';
import { BeehivePageHeaderComponent } from '../../beehive-page-header/beehive-page-header.component';
import { Role } from '../../beehive-page-header/permissions.enums';
import { Router, ActivatedRoute } from '@angular/router';
import { BeehiveMessageService } from '../../shared/message-service';
import { DatePipe,DecimalPipe  } from '@angular/common';
import { CalendarUtility } from '../../shared/calendar-utility';

@Component({
  selector: 'app-product-group',
  templateUrl: './product-group.component.html',
  styleUrls: ['./product-group.component.css']
})
export class ProductGroupComponent implements OnInit {

  header: string;
  pageName:string = "Product Group";
  buttonList: { text: string; }[];

  productGroupID: number;
  productGroupForm: FormGroup;
  allPublications: any;
  allIndustries: any;
  allAnalysts: any;
  allTickers: any;

  selectedName:string;
  selectedDescription:string;
  selectedPublications: any;
  selectedIndustries:any;
  selectedAnalysts:any;
  selectedTickers:any;
  selectedDateRange:any=[];
  startDate:any;
  endDate:any;

  //childComponent: BeehivePageHeaderComponent;
  beehivePageName: string;
  isAdmin: boolean ;
  dialogInputProductGroupID:string;
  isDisabled:boolean=false;;

  form: FormGroup;
  calendarUtility: CalendarUtility = new CalendarUtility();



  constructor(private service: BeehiveMessageService, private snackBar: MatSnackBar, private cookiesService: BeehiveCookiesService, private router: Router,
    private formBuilder: FormBuilder, private route: ActivatedRoute, private dataService: DataService,
    private dialogRef:MatDialogRef<ProductGroupComponent>, @Inject(MAT_DIALOG_DATA) data, private datePipe:DatePipe) {
     
    this.dialogInputProductGroupID = data.productGroupId;

      
this.form = formBuilder.group({
  range:''
});


//updating selectedDateRange variable on form control value changes event
// this.form.controls.range.valueChanges.subscribe(changes => {
//      if (changes != undefined && changes.length > 15){
//        let dates = [];
//        changes.split(" to ").forEach(function (strDate) {
//         dates.push(new Date(strDate));
//       });
//       this.startDate = dates[0];
//       this.endDate = dates[1];
//      }
//    });   
 }
//  rangeClicked(range) {
//    console.log('[rangeClicked] range is : ', range);
//  }
//  datesUpdated(range) {
//    console.log('[datesUpdated] range is : ', range);
//  }




  ngOnInit() {
    // this.onWindowScroll();
   // this.route.queryParams.subscribe(val => {
      if (this.dialogInputProductGroupID) {
        this.productGroupID = Number(this.dialogInputProductGroupID);
        
      }
      else 
      {
        this.route.queryParams.subscribe(val => {
          console.log(val);
          this.productGroupID = val.id;
          this.service.changeMessage({ 'hide': true });
        });
      }
      this.getProductGroupData(this.productGroupID);

      this.dataService.IsInRole(Role.deAdministrator).subscribe((val) =>
          this.isAdmin = val

      );
      this.isAdmin ? this.buttonList = [{ text: 'Close' }, { text: 'Save' }] :this.buttonList =  [{ text: 'Close' }];
      this.isAdmin ? this.isDisabled = false : this.isDisabled = true;
  }
 
  onButtonClick(text: any) {
    if (text === 'save') {
      this.save();
    }
    if (text === 'close') {
      if (this.dialogInputProductGroupID != undefined && this.dialogInputProductGroupID!= '' ){
        this.dialogRef.close();
      }
      else{
        window.close();
      }
    }
  }

  getProductGroupData(id: number) {
    if (id) {
      this.dataService.getProductGroupData(id).subscribe((data) => {
        if (data) {
          //All items
         this.allPublications = data[0].sort(function (a, b) {
          return a.Display.localeCompare(b.Display);
        });
         this.allIndustries = data[1].sort(function (a, b) {
            return a.Display.localeCompare(b.Display);
          });

          this.allTickers = data[2];
          this.allAnalysts = data[3].sort(function (a, b) {
            return a.Display.localeCompare(b.Display);
          });

          //selected items
          const selectedItems = data[4];        
          this.updateDisableProperty(this.isAdmin); 

          this.selectedName = selectedItems ? selectedItems.Name :'';
          this.selectedDescription = selectedItems ? selectedItems.Description : '';
          this.selectedPublications = selectedItems.Types ? selectedItems.Types:[];
          this.selectedIndustries = selectedItems.Industries ? selectedItems.Industries:[];
          
          this.selectedTickers = selectedItems.Tickers? selectedItems.Tickers:[];
          
          this.selectedAnalysts=[];
            selectedItems.Analysts.forEach(val => {
              this.selectedAnalysts.push(this.allAnalysts.find(x=>x.Value==val.Value)); 
             });  

             this.selectedTickers=[];
             selectedItems.Tickers.forEach(val => {
               this.selectedTickers.push(this.allTickers.find(x=>x.Value==val.Value));               
              });           
             
        }
      });
    }
  }

updateDisableProperty(isAdmin){
  //Publications or Types
  this.allPublications.forEach(function(e){
    if (typeof e === "object" ){
      if(isAdmin){
        e["disabled"] = false;
      }else{
        e["disabled"] = true;
      }             
    }
  });
  //Industries
  this.allIndustries.forEach(function(e){
    if (typeof e === "object" ){
      if(!isAdmin){
        e["disabled"] = true;
      }else{
        e["disabled"] = false;
      }             
    }
  });

  this.allAnalysts.forEach(function(e){
    if (typeof e === "object"){
      if(!isAdmin){
        e["disabled"] = true;
      }else{
        e["disabled"] = false;
      }             
    }
  });

  this.allTickers.forEach(function(e){
    if (typeof e === "object" ){
      if(!isAdmin){
        e["disabled"] = true;
      }else{
        e["disabled"] = false;
      }             
    }
  });
}


  onChange(control:string,$event:any) {  
   if($event.length>0)
    {  
    switch (control) {    
      case 'Industries':
        this.selectedIndustries = $event;
      break;  
      case 'Analysts': 
         this.selectedAnalysts= $event;  
      break;
      case 'Tickers': 
        this.selectedTickers= $event; 
      break;  
      case 'Types':       
        this.selectedPublications= $event; 
      break;
      default:
        break;
    }
    }
  }
  save() {
    let productGroupModel = {

      Name: this.selectedName ? this.selectedName : null,

      Description: this.selectedDescription ? this.selectedDescription : null,
      
      Types: (this.selectedPublications && this.selectedPublications.length > 0) ? this.selectedPublications.map(({ Value, Display }) => ({ Value, Display })) : null,

      Industries: (this.selectedIndustries && this.selectedIndustries.length > 0) ? this.selectedIndustries.map(({ Value, Display }) => ({ Value, Display })) : null,

      Analysts: (this.selectedAnalysts && this.selectedAnalysts.length > 0) ? this.selectedAnalysts.map(({ Value, Display }) => ({ Value, Display })) : null,

      Tickers: (this.selectedTickers && this.selectedTickers.length > 0) ? this.selectedTickers.map(({ Value, Display }) => ({ Value, Display })) : null,

      Id: this.productGroupID
      
    }

    let productGroupID = productGroupModel.Id;
    this.dataService.saveProductGroups(productGroupModel, productGroupID).subscribe((data: any) => {
      if (data.StatusCode === 200) {
        this.snackBar.open(data.ReasonPhrase, 'Close', {
          duration: 2000
        });
      }
      if (data.StatusCode === 201) {
        this.snackBar.open(data.ReasonPhrase.split('with')[0].trim(), 'Close', {
          duration: 2000
        });
      }

      if (data.StatusCode === 500) {
        this.snackBar.open(data.ReasonPhrase, 'Close', {
          duration: 5000
        })
      }
    })
  }



}
