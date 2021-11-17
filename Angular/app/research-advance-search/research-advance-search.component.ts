import { Component, OnInit, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { DataService } from '../shared/data.service';
import { ColDef, ColGroupDef, GridOptions, GridApi, Module } from 'ag-grid-community';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { BeehiveMessageService } from '../shared/message-service';
import { TooltipTemplateComponent } from '../research/research-grid-templates/tooltip-template/tooltip-template.component';
import { DatePipe } from '@angular/common';
import { CalendarUtility } from '../shared/calendar-utility';
import { OptionsTemplateComponent } from '../research/research-grid-templates/options-template/options-template.component';
import { AgGridCheckboxComponent } from '../shared/checkbox-renderer/checkbox-renderer.component';
import { EnvService } from '../../env.service';
import { Router,ActivatedRoute } from '@angular/router';
import { MatDialog, MatDialogRef } from '@angular/material/dialog'; 
import { SaveQueryComponent } from '../research-advance-search/save-query.component';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { Role } from '../beehive-page-header/permissions.enums';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaveAsDialogComponent } from '../shared/save-as-dialog/save-as-dialog.component';
 
interface ActionItem {
  Category:string;
  CatSeqNo:string;
  Value:string;
  Display:string;
  ItemSeqNo:string;
}

@Component({
  selector: 'app-research-advance-search',
  templateUrl: './research-advance-search.component.html',
  styleUrls: ['./research-advance-search.component.css']
})
export class ResearchAdvanceSearchComponent implements OnInit {  
  private overlayNoRowsTemplate='Click on  \'Show Results\' button to view data'; // Custom grid overlay message
public paramSearchField:string[] = ['pubno','text','ticker','analyst']; // Field used for query string parameter search
maxDate = new Date();
QueryCreationDate=new Date();
message:any;
messageParam:any;
messageFront:any;
messageRear:any;
public show:boolean = false; 
UserId:string;
buttonList: { text: string; }[];
gridName: string = 'RESEARCH';
SearchRecordCount:string;
public showRecordCount:boolean = false;
selectedDateRange:string;
since:any;
until:any;
//Save Query
savedQueries: any[];
loggedInUser: string;
selectedQuery: any;
//DROPDOWN VARIABLES
SearchedTextValue="";
Tickers: any = [];
Industries: any = [];
Analysts: any = [];
Type:any=[];
SubType:any=[];
Keyword:any=[];
Investorthemes:any=[];
Thematictag:any=[];
Coverageaction:any=[];
Ratingaction:any=[];
Targetpriceaction:any=[];
Estimateaction:any=[];
ActionList: ActionItem[] = [];
eventPayload:Event[]=[];
Authors:any=[];
PubNo="";

selectedTickers: any[];
selectedIndustries: any[];
selectedAnalysts: any[];
selectedType: any[];
selectedSubType: any[];
selectedKeyword: any[];
selectedInvestorthemes: any[];
selectedThematictag: any[];
selectedCoverageaction: any[];
selectedRatingaction: any[];
selectedTargetpriceaction: any[];
selectedEstimateaction: any[];
selectedSearchText:any;
selectedPubNo:any;
selectedAction=[];
selectedActionChip:any[];
selectedAuthors: any[];
DefaultFilterValue:string;
//Grid
calendarUtility: CalendarUtility = new CalendarUtility();
rowData = [];
SearchrowData : any;
columnDefs: (ColDef | ColGroupDef)[];
style: { width: string, height: string, theme: string };
pageSize: any = '1000';
dataLoading: boolean = false;
gridApi: GridApi;
gridColumnApi;
frameworkComponents: any;
saveGridState:boolean=true;
cartArray: any;

AdvancedSearchParams = [];
searchText: string = null;
isAdmin: boolean;
isManager:boolean;
gridOptions = <GridOptions>{
  sideBar:{
    toolPanels: [
      {
        id: 'columns',
        labelDefault: 'Columns',
        labelKey: 'columns',
        iconKey: 'columns',
        toolPanel: 'agColumnsToolPanel',
        toolPanelParams: {
          suppressRowGroups: true,
          suppressValues: true,
          suppressPivots: true,
          suppressPivotMode: true,
          suppressSideButtons: true,
          suppressColumnFilter: true,
          suppressColumnSelectAll: true,
          suppressColumnExpandAll: true,
        },
      },
    ],
    defaultToolPanel: 'columns',
  },
  floatingFilter: true,
  rowGroupPanelShow: "onlyWhenGrouping",
  rowSelection: "multiple",
  suppressCellSelection: true,
  suppressRowClickSelection: true,
  suppressDragLeaveHidesColumns: true,
  suppressMakeColumnVisibleAfterUnGroup: true,
  overlayNoRowsTemplate:this.overlayNoRowsTemplate,
  isRowSelectable: function (rowNode) {
    return rowNode.data ? rowNode.data.type !== "Video" : false;
  },
  defaultColDef: {
    enableRowGroup: false,
    sortable: true,
    resizable: true,
    enablePivot: true,
    suppressMenu: true,
    paginationAutoPageSize: false 
  }   ,
  accentedSort:true
}; 

constructor(private activatedRoute: ActivatedRoute,private snackBar: MatSnackBar, public dialog: MatDialog,private router: Router,private environment: EnvService, private datePipe: DatePipe,private service: BeehiveMessageService,private cookiesService: BeehiveCookiesService,private dataService: DataService) {
  this.fetchDropdownItems();
   
}


ngOnInit() {
  this.DefaultFilterValue="Latest Research";
  this.loggedInUser = this.cookiesService.GetLoggedInUser();
  this.UserId=this.cookiesService.GetUserID();
  this.buttonList = [{ text: 'Excel' },{ text: 'Save' }];
  this.dataService.IsInRole(Role.deAdministrator).subscribe((data: boolean) => {
    this.isAdmin = data;
  });
  this.dataService.IsInRole(Role.deManager).subscribe((data: boolean) => {
    this.isManager = data;
  });
  setTimeout(() => {
    this.loadPage();
    this.LoadGridData();
      }, 0);

  this.LoadSearchPortfolio(null);
 
this.buildParameterQuerySearch();

}

onButtonClick(text: any) {
  const paramsNullValue = {};
  if (text === 'excel') {
    this.onBtExport();
  }
  if (text === 'save') {
    if(this.selectedQuery==null || this.selectedQuery==undefined)
    {
      console.log("saved dialog:",this.AdvancedSearchParams);
      if(this.AdvancedSearchParams.length>0){     
      this.openSaveDialog();
      }
      else
      {
        this.message=`Please select at least one filter`;
        this.snackBar.open(this.message, 'Close', {
          duration: 2000
        });
      }
    }

   else
   this.SaveAsQuery(this.selectedQuery);
  }
}

fetchDropdownItems(){
this.fetchDropdownData();
}

LoadTicker(event:any) {
let Style=1
if(event=="true" || event==true)
  Style=2;
else if(event.target.checked==true)
Style=2;
this.dataService.getAdvanceTickerList(Style.toString()).subscribe((data: any) => {
  if (data) {
    this.Tickers = data[0].Tickers;
    console.log(this.Tickers);
  }
});
}

LoadIndustries(event:any) {
let Style=1
if(event=="true")
  Style=2;
else if(event.target.checked==true)
Style=2;
console.log(Style);
this.dataService.getAdvanceIndustriesList(Style.toString()).subscribe((data: any) => {
  if (data) {
    this.Industries = data[0].Industries;
  }
});
}
LoadAnalysts(event:any) {
let Style=1
if(event=="true")
  Style=2;
else if(event.target.checked==true)
Style=2;
console.log(Style);
this.dataService.getAdvanceAnalystsList(Style.toString()).subscribe((data: any) => {
  if (data) {
    this.Analysts = data[0].Analysts;
  }
});
}

LoadPickLists(picklist:string,event:any) {
  let Style=1
  if(event=="true")
    Style=2;
  else if(event.target.checked==true)
  Style=2;
  console.log(Style);
  this.dataService.getAdvanceResearchDataList(picklist,Style).subscribe((data: any) => {
    if (data) {
     if(picklist=="Type")
      this.Type = data;
     else if(picklist=="Keyword")
     this.Keyword = data;
     else if(picklist=="InvestorTheme")
     this.Type = data;
    }
  });

  }


fetchDropdownData() {
this.dataService.getAdvanceResearchDataList("research",1).subscribe((data: any) => {
  if (data) {
    this.ActionList= data.ActionTags;
    this.Analysts = data.Analysts;
    this.Tickers = data.Tickers;
    this.Industries = data.Industries;
    this.Type = data.Types;
    this.SubType= data.SubTypes;
    this.Keyword= data.Keywords;
    this.Investorthemes= data.InvestorThemes;
    this.Thematictag= data.ThematicTags;
    this.Authors = data.Authors;
    console.log("Data load completed");
    this.activatedRoute.queryParams.subscribe((params) => {
      console.log("params",params);
      for (let field of this.paramSearchField) {
        let parm =new Array();
        if(params[field]!=undefined)
        {          
          parm[0]=params[field]; 
          console.log("param",params[field]);
         if (parm[0]!='' && parm!=undefined && parm!=null) {
           if (field == 'pubno'){
           this.PubNo = parm[0].toString();
           this.selectedPubNo=parm[0].toString();
           console.log("pubno-->",this.PubNo);
           }
           else if (field == 'text'){
             this.SearchedTextValue=parm[0].toString();
             this.selectedSearchText=parm[0].toString();
           }
           else if (field == 'ticker'){
             this.selectedTickers=[];
                parm.forEach(val => {
                  this.selectedTickers.push(this.Tickers.find(x=>x.Value==val));
                  console.log("selectedTickerparm",this.selectedTickers);                   
                 });
                          
           }
           else if (field == 'analyst'){
             this.selectedAnalysts=[];
             parm.forEach(val => {
              this.selectedAnalysts.push(this.Analysts.find(x=>x.Value==val));
              console.log("selectedAnalystsparam",this.selectedAnalysts);
             });
           }
           else {
             console.log("no param");
           }

         }
        }

      }
    });
    this.router.navigate(['/research']);
  }
});
}

// AGGriddata
loadPage(): void {
this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
this.gridOptions = <GridOptions>{
  rowGroupPanelShow: "always",
  sideBar: "columns",
  rowClassRules: {
    "warning": function (params: any) {
      let row = params.data && params.data.StatusId;
      if (row != 100 && row != 101) {
        return row;
      }
    }
  },
  floatingFilter: true,
  rowSelection: "multiple",
  suppressCellSelection: true,
  suppressRowClickSelection: true,
  suppressDragLeaveHidesColumns: true,
  suppressMakeColumnVisibleAfterUnGroup: true,
}
}

onRowSelected(event: any) {
  if (this.cookiesService.GetUserID()) {
    this.dataService.getCart(this.cookiesService.GetUserID()).subscribe((data: any) => {
      if (data) {
        this.cartArray = data;
        let row = event.data;
        let selected = event.node.selected;
        let payload = {
          UserId: this.cookiesService.GetUserID(),
          ContentType: 'Research',
          ContentId: row.pubId,
          Selected: selected
        }
        if (selected) {
          let item = this.cartArray.filter((v: any) => v.ContentId === event.node.data.pubId && v.ContentType === 'Research');
          if (item.length == 0) {
            this.service.changeMessage({ 'itemAdded': true, 'itemID': event.node.data.pubId, 'type': 'research' });
            payload['Selected'] = true;
            this.dataService.saveCart(payload).subscribe(() => { });
          }
        }
        else {
          let item = this.cartArray.filter((v: any) => v.ContentId === event.node.data.pubId && v.ContentType === 'Research');
          if (item.length == 1) {
            this.service.changeMessage({ 'itemRemoved': true, 'itemID': event.node.data.pubId, 'type': 'research' });
            payload['Selected'] = false
            this.dataService.saveCart(payload).subscribe(() => { });
          }
        }
      }
    });
  }
}

getDataSource(params) {
  this.gridApi = params;
}


LoadGridData() {
  this.passValuestoGrid();
  this.BuildSearchQuery(null);
  this.dataService.GetAdvancedSearchCount(this.AdvancedSearchParams,"4",this.UserId).subscribe((data: any) => {
    this.SearchrowData = data;
    this.gridApi && this.gridApi.setRowData(this.SearchrowData); 
  });
}

passValuestoGrid() {
  this.columnDefs = [
  {
    width: 65,
    headerName: 'ID', field: 'pubId',
    pinned: "left",
    lockPinned: true,
    cellClass: "lock-pinned"
  },
  {
    headerName: 'Date', field: 'reportDate', width: 95, sortable: true, resizable: true, suppressMenu: true,
    cellRenderer: (data) =>{return data.value == undefined ? '' : this.datePipe.transform(this.calendarUtility.formatDate(data.value), 'dd-MMM-yyyy');
    }
},
  { headerName: 'Type', field: 'type', width: 85,filter: 'agSetColumnFilter',resizable: true },
  {headerName: 'Focus', field: 'subType', width:75,  filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
  {
    headerName: 'Title', field: 'title', width: 350, filter: "agTextColumnFilter",
    cellRenderer: function (params) {
      if (params.data != undefined) {
        let fileName = params.data.fileName;
        let searchText = params.searchText;
        if(fileName.toUpperCase().indexOf('.PDF') != -1){
          if (searchText){
          let href = "/research/view.aspx?doc="+fileName+"&s=1&v=1&pdfjs=true#search="+searchText+"";
          return "<a style='cursor: pointer;border-bottom: 1px solid blue' target='_blank' href=" + href + "> " + params.data.title + "</a>";
           }
           else{
            let href = "/research/view.aspx?doc="+fileName+"&s=1&v=1&pdfjs=true";
            return "<a style='cursor: pointer;border-bottom: 1px solid blue' target='_blank' href=" + href + "> " + params.data.title + "</a>";
           }

        }
        else{
          if (searchText){
            let href = "/research/video.aspx?doc="+fileName+"&s=1&v=1#search="+searchText+"";
            return "<a style='cursor: pointer;border-bottom: 1px solid blue' target='_blank' href=" + href + "> " + params.data.title + "</a>";
          }
         // return `<a target='_blank' href='http://institutional-poc.beehive.com/research/video.aspx?doc=${fileName}&s=1&v=1#search=${searchText}'>` + params.data.title + "</a>";
        else{
          let href = "/research/video.aspx?doc="+fileName+"&s=1&v=1";
            return "<a style='cursor: pointer;border-bottom: 1px solid blue' target='_blank' href=" + href + "> " + params.data.title + "</a>";
           }
          //return `<a target='_blank' href='http://institutional-poc.beehive.com/research/video.aspx?doc=${fileName}&s=1&v=1'>` + params.data.title + "</a>";
        }
      }

    },
    cellRendererParams: {
      searchText: this.searchText
    }
  },

  {headerName: 'Tickers', field: 'ticker', width:200,enableRowGroup: true,
  comparator:function(valueA,valueB){
    if(valueA==null)
    return 1;
    else if(valueB==null)
    return -1;
    else{
    var str1 =valueA[0].name;
    var str2 =valueB[0].name;
  var n = str1.localeCompare(str2);
  return n;
    }
  },
  cellRendererFramework: TooltipTemplateComponent, cellRendererParams: {field: "ticker",subField: "name"},
},
  {
    headerName: 'Authors', field: 'author',width: 185,enableRowGroup: true,
    comparator:function(valueA,valueB){
      if(valueA==null)
      return 1;
      else if(valueB==null)
      return -1;
      else{
      var str1 =valueA[0].last;
      var str2 =valueB[0].last;
    var n = str1.localeCompare(str2);
    return n;
      }
    },
     cellRendererFramework: TooltipTemplateComponent,
    cellRendererParams: {
      field: "author",
      subField: "last"
    }
  },
  {headerName: 'Size', field: 'fileSize', width:70, cellClass: 'aggridRightAlign',resizable: true,hide:true, suppressMenu: true},
  {headerName: 'Pages', field: 'pageCount', width:65, cellClass: 'aggridRightAlign',resizable: true, suppressMenu: true},
  {headerName: 'Version', field: 'version', width:70,  cellClass: 'aggridRightAlign',resizable: true,hide:true, suppressMenu: false},
  {headerName: 'Keyword', field: 'keyword', width: 175, 
  comparator:function(valueA,valueB){
    if(valueA==null)
    return 1;
    else if(valueB==null)
    return -1;
    else{
    var str1 =valueA[0].name;
    var str2 =valueB[0].name;
  var n = str1.localeCompare(str2);
  return n;
    }
  },
  cellRendererFramework: TooltipTemplateComponent,hide:true,
    cellRendererParams: {field: "keyword",subField: "name"}
  },
  {headerName: 'Investor Theme', field: 'investorTheme', width: 175,filter: 'agSetColumnFilter', 
  comparator:function(valueA,valueB){
    if(valueA==null)
    return 1;
    else if(valueB==null)
    return -1;
    else{
    var str1 =valueA[0].name;
    var str2 =valueB[0].name;
  var n = str1.localeCompare(str2);
  return n;
    }
  },
  cellRendererFramework: TooltipTemplateComponent,hide:true,
    cellRendererParams: {field: "investorTheme",subField: "name"}
  },
  {headerName: 'Thematic Tags', field: 'thematicTag', width:70,  filter: 'agSetColumnFilter',resizable: true,hide:true, suppressMenu: true},
  {headerName: 'Score', field: 'score', width:70,resizable: true,hide:true, suppressMenu: true},
  {
    headerName: "Option", field: "id", width: 75, cellRendererFramework: OptionsTemplateComponent,
    cellRendererParams: {
      isAdmin: this.GetIsAdmin.bind(this),
      isManager:this.GetIsManager.bind(this)
    }

  },
  {
              headerName: "Cart",
              width: 100,
              field: 'isInCart',
              cellRendererFramework: AgGridCheckboxComponent,
          }

];
}

GetIsAdmin() {
return this.isAdmin;
}
GetIsManager() {
  return this.isManager;
  }

BuildQuery(Name:any,value:any){
let searchParams = [];
let parm;
var params;
params=value;
if(params!=null && params!=undefined && params!=''){
  parm=[];
  params.forEach(x=> {
    parm.push(x);
});
}
if (parm) {
  let fieldQuery = {
    "propName": Name,
    "propValue": parm.constructor === Array ? parm : [parm]
  };

  searchParams.push(fieldQuery);
  this.AdvancedSearchParams = searchParams;
}
}

BuildSearchQuery(type:string) { 
 let searchFields = this.environment.researchscreen;
  let searchParams = [];
  let parm;
  var params;
  for (let field of searchFields) {
    if(field.ControlName!=''){ 
    switch (field.ControlName.toUpperCase()) {
      case 'INDUSTRIES':
        parm=[];
        if(this.selectedIndustries!=null && this.selectedIndustries!=undefined)
        this.selectedIndustries.forEach(x=>{parm.push(x.Value);})
      break;
      case 'ANALYSTS':
        parm=[];
        if(this.selectedAnalysts!=null && this.selectedAnalysts!=undefined )
        this.selectedAnalysts.forEach(x=>{parm.push(x.Value);})
      break;
      case 'AUTHORS':
        parm=[];
        if(this.selectedAuthors!=null && this.selectedAuthors!=undefined )
        this.selectedAuthors.forEach(x=>{parm.push(x.Value);})
      break;
      case 'TICKERS':
        parm=[];
        if(this.selectedTickers!=null && this.selectedTickers!=undefined )
        this.selectedTickers.forEach(x=>{parm.push(x.Value);})
      break;
      case 'TYPE':
        parm=[];
        if(this.selectedType!=null && this.selectedType!=undefined )
        this.selectedType.forEach(x=>{parm.push(x.Value);})
      break;
      case 'SUBTYPE':
        parm=[];
        if(this.selectedSubType!=null && this.selectedSubType!=undefined )
        this.selectedSubType.forEach(x=>{parm.push(x.Value);})
      break;
      case 'KEYWORD':
        parm=[];
        if(this.selectedKeyword!=null && this.selectedKeyword!=undefined )
        this.selectedKeyword.forEach(x=>{parm.push(x.Value);})
      break;
      case 'INVESTORTHEMES':
        parm=[];
        if(this.selectedInvestorthemes!=null && this.selectedInvestorthemes!=undefined )
        this.selectedInvestorthemes.forEach(x=>{parm.push(x.Value);})
      break;
      case 'THEMATICTAG':
        parm=[];
        if(this.selectedThematictag!=null && this.selectedThematictag!=undefined )
        this.selectedThematictag.forEach(x=>{parm.push(x.Value);})
      break;
      case 'COVERAGEACTION':
        parm=[];
        console.log("in",this.selectedCoverageaction);
        if(this.selectedCoverageaction!=null && this.selectedCoverageaction!=undefined )
        this.selectedCoverageaction.forEach(x=>{parm.push(x.Value);})
      break;
      case 'RATINGACTION':
        parm=[];
        if(this.selectedRatingaction!=null && this.selectedRatingaction!=undefined && this.selectedRatingaction.length>0 )
        this.selectedRatingaction.forEach(x=>{parm.push(x.Value);})
      break;
      case 'TARGETPRICEACTION':
        parm=[];
        if(this.selectedTargetpriceaction!=null && this.selectedTargetpriceaction!=undefined && this.selectedTargetpriceaction.length>0 )
        this.selectedTargetpriceaction.forEach(x=>{parm.push(x.Value);})
      break;
      case 'ESTIMATEACTION':
        parm=[];
        if(this.selectedEstimateaction!=null && this.selectedEstimateaction!=undefined && this.selectedEstimateaction.length>0 )
        this.selectedEstimateaction.forEach(x=>{parm.push(x.Value);})
      break;
      case 'TEXT':
        parm="";
        if(this.SearchedTextValue!=null && this.SearchedTextValue!=undefined )
       parm= this.SearchedTextValue;
      break;
      case 'PUBNO':
        parm="";
        if(this.selectedPubNo!=null && this.selectedPubNo!=undefined )
        {
          parm= this.selectedPubNo; 
        }
      break;
      case 'SINCE':
        parm="";
        if(this.since!=null && this.since!=undefined ){
        parm=this.since;
        }
        console.log("parm",parm);
      break;
      case 'UNTIL':
        parm="";
        if(this.until!=null && this.until!=undefined )
        {
          parm=this.until;
        }
      break;     
      default:
      parm=null;
      break;
    }

    if (parm!=null && parm.length>0) {
      if(type=="Savequery" && field.ControlName=="Authors"){
        let fieldQuery = {
          "propName": "associate.id",
          "propValue": parm.constructor === Array ? parm : [parm]
        };
        searchParams.push(fieldQuery);
      }
      else{
        let fieldQuery = {
          "propName": field.PropName,
          "propValue": parm.constructor === Array ? parm : [parm]
        };
        searchParams.push(fieldQuery);
      }

    }
  }
}

  this.AdvancedSearchParams = searchParams;
  if(this.AdvancedSearchParams.length==0){
    this.DefaultFilterValue="Recent Research"; 
    this.showRecordCount=false;
    this.dataService.GetAdvancedSearchCount(this.AdvancedSearchParams,"4",this.UserId).subscribe((data: any) => {
      this.SearchrowData = data;
      this.gridApi && this.gridApi.setRowData(this.SearchrowData); 
    });
   
  }
  else{
  this.DefaultFilterValue=null; 
    this.showRecordCount=true;

  }
  console.log("AdvancedSearchParams",this.AdvancedSearchParams);

}



onBtExport() {
this.dataLoading = true;
let params = {};
params = {
  fileName: this.gridName,
  sheetName: this.gridName,
  processCellCallback:this.ExcelColumnValue,
};
setTimeout(() => {
  console.log(this.gridApi.getDataAsExcel(params));
  this.gridApi.exportDataAsExcel(params);
}, 0)
setTimeout(() => {
  this.dataLoading = false;
}, 2000)
}

ExcelColumnValue(cell:any){
let cellvalue=cell.value;
  if(cellvalue!=undefined && cellvalue.constructor===Array)
  {
    let val=[];
    cellvalue.forEach(x=> {
      val.push(x.name);
  });
  return val;
  }
return cellvalue;
} 

// pick Filter value
onChange(control:string,$event:any) {
let isSearchItem=false;
if($event && $event.bubbles!=true)
{
  switch (control) {
    case 'Industry':
    $event.length>0 ? this.selectedIndustries= $event: this.selectedIndustries=null;
    break;
    case 'Analysts':
      $event.length>0 ? this.selectedAnalysts= $event: this.selectedIndustries=null;
    break;
    case 'Tickers':
      $event.length>0 ? this.selectedTickers= $event: this.selectedTickers=null;
    break;
    case 'Type':
      $event.length>0 ? this.selectedType= $event: this.selectedType=null;
    break;
    case 'SubType':
      $event.length>0 ? this.selectedSubType= $event: this.selectedSubType=null;
    break;
    case 'Keyword':
      $event.length>0 ? this.selectedKeyword= $event: this.selectedKeyword=null;
    break;
    case 'InvestorTheme':
      $event.length>0 ? this.selectedInvestorthemes= $event: this.selectedInvestorthemes=null;
    break;
    case 'ThematicTag':
      $event.length>0 ? this.selectedThematictag= $event: this.selectedThematictag=null;
    break;
    case 'Action':
      this.selectedActionChip =$event;
      this.selectedAction=$event;
      this.mapActionData();
    break;
    case 'Since':
   if($event.value!=undefined && $event.value!=null && $event.value!="")
   {
    this.since=("00"+ ($event.value._d.getMonth()+1)).slice(-2) +"-" + ("00" +  $event.value._d.getDate()).slice(-2)+"-"+$event.value._d.getFullYear();
    this.selectedDateRange=this.since +'-'+ this.until;
   }
  else{
    this.since="";
  }
    break;
    case 'Until':
    if($event.value!=undefined && $event.value!=null && $event.value!="")
    {
      this.until=("00"+($event.value._d.getMonth()+1)).slice(-2) +"-" + ("00" +$event.value._d.getDate()).slice(-2) +"-"+$event.value._d.getFullYear();
      this.selectedDateRange= this.since +'-'+ this.until;
    }
    else{
      this.until="";
    }

    break;
    default:
    break;
  }
    isSearchItem=true;
  }
if((control=='Text' && $event.target.value!=undefined && $event.target.value!="") || (control=='Text' && this.selectedSearchText!=null && this.selectedSearchText!=undefined && this.selectedSearchText!=''))
{ 
console.log("Test",this.selectedSearchText);
this.searchText=this.selectedSearchText;
this.SearchedTextValue=this.selectedSearchText;
isSearchItem=true;
}
else if((control=='PubNo' && $event.target.value!=undefined && $event.target.value!="") || (control=='PubNo' && this.PubNo!=null && this.PubNo!=undefined && this.PubNo!=''))
{ 
console.log("pubno event",$event);
this.selectedPubNo=this.PubNo;
isSearchItem=true;
}
else if($event.length==undefined && control=='DateRange'){
isSearchItem=true;
}

if(isSearchItem) this.LoadRecordCount();  
}

//Remove Chip
removeFilterChip(value: any, control: string) {
  console.log(value,control);
  switch (control) {
    case 'Text':
    this.SearchedTextValue=null;
    this.searchText=null;
    this.selectedSearchText=null;
    break;
    case 'PubNo':
    this.selectedPubNo=null;     
    this.PubNo=null;
    break;
    case 'Industries':
      this.selectedIndustries = this.selectedIndustries.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Analysts':
      this.selectedAnalysts = this.selectedAnalysts.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Authors':
      this.selectedAuthors = this.selectedAuthors.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Tickers':
      this.selectedTickers = this.selectedTickers.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Type':
      this.selectedType = this.selectedType.filter((data: any) => data.Value !== value.Value);
    break;
    case 'SubType':
      this.selectedSubType = this.selectedSubType.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Keyword':
      this.selectedKeyword = this.selectedKeyword.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Investorthemes':
      this.selectedInvestorthemes = this.selectedInvestorthemes.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Thematictag':
      this.selectedThematictag = this.selectedThematictag.filter((data: any) => data.Value !== value.Value);
    break;
    case 'Since':
      this.since="";
     break;
     case 'Until':
       this.until="";
       break;    
    case 'Action':
    this.selectedAction = this.selectedAction.filter((data: any) => data.Value !== value.Value);
    this.mapActionData();
    break;
    deafault:
    break;
  }
  this.LoadRecordCount();
}

searchResult(){
this.BuildSearchQuery(null);
this.passValuestoGrid();
this.dataService.GetAdvancedSearchCount(this.AdvancedSearchParams,"4",this.UserId).subscribe((data: any) => {
  this.SearchrowData = data;
  this.gridApi && this.gridApi.setRowData(this.SearchrowData); 
});

//console.log(this.SearchrowData);
}

LoadRecordCount() {
this.BuildSearchQuery(null);
this.dataService.GetAdvancedSearchCount(this.AdvancedSearchParams,"1",null).subscribe((data: any) => { 
  this.SearchRecordCount = data.HitCount;
  console.log(this.SearchRecordCount);
});
console.log("outcount"); 
this.SearchrowData=[];
this.gridApi && this.gridApi.setRowData(this.SearchrowData); 
}

clearFilter(){
this.router.navigate(['/research']);
  location.reload();
}
toggle() {
event.stopPropagation();
this.show = !this.show;
}


mapActionData(){
  this.selectedCoverageaction=[];
    this.selectedRatingaction=[];
    this.selectedTargetpriceaction=[];
    this.selectedEstimateaction=[];
    this.selectedAction.forEach(x=>{ if(x.Category=="Coverage"){this.selectedCoverageaction.push(x);};} );
    this.selectedAction.forEach(x=>{ if(x.Category=="Rating"){this.selectedRatingaction.push(x);};} );
    this.selectedAction.forEach(x=>{ if(x.Category=="Target"){this.selectedTargetpriceaction.push(x);};} );
    this.selectedAction.forEach(x=>{ if(x.Category=="Estimate"){this.selectedEstimateaction.push(x);};} );

}
//Save query
openSaveDialog() {
const dialogRef = this.dialog.open(SaveQueryComponent);

dialogRef.afterClosed().subscribe(result => {
  this.SaveQuery(result, null)
})
}

SaveQuery(queryName: string, id: string) {
let query = {
  "Id": id,
  "UserId": this.UserId,
  "User":this.loggedInUser,
  "Name": queryName,
  "CreationDate": this.QueryCreationDate,
  "SearchParams": this.BuildSaveQuery()
}

if(queryName!=null && queryName!=undefined && queryName!="")
{

  setTimeout(() => {
    this.dataService.SaveQuery(query).subscribe(data => {
    if (data)
    this.message=`${queryName} saved successfully.`;
    this.snackBar.open(this.message, 'Close', {
      duration: 2000
    });
    setTimeout(() => {  this.LoadSearchPortfolio(query);},2000);
  });
},100);

}
}

BuildSaveQuery(){
this.BuildSearchQuery("Savequery");
return this.AdvancedSearchParams;
}

LoadSearchPortfolio(selectedQuery) { 
this.dataService.GetSavedQuery(this.UserId).subscribe(data => {
  this.savedQueries = data;   
  if (selectedQuery) {
    this.selectedQuery = this.savedQueries.find(x => x.Name == selectedQuery.Name);
    this.setFieldValue(selectedQuery);
    this.LoadRecordCount();
  }
})
}

clearFieldValue()
{
this.SearchedTextValue="";
this.PubNo="";
this.selectedAnalysts= [];
this.selectedAuthors=[];
this.selectedTickers= [];
this.selectedIndustries= [];
this.selectedType= [];
this.selectedSubType= [];
this.selectedKeyword= [];
this.selectedInvestorthemes= [];
this.selectedThematictag= [];
this.selectedCoverageaction= [];
this.selectedRatingaction= [];
this.selectedTargetpriceaction= [];
this.selectedEstimateaction= [];
this.selectedAction=[];
this.selectedDateRange=""; 
}
setFieldValue(selectedQuery:any){
this.clearFieldValue();
if(selectedQuery.SearchParams!=undefined || selectedQuery.SearchParams!=null)
{
  selectedQuery.SearchParams.forEach(x=> {
    let fillQuery=x.propName;
    switch (fillQuery) {
      case 'text':
        this.selectedSearchText= x.propValue[0];
        this.SearchedTextValue=this.selectedSearchText;
      break;
      case 'pubno':
        this.PubNo= x.propValue[0];
        this.selectedPubNo=this.PubNo;
      break;
      case 'industry.id':
        this.selectedIndustries=[];
        x.propValue.forEach(val => {
        this.selectedIndustries.push(this.Industries.find(x=>x.Value==val));
      });
      break;
      case 'author.id':
        this.selectedAnalysts=[];
        x.propValue.forEach(val => {
        this.selectedAnalysts.push(this.Analysts.find(x=>x.Value==val));
        });
      break;
      case 'associate.id':
        this.selectedAuthors=[];
        x.propValue.forEach(val => {
        this.selectedAuthors.push(this.Authors.find(x=>x.Value==val));
        });
      break;
      case 'ticker.id':
       this.selectedTickers=[];
        x.propValue.forEach(val => {
          this.selectedTickers.push(this.Tickers.find(x=>x.Value==val));
          });
      break;
      case 'typeId':
        this.selectedType=[];
        x.propValue.forEach(val => {
          this.selectedType.push(this.Type.find(x=>x.Value==val));
          });
      break;
      case 'subType':
        this.selectedSubType=[];
        x.propValue.forEach(val => {
          this.selectedSubType.push(this.SubType.find(x=>x.Value==val));
          });
      break;
      case 'keyword.id':
        this.selectedKeyword=[];
        x.propValue.forEach(val => {
          this.selectedKeyword.push(this.Keyword.find(x=>x.Value==val));
          });
      break;
      case 'investorTheme.id':
        this.selectedInvestorthemes=[];
        x.propValue.forEach(val => {
          this.selectedInvestorthemes.push(this.Investorthemes.find(x=>x.Value==val));
          });
      break;
      case 'thematicTagId':
        this.selectedThematictag=[];
        x.propValue.forEach(val => {
          this.selectedThematictag.push(this.Thematictag.find(x=>x.Value==val));
          });
      break;
      case 'ticker.coverageAction':
        this.selectedCoverageaction=[];
        x.propValue.forEach(val => {
          this.selectedCoverageaction.push(this.ActionList.find(x=>x.Value==val));
          });
          this.selectedCoverageaction.forEach(a=>{this.selectedAction.push(a);})
          console.log(this.selectedAction);
      break;
      case 'ticker.ratingAction':
        this.selectedRatingaction=[];
        x.propValue.forEach(val => {
          this.selectedRatingaction.push(this.ActionList.find(x=>x.Value==val));
          });
          this.selectedRatingaction.forEach(a=>{this.selectedAction.push(a);})
      break;
      case 'ticker.targetPriceAction':
        this.selectedTargetpriceaction=[];
        x.propValue.forEach(val => {
          this.selectedTargetpriceaction.push(this.ActionList.find(x=>x.Value==val));
          });
          this.selectedTargetpriceaction.forEach(a=>{this.selectedAction.push(a);})
      break;
      case 'ticker.estimateAction':
        this.selectedEstimateaction=[];
        x.propValue.forEach(val => {
          this.selectedEstimateaction.push(this.ActionList.find(x=>x.Value==val));
          });
          this.selectedEstimateaction.forEach(a=>{this.selectedAction.push(a);})
       break;
       case 'since':
       this.since=x.propValue[0];
       break;
       case 'until':
         this.until=x.propValue[0];
         var sinceDate=this.since == undefined ? '' : this.datePipe.transform(this.calendarUtility.formatDate(this.since), 'dd-MMM-yyyy');
         var untileDate=this.until == undefined ? '' : this.datePipe.transform(this.calendarUtility.formatDate(this.until), 'dd-MMM-yyyy');
         this.selectedDateRange=sinceDate + " to " + untileDate;
       break;
      default:
      break;
    }

});
}

}

//Delete Query
DeleteSaveQuery(item){
console.log("Delete selected",item);
this.openDialog(item);
}
openDialog(selectedItem:any) {
const deleteDialogRef = this.dialog.open(ConfirmDialogComponent,{
  data:{
    messageParam:selectedItem.Name,
    messageFront:'Are you sure you want to delete ',
    messageRear:' from Saved Searches?',
  }
});


deleteDialogRef.afterClosed().subscribe((confirmed: boolean) => {
  console.log("confirmed",confirmed);
  if (confirmed) {
    console.log("Delete selected",selectedItem);

    setTimeout(() => {
    this.DeleteQuery(selectedItem, null);
    },1000);

  }
});
}

DeleteQuery(selectedItem: any, id: string) {

if(selectedItem!=null && selectedItem!=undefined && selectedItem!="")
{
this.dataService.DeleteQuery(selectedItem).subscribe(data => {
  console.log("delete response",data);
  if (data)
  {
    this.message=`${selectedItem.Name} deleted successfully.`;
     this.snackBar.open(this.message, 'Close', {
       duration: 3000
     });

     setTimeout(() => {
      this.router.navigate(['/  ']);
    location.reload();
    },3000);
    
  }
  else
    this.message=`${selectedItem.Name} delete in progerss.`;
     this.snackBar.open(this.message, 'Close', {
       duration: 2000
     });
});
}
}

//Update Query
UpdateSaveQuery(item){
console.log("Updated selected",item);
this.openUpdateDialog(item);
}
openUpdateDialog(selectedItem:any) {
const updateDialogRef = this.dialog.open(ConfirmDialogComponent,{
  data:{
    message: 'Do you want to update?'
  }
});


updateDialogRef.afterClosed().subscribe((confirmed: boolean) => {
  console.log("confirmed",confirmed);
  if (confirmed) {
    console.log("Update selected",selectedItem);
    setTimeout(() => {
      this.UpdateQuery(selectedItem);
    },100);
  }
});
}

UpdateQuery(selectedItem: any) {
let query = {
  "Id": selectedItem.Id,
  "UserId": this.UserId,
  "User":this.loggedInUser,
  "Name": selectedItem.Name,
  "CreationDate": this.QueryCreationDate,
  "SearchParams": this.BuildSaveQuery()
}

if(selectedItem!=null && selectedItem!=undefined && selectedItem!="")
{
this.dataService.UpdateQuery(query).subscribe(data => {
  if (data)
    this.message="Updated successfully"; 
    this.snackBar.open(this.message, 'Close', {
      duration: 3000
    });
});
}
}

//Save SaveAs
SaveAsQuery(item){
  console.log("Save-Saveas selected",item);
  this.openSaveAsDialog(item);
  }
openSaveAsDialog(selectedItem:any) {
  const SaveAsDialogRef = this.dialog.open(SaveAsDialogComponent,{
    data:{
      // message: ' Are you sure you want to save the changes?'
      messageParam:selectedItem.Name,
      messageFront:'Are you sure you want to save the changes to',
      messageRear:' in Saved Searches?',
    }
  });


  SaveAsDialogRef.afterClosed().subscribe((confirmed: boolean) => {
    console.log("confirmed",confirmed);
    if (confirmed==false) {
      console.log("Save selected",selectedItem);
      setTimeout(() => {
        this.openSaveDialog();
      },100);
    }
    else if(confirmed==true)
    {
      console.log("update selected",selectedItem);
      setTimeout(() => {
        this.UpdateQuery(selectedItem);
      },100);
    }
  });
  }
 
  buildParameterQuerySearch(){
    this.activatedRoute.queryParams.subscribe((params) => {
      if(params.pubno!=null && params.pubno!=undefined){
          this.PubNo = params.pubno;
          this.selectedPubNo=params.pubno;
          this.LoadRecordCount();}
      else if(params.text!=null && params.text!=undefined){  
        this.SearchedTextValue=params.text; 
        this.LoadRecordCount();
      }
      else if(params.analyst!=null && params.analyst!=undefined){ 
       var selectedAnalystsParam={'Value':parseInt(params.analyst)};  
        this.selectedAnalysts=[];
        this.selectedAnalysts[0]=selectedAnalystsParam;
        this.LoadRecordCount();}
      else if(params.ticker!=null && params.ticker!=undefined){  
        var selectedTickersParam={'Value':parseInt(params.ticker)};    
        this.selectedTickers=[]; 
        this.selectedTickers[0]=selectedTickersParam;
        console.log("selcted tickers",this.selectedTickers);        
        this.LoadRecordCount(); 
        console.log("params :",params);
        
      }
    });
  }
  
}
