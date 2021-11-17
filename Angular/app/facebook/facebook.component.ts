import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ColDef, ColGroupDef, GridOptions, GridApi } from 'ag-grid-community';
import {MatIcon} from '@angular/material'
import { Role } from '../beehive-page-header/permissions.enums';

@Component({
  selector: 'app-facebook',
  templateUrl: './facebook.component.html',
  styleUrls: ['./facebook.component.css']
})
export class FacebookComponent implements OnInit {
  facebookData: any;
  columnDefs: (ColDef | ColGroupDef)[];
  style: { width: string, height: string, theme: string };
  gridOptions: GridOptions;
  pageSize: any = '1000';
  gridName: string = 'FACEBOOK';
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridApi: GridApi;
  gridColumnApi;
  frameworkComponents: any;
  isFacebookEditor:boolean=false;
  isAdmin:boolean=false;
 
constructor(private dataService: DataService) {
  this.dataService.IsInRole(Role.deFacebookEditor).subscribe((val: boolean) => {
    val ? this.isFacebookEditor = true : this.isFacebookEditor = false;
  }); 
  this.dataService.IsInRole(Role.deAdministrator).subscribe((val: boolean) => {
    val ? this.isAdmin = true : this.isAdmin = false;
  }); 
}

ngOnInit() {
  this.gridCustomize();
    this.isFacebookEditor || this.isAdmin 
    ? this.buttonList =  [{ text:'Excel' },{text:'New'} ]
    : this.buttonList =  [{ text:'Excel' }];
}

getDataSource(params: any) {
    this.gridApi = params;
    this.dataService.getFacebookNames().subscribe((data) => {
      this.facebookData = data;
      this.gridApi && this.gridApi.setRowData(this.facebookData); 
      setTimeout(() => {
            this.filterData("Active");
          }, 1000);
    });
}


gridCustomize(){
    this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
    var self = this;
    this.gridOptions = <GridOptions>{
      context: { componentParent: this },
      floatingFilter: true,
      suppressContextMenu:true,
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
    }
    this.columnDefs = [
      {headerName: 'ID', field: 'PersonId', width:80,  resizable: true, suppressMenu: true,type: "number", cellClass: 'rightAlignIssueFix', hide:true},
        {headerName: 'Name', field: 'Name', width:250,  filter: 'agTextColumnFilter',resizable: true, suppressMenu: true},
        {headerName: 'Phone', field: 'Phone', width:250,  hide:true, resizable: true, suppressMenu: true},
        {headerName: 'Title', field: 'Title', width:250, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
        {headerName: 'Department', field: 'Dept', width:300,  filter: 'agSetColumnFilter',resizable: true, suppressMenu: true },
        {headerName: 'Location', field: 'Location', width:200,  filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
        { headerName: 'Status',field: 'Status', width:150,  filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
        {headerName: 'Company', field: 'NewCompany', width:250,  hide:true, filter: 'agSetColumnFilter', resizable: true, suppressMenu: true},
        {headerName:'Details',  width:150,resizable:true,suppressMenu:true, 
        cellRenderer: function(params) {
              const eDiv = document.createElement('div');
              let url = self.isFacebookEditor 
                        ? "/research/FaceBookNames.aspx?nameid=" + params.data.PersonId 
                        : "/research/FaceBookNamesView.aspx?nameid=" + params.data.PersonId;
              eDiv.innerHTML = self.isFacebookEditor 
                                ? '<a style="cursor: pointer;border-bottom: 1px solid">Edit</a>' 
                                : '<a style="cursor: pointer;border-bottom: 1px solid">View</a>' ;
              eDiv.addEventListener('click', function() {
              window.open(url.toString(), 'FORM', 'left=50,top=50,width=1000,height=750,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes', true);
              return false;
          });
          return eDiv;
        }
    }
    ]
}

filterData(filterText:string) {
  var instance = this.gridApi && this.gridApi.getFilterInstance('Status');
  let model = [filterText];
  instance.setModel(model);
  this.gridApi.onFilterChanged();
}

onExportClick(text: any) {
  if (text === "new"){
    let url = "/research/facebooknames.aspx?nameid=";
    window.open(url.toString(), 'FORM', 'left=50,top=50,width=1000,height=750,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes', true);
              return false;
  }
  if (text === 'excel') {
   this.onExcelExport();
  }

  
}
onExcelExport() {
  this.dataLoading = true;
  let params = {};
  params = {
    fileName: this.gridName,
    sheetName: this.gridName,
    processCellCallback:this.ExcelColumnValue,
  };
  setTimeout(() => {
  //  console.log(this.gridApi.getDataAsExcel(params));
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


}
