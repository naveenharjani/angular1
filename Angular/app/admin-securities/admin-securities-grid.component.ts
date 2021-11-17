import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { GridOptions, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { MatSnackBar, MatDialog } from '@angular/material';
import { SecuritiesFormComponent } from './securities-form/securities-form.component';
import { FilterIsActive } from './admin-securities-grid.filter';
import { Role } from '../beehive-page-header/permissions.enums';
import { NewSecuritiesFormComponent} from './new-securities-form/new-securities-form.component'

@Component({
  selector: 'app-admin-securities-grid',
  templateUrl: './admin-securities-grid.component.html',
  styleUrls: ['./admin-securities-grid.component.css']
})
export class AdminSecuritiesGridComponent implements OnInit {

  rowData: any;
  columnDefs: (ColDef | ColGroupDef)[];
  style: { width: string, height: string, theme: string };
  gridOptions: GridOptions;
  pageSize: any = '1000';
  gridName: string = 'SECURITIES';
  isNewButton: boolean = true;
  frameworkComponents: any;
  isHidden: boolean = false;
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridApi: GridApi;

  constructor(private dataService: DataService, private snackBar: MatSnackBar, public dialog: MatDialog) { }


  ngOnInit() {
    this.passValuestoGrid();
    this.fetchData();
    this.dataService.IsInRole(Role.deAdministrator).subscribe((val) => (val) ?
      this.buttonList = [{ text: 'Excel' }, { text: 'New' }]
      :
      this.buttonList = [{ text: 'Excel' }]);
  }

  fetchData() {
    return this.dataService.getSecurities().subscribe((data: any) => {
      this.rowData = data;
        setTimeout(() => {
          this.filterData("Yes");
        }, 1000);
    })
  }

  passValuestoGrid() {
    this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
    this.columnDefs = [
      {
        headerName: 'ID',
        field: 'Id',
        width: 60
      },
      {
        headerName: 'Company',
        field: 'Company',
        width: 180
      },
      {
        headerName: 'Ticker (Old) ',
        field: 'Ticker',
        cellRenderer: this.onViewClicked.bind(this),
        filter: 'agTextColumnFilter',
        width: 120
      },
      {
        headerName: 'Ticker (New) ',
        field: 'Ticker',
        cellRenderer: this.onNewViewClicked.bind(this),
        filter: 'agTextColumnFilter',
        width: 120
      },
      {
        headerName: 'RIC',
        field: 'RIC',
        width: 120,
        hide: !this.isHidden
      },
      {
        headerName: 'Exchange',
        field: 'Exchange',
        width: 100
      },
      {
        headerName: 'Currency',
        field: 'Currency',
        width: 100
      },
      {
        headerName: 'Index',
        field: 'Index',
        width: 100
      },
      {
        headerName: 'Status',
        field: 'Status',
        width: 100
      },
      {
        headerName: 'Active',
        field: 'Active',
        width: 100,
        filter: "agSetColumnFilter",
        // floatingFilterComponent: "sliderFloatingFilter",
        // floatingFilterComponentParams: {
        //   value: 'All',
        //   suppressFilterButton: true
        // },
         suppressMenu: true
      }
    ];
    this.gridOptions = <GridOptions>{
      context: { componentParent: this },
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
      rowClassRules: {
        'dropped': function (params) { return params.data && params.data.Status === 'Dropped' },
        'status-warning': function (params) { return params.data && params.data.Status === 'Unlaunched' },
      }
    };
    //this.frameworkComponents = { sliderFloatingFilter: FilterIsActive };
  }


  filterData(filterText:string) {
    var instance = this.gridApi && this.gridApi.getFilterInstance('Active');
    let model = [filterText];
    instance.setModel(model);
    this.gridApi.onFilterChanged();
  }

  saveSecurity(securitiesDataObj: any) {
    //delete securitiesDataObj.securityId;
    this.dataService.saveSecurity(securitiesDataObj, securitiesDataObj.SecurityId).subscribe((data: any) => {
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
      this.fetchData();
    });
  }

  onViewClicked(params: any) {
    const eDiv = document.createElement('div');
    const securityID = params.data.Id;
    const company = params.data.Company;
    eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid blue" securityID =' + securityID + ' company = ' + company + ' >' + params.data.Ticker + '</a>';
    eDiv.addEventListener('click', () => {
      this.openDialog();
    });
    return eDiv;
  }

  onNewViewClicked(params: any) {
      if (params ==null){
        this.openNewDialog(true);
      }
      else
      {
          const eDiv = document.createElement('div');
          const securityID = params.data.Id;
          const company = params.data.Company;
          eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid blue" securityID =' + securityID + ' company = ' + company + ' >' + params.data.Ticker + '</a>';
          eDiv.addEventListener('click', () => {
            this.openNewDialog();
          });
          return eDiv;
        }
}


  openDialog(isNewButtonClicked?: boolean) {
    const target = event.target as HTMLAnchorElement;
    let securityID = undefined;
    let company = '';
    if (isNewButtonClicked) {
      securityID = -1;
    }
    else {
      securityID = parseInt(target.getAttribute('securityid'));
      company = target.getAttribute('company');
    }
    const dialogRef = this.dialog.open(SecuritiesFormComponent, {
      height: '700px',
      width: '1000px',

      hasBackdrop: false,
      data: { securityID: securityID, company: company }
    });



    dialogRef.afterClosed().subscribe((data: any) => {
      if (data && data.formData) {
        this.saveSecurity(data.formData);
      }
    });
  }

  openNewDialog(isNewButtonClicked?: boolean) {
    const target = event.target as HTMLAnchorElement;
    let securityID = undefined;
    let company = '';
    if (isNewButtonClicked) {
      securityID = -1;
    }
    else {
      securityID = parseInt(target.getAttribute('securityid'));
      company = target.getAttribute('company');
    }
    const dialogRef = this.dialog.open(NewSecuritiesFormComponent, {
      height: '800px',
      width: '600px',

      hasBackdrop: false,
      data: { securityID: securityID, company: company }
    });



    dialogRef.afterClosed().subscribe((data: any) => {
      if (data && data.formData) {
        this.saveSecurity(data.formData);
      }
    });
  }


  onButtonClick(text: any) {
    if (text === 'excel') {
      this.onBtExport();
    }
    if (text === 'new') {
      //this.openDialog(true);
      this.onNewViewClicked(null);
    }
  }

  onBtExport() {
    this.dataLoading = true;
    let params = {};
    params = {
      fileName: this.gridName,
      sheetName: this.gridName,
      columnKeys: this.columnDefs.filter((data: any) => data.hide !== true).map((params: any) => params.field)
    }
    setTimeout(() => {
      this.gridApi.exportDataAsExcel(params);
    }, 0)
    setTimeout(() => {
      this.dataLoading = false;
    }, 2000)
  }

  getDataSource(params: any) {
    this.gridApi = params;
  }

}
