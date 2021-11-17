import { Component, OnInit, ViewEncapsulation, Inject } from '@angular/core';
import { DataService } from '../shared/data.service';
import { GridOptions, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { Router } from '@angular/router';
import { UtilityService } from '../shared/utility.service';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { Role } from '../beehive-page-header/permissions.enums';
import {MatDialog, MAT_DIALOG_DATA, MatDialogConfig} from '@angular/material';
import {ProductGroupComponent}from './product-group-form/product-group.component';
import { DatePipe,DecimalPipe  } from '@angular/common';
import { CalendarUtility } from '../shared/calendar-utility';

@Component({
  selector: 'app-product-groups-material',
  templateUrl: './product-groups.component.html',
  styleUrls: ['./product-groups.component.css']
})
export class ProductGroupsComponent implements OnInit {

  rowData: any;
  columnDefs: (ColDef | ColGroupDef)[];
  style: { width: string, height: string, theme: string };
  gridOptions: GridOptions;
  pageSize: any = '1000';
  gridName: string = 'PRODUCT GROUPS';
  roleList: boolean = false;
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridApi: GridApi;
  calendarUtility: CalendarUtility = new CalendarUtility();

  constructor(private dataService: DataService, private router: Router, private cookiesService: BeehiveCookiesService, public dialog: MatDialog, private datePipe:DatePipe) { }

  ngOnInit() {
    this.passValuestoGrid();
    this.fetchData();
    this.roleList = (this.cookiesService.GetRoleList().split(',').indexOf('1') >= 0) ? true : false;
    this.dataService.IsInRole(Role.deAdministrator).subscribe((val) => (val) ?
      this.buttonList = [{ text: 'Excel' }, { text: 'New' }]
      :
      this.buttonList = [{ text: 'Excel' }]);
  }

  fetchData() {
    this.dataService.getProductGroups().subscribe((data: any) => {
      if (data) {
        this.rowData = data;
      }
    });
  }

  passValuestoGrid() {
    this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
    var self = this;
    this.gridOptions = <GridOptions>{
      rowGroupPanelShow: "onlyWhenGrouping",
      context: { componentParent: this },
      masterDetail: true,
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
      detailCellRendererParams: {
        detailGridOptions: {
          columnDefs: [
            { field: 'Date', valueFormatter: function (params: any) {
                      return params.value == undefined ? '' : self.datePipe.transform(params.value, 'dd-MMM-yyyy h:mm a');
                  } 
            },
            { field: 'Action' },
            { field: 'Field' },
            { field: "Value" },
            { field: "User" }
           
          ],
          onFirstDataRendered: function (params: any) {
            params.api.sizeColumnsToFit();
          }
        },
        getDetailRowData: function (params: any) {
          self.dataService.getDatabaseLogs(params.data.Id).subscribe((data: any) => {
            params.data.callRecords = data;
            params.successCallback(params.data.callRecords);
          });
        }
      },
      isRowMaster: function (params: any) {
        return self.roleList ? true : false;
      },
      isFullWidthCell: function () {
        return false;
      }
    };
    this.columnDefs = [
      {
        headerName: "ID",
        field: "Id",
        width: 80,
        hide:true, 
        type: "number", 
        cellClass: 'rightAlignIssueFix',
      },
      {
        headerName: "Product Group",
        field: "Name",
        cellRenderer: "agGroupCellRenderer",
        width: 300,
        cellClass: 'lock-pinned ',
        lockPinned:true,
        pinned:'left',
      },
     
      {
        headerName: 'Description',
        field: 'Description',
        width: 400
      },
      {
        headerName: 'Num Definitions',
        field: 'NumDefinitions',
        width: 150, 
        type: "number", 
        cellClass: 'rightAlignIssueFix',
      },
      {
        headerName:'Option',
        width: 100,  
        cellRenderer: this.onDialogViewClicked.bind(this),      
      }
    ];
  }


  onDialogViewClicked(params:any){
    const eDiv = document.createElement('div');
    eDiv.style.paddingLeft = "20px"
    const productGroupID = params.data.Id;
    eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid blue" productGroupID =' + productGroupID + ' > View </a>';
    eDiv.addEventListener('click', () => {
      this.openDialog();
    });
    return eDiv;
  }

  openDialog(isNewButtonClicked?: boolean) {
    const target = event.target as HTMLAnchorElement;
    let productGroupID = undefined;
    if (isNewButtonClicked) {
      productGroupID = -1;
    }
    else {
      productGroupID = parseInt(target.getAttribute('productGroupID'));
    }

    //Dialog configuration
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    dialogConfig.width = "600px";
    dialogConfig.data = {
      productGroupId:productGroupID
    }
    const dialogRef = this.dialog.open(ProductGroupComponent, dialogConfig);
    //updating grid data when dialog closed
    dialogRef.afterClosed().subscribe(() => {
      this.fetchData();
    });
  }

  onButtonClick(text: any) {
    if (text === 'excel') {
      this.onBtExport();
    }
    if (text === 'new') {
      this.openDialog(true);
    }
  }

  onBtExport() {
    this.onExcelExport();
  }

  getDataSource(params: any) {
    this.gridApi = params;
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
