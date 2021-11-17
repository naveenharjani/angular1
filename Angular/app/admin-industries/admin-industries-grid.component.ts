import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { GridOptions, ColDef, ColGroupDef, GridApi } from 'ag-grid-community';
import { MatSnackBar, MatDialog } from '@angular/material';
import { IndustryFormComponent } from './industry-form/industry-form.component';
import { IndustryFormNewComponent } from './industry-form-new/industry-form-new.component';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { Role } from '../beehive-page-header/permissions.enums';

@Component({
  selector: 'app-admin-industries-grid',
  templateUrl: './admin-industries-grid.component.html',
  styleUrls: ['./admin-industries-grid.component.css']
})
export class AdminIndustriesGridComponent implements OnInit {

  rowData: any;
  columnDefs: (ColDef | ColGroupDef)[];
  style: { width: string, height: string, theme: string };
  gridOptions: GridOptions;
  pageSize: any = '1000';
  gridName: string = 'INDUSTRIES';
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridApi: GridApi;

  constructor(private cookiesService: BeehiveCookiesService, private dataService: DataService, private snackBar: MatSnackBar, public dialog: MatDialog) {
  }

  ngOnInit() {
    this.passValuestoGrid();
    this.fetchData();
    this.dataService.IsInRole(Role.deAdministrator).subscribe((val) => (val) ?
      this.buttonList = [{ text: 'Excel' }, { text: 'New' }]
      :
      this.buttonList = [{ text: 'Excel' }]);
  }

  fetchData() {
    return this.dataService.getIndustries().subscribe((data: any) => {
      this.rowData = data;
    });
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
        headerName: 'Industry',
        field: 'Industry',
        cellRenderer: this.onViewClicked.bind(this),
        width: 300
      },
      {
        headerName: 'Industry',
        field: 'Industry',
        cellRenderer: this.onIndustryClicked.bind(this),
        width: 300
      },
      {
        headerName: 'Sector',
        field: 'Sector',
        width: 180
      },
      {
        headerName: 'Status',
        field: 'Status',
        width: 110
      }
    ];
    this.gridOptions = <GridOptions>{
      rowClassRules: {
        'dropped': function (params) { return params.data && params.data.Status === 'Dropped' },
        'status-warning': function (params) { return params.data && params.data.Status === 'Unlaunched' },
      }
    };
  }

  saveIndustry(formData: any) {
    let industryId = formData.IndustryId;
    this.dataService.saveIndustry(formData, industryId).subscribe((data: any) => {
      if (data.StatusCode === 200) {
        this.snackBar.open(data.ReasonPhrase, 'Close', {
          duration: 2000
        });
        this.fetchData();
      }

      if (data.StatusCode === 500) {
        this.snackBar.open(data.ReasonPhrase, 'Close', {
          duration: 5000
        })
      }
    })
  }

  onViewClicked(params: any) {
    const eDiv = document.createElement('div');
    const industryID = params.data.Id;
    const industry = params.data.Industry;
    eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid blue" industryID =' + industryID + ' Industry = ' + industry + ' > ' + industry + '</a>';
    eDiv.addEventListener('click', () => {
      this.openDialog();
    });
    return eDiv;
  }

  openDialog(isNewButtonClicked?: boolean) {
    const target = event.target as HTMLAnchorElement;
    let industryID = undefined;
    let industry = '';
    if (isNewButtonClicked) {
      industryID = -1;
    }
    else {
      industryID = parseInt(target.getAttribute('industryID'));
      industry = target.getAttribute('industry');
    }
    const dialogRef = this.dialog.open(IndustryFormComponent, {
      height: '500px',
      width: '600px',

      hasBackdrop: false,
      data: { id: industryID, industryName: industry }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data && data.formData) {
      //  this.saveIndustry(data.formData);
      console.log("save closed");
      }
    });
  }

  onButtonClick(text: any) {
    if (text === 'excel') {
      this.onBtExport();
    }
    if (text === 'new') {
      this.openIndustryDialog(true);
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

  onIndustryClicked(params: any) {
    const eDiv = document.createElement('div');
    const industryID = params.data.Id;
    const industry = params.data.Industry;
    eDiv.innerHTML = '<a style="cursor: pointer;border-bottom: 1px solid blue" industryID =' + industryID + ' Industry = ' + industry + ' > ' + industry + '</a>';
    eDiv.addEventListener('click', () => {
      this.openIndustryDialog();
    });
    return eDiv;
  }

  openIndustryDialog(isNewButtonClicked?: boolean) {
    const target = event.target as HTMLAnchorElement;
    let industryID = undefined;
    let industry = '';
    if (isNewButtonClicked) {
      industryID = -1;
    }
    else {
      industryID = parseInt(target.getAttribute('industryID'));
      industry = target.getAttribute('industry');
    }
    const dialogRef = this.dialog.open(IndustryFormNewComponent, {
      height: '500px',
      width: '600px',

      hasBackdrop: false,
      data: { id: industryID, industryName: industry }
    });

    dialogRef.afterClosed().subscribe((data: any) => {
      if (data && data.formData) {
        this.saveIndustry(data.formData);
      }
    });
  }

}
