import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ColDef, ColGroupDef, GridOptions, GridApi } from 'ag-grid-community';
import {MatDialogConfig, MatIcon} from '@angular/material'
import { Role } from '../beehive-page-header/permissions.enums';
import { DatePipe  } from '@angular/common';
import { CalendarUtility } from '../shared/calendar-utility';
import { MatDialog } from '@angular/material';
import {ProductGroupComponent} from '../product-groups/product-group-form/product-group.component'
import { EnvService } from '../../env.service';

@Component({
  selector: 'app-distribution-sites',
  templateUrl: './distribution-sites.component.html',
  styleUrls: ['./distribution-sites.component.css']
})
export class DistributionSitesComponent implements OnInit {
  distributionSitesData: any;
  columnDefs: (ColDef | ColGroupDef)[];
  style: { width: string, height: string, theme: string };
  gridOptions: GridOptions;
  pageSize: any = '1000';
  gridName: string = 'DISTRIBUTION SITES';
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridApi: GridApi;
  gridColumnApi;
  frameworkComponents: any;
  isAdmin:boolean=false;
  calendarUtility: CalendarUtility = new CalendarUtility();
  contentGroupUrl:string;

 constructor(private dataService: DataService, private datePipe:DatePipe, private dialog:MatDialog, private environment:EnvService) {
  //checking facebook editor role
  this.dataService.IsInRole(Role.deAdministrator).subscribe((val: boolean) => {
    val ? this.isAdmin = true : this.isAdmin = false;
  }); 
}

ngOnInit() {
    this.gridCustomize();
    this.isAdmin  ? this.buttonList =  [{ text:'Excel' },{text:'New'} ]
                  : this.buttonList =  [{ text:'Excel' }];

    this.contentGroupUrl =  this.environment.menuItems.find(a=>a.Label=="MODELS").Url.replace("models","productGroup?id=");
}

  
getDataSource(params: any) {
    this.gridApi = params;
    this.dataService.getDistributionSites().subscribe((data) => {
      this.distributionSitesData = data;
      this.gridApi && this.gridApi.setRowData(this.distributionSitesData); 
      setTimeout(() => {
        this.filterData("Y");
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
      {headerName: 'ID', field: 'SiteId', width:80,  resizable: true, suppressMenu: true,type: "number", cellClass: 'rightAlignIssueFix', hide:true},
      {headerName: 'Site', field: 'Site', width:250,  filter: 'agTextColumnFilter',resizable: true, suppressMenu: true },
      {headerName: 'Type', field: 'SiteType', width:100, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
     
      {headerName: 'Content Group', field: 'ProductGroupName', width:200,  filter: 'agSetColumnFilter',resizable: true, suppressMenu: true,
      cellRenderer: this.onViewClicked.bind(this)
    },
      { headerName: 'Earliest Content',field: 'Earliest', width:150,  resizable: true, suppressMenu: true, hide:true,
      valueFormatter: function (params: any) {
        return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
    }
    },
      { headerName: 'Earliest Transfer',field: 'Min', width:150, resizable: true, suppressMenu: true,hide:true,
      valueFormatter: function (params: any) {
        return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
    }},
    { headerName: 'Latest Transfer',field: 'Max', width:150, resizable: true, suppressMenu: true,
      valueFormatter: function (params: any) {
        return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
    }},
    {headerName: 'Num', field: 'Num', width:100,  resizable: true, suppressMenu: true,type: "number", cellClass: 'rightAlignIssueFix', 
      valueFormatter: function (params: any) {
       return Number(params.value).toLocaleString('en-GB');
      }   
    },
    {headerName: 'Model', field: 'Model', width:100, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true,hide:true},
    {headerName: 'Active', field: 'Active', width:100, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
    {headerName: 'Watermark', field: 'Watermark', width:100, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true, hide:true},
    {headerName: 'Watermark Text', field: 'WatermarkText', width:250, hide:true, resizable: true, suppressMenu: true},
    {headerName: 'LinkBack', field: 'LinkBack', width:100, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true, hide:true},

   
  ];
this.isAdmin ?
              this.columnDefs.push( {  headerName:'Details',  width:150,resizable:true,suppressMenu:true, 
                          cellRenderer: function(params) {
                            let url =  "/distribution/siteadm.asp?siteid=" + params.data.SiteId; 
                            const eDiv = document.createElement('div');
                            eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid">View</a>';
                            eDiv.addEventListener('click', () => {
                              //let url =  this.environment.menuItems.find(a=>a.Label=="MODELS").Url.replace("models","productGroup?id=") + params.data.SiteId;
                              window.open(url, 'FORM', 'left=50,top=50,width=1000,height=750,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes', true);
                              return false;
                            });
                            return eDiv;
                          }
                      })
              :null;

}


  onExportClick(text: any) {
    if (text === "new"){
      let url = "/distribution/siteadm.asp?siteid=-1";
      window.open(url.toString(), 'FORM', 'left=50,top=50,width=1000,height=750,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes', true);
      return false;
    }
    if (text === 'excel') {
      this.onExcelExport();
    }
  }

  onViewClicked(params: any) {
    let cellDisplayText = params.data.ProductGroupName == null? '': params.data.ProductGroupName;
    const eDiv = document.createElement('div');
    eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid">' +  cellDisplayText+ ' </a>';
    eDiv.addEventListener('click', () => {
      this.openDialog(true,params.data.ProductGroupId);
    });
    return eDiv;
  }


  filterData(filterText:string) {
    var instance = this.gridApi && this.gridApi.getFilterInstance('Active');
    let model = [filterText];
    instance.setModel(model);
    this.gridApi.onFilterChanged();
  }

  openDialog(isNewButtonClicked?: boolean,productGroupId?:any) {
    //Dialog configuration
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "600px";
    dialogConfig.hasBackdrop = false;
    dialogConfig.data = {
      productGroupId:productGroupId
    }
    this.dialog.open(ProductGroupComponent, dialogConfig);
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
