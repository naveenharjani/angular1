import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { GridApi, ColGroupDef, ColDef, GridOptions } from 'ag-grid-community';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { DatePipe } from '@angular/common';
import { CalendarUtility } from '../shared/calendar-utility';
import { Role } from '../beehive-page-header/permissions.enums';
import { EnvService } from '../../env.service';

@Component({
  selector: 'app-content-usage',
  templateUrl: './content-usage.component.html',
  styleUrls: ['./content-usage.component.css']
})
export class ContentUsageComponent implements OnInit {

  gridApi: GridApi;
  filtersForm: FormGroup;
  rowData = [];
  style: { width: string, height: string, theme: string };
  pageSize: any = '1000';
  gridName: string = 'CONTENT USAGE';
  columnDefs: (ColDef | ColGroupDef)[];
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridOptions: GridOptions;
  destroyed = new Subject<any>();
  calendarUtility: CalendarUtility = new CalendarUtility();
  isManager: boolean = false;
  isSlxAdministrator: boolean = false;
  canView: boolean = false;

  constructor(private dataService: DataService, private router: Router, private datePipe: DatePipe, private environment: EnvService) { }

  ngOnInit() {     
     setTimeout(() => {
       //Check for Manager
      this.dataService.IsInRole(Role.deManager).subscribe((val) => {
        if (val == true ) {
          this.isManager = true;
        } });
      //Check for SlxAdmin
      this.dataService.IsInRole(Role.deSlxAdministrator).subscribe((val) => {         
          if (val == true) {
            this.isSlxAdministrator = true;
          }
        }); 
        //Condition check either
          if (this.isManager || this.isSlxAdministrator) {
            this.canView = true;
          }
          else {
            this.canView = false;
            window.location.href = this.environment.SiteUrl;
          }
           
    }, 100);
    
    setTimeout(() => {  
     this.buildForm();    
      this.loadPage();
    }, 10);
  }

  loadPage(): void {
    this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
    this.gridOptions = <GridOptions>{
      rowGroupPanelShow: "always",
      sideBar: "columns",
      rowClassRules: {
        "content-usage-warning": function (params: any) {
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
      suppressMakeColumnVisibleAfterUnGroup: true
    }

    if (this.filtersForm.controls['rangeDatePickerTo'].value === "" && this.filtersForm.controls['rangeDatePickerFrom'].value === "") {
      console.log('Initial Load');
      let sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - this.environment.UsageFromDays);
      this.filtersForm.patchValue({
        rangeDatePickerTo: new Date(),
        rangeDatePickerFrom: sinceDate
      });
      let to = new Date(this.filtersForm.controls['rangeDatePickerTo'].value);
      let from = new Date(this.filtersForm.controls['rangeDatePickerFrom'].value);
      this.router.navigate(['/content-usage'], { queryParams: { 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
    }

    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd),
      takeUntil(this.destroyed)
    ).subscribe((val: any) => {
      const to = val.url.split('?')[1].split('&')[1].split('=')[1] ? new Date(val.url.split('?')[1].split('&')[1].split('=')[1]) : '';
      const from = val.url.split('?')[1].split('&')[0].split('=')[1] ? new Date(val.url.split('?')[1].split('&')[0].split('=')[1]) : '';
      let routeParams = { to: to, from: from };
      if (routeParams.to === '' && routeParams.from === '') {
        let sinceDate = new Date();
        sinceDate.setDate(sinceDate.getDate() - this.environment.UsageFromDays);
        routeParams = { to: new Date(), from: sinceDate };
      }
      this.fetchData(routeParams);
      this.patchValue(routeParams);
    });
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  buildForm() {
    this.buttonList = [{ text: 'Excel' }, { text: 'Refresh' }];
    this.filtersForm = new FormGroup({
      rangeDatePickerTo: new FormControl(''),
      rangeDatePickerFrom: new FormControl('')
    });
  }

  fetchData(routeParams?: any) {
    let endDate = routeParams ? this.calendarUtility.formatDate(routeParams.to) : this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value);
    let startDate = routeParams ? this.calendarUtility.formatDate(routeParams.from) : this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value);
    if (endDate !== '' && startDate !== '') {
      this.dataLoading = true;
      const customComparator = (valueA: any, valueB: any) => {
        if (valueA !== null && valueB !== null) {
          return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }
      };
      this.dataService.getUsage('content', startDate, endDate).subscribe((data: any) => {
        this.rowData = data;
        this.columnDefs = [
          {
            headerName: "ID",
            field: "ContentId",
            width: 80
          },
          {
            headerName: "Type",
            field: "ContentTypeId",
            width: 90,
            filter: 'agSetColumnFilter'
          },
          {
            headerName: 'Ticker',
            field: 'Ticker',
            width: 90,
            filter: 'agSetColumnFilter'
          },
          {
            headerName: 'Date Accessed',
            field: 'AccessDate',
            width: 180
          },
          {
            headerName: 'Date Logged',
            field: 'LogDate',
            width: 180
          },
          {
            headerName: "Login",
            field: "LoginId",
            width: 300,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          },
          {
            headerName: "Source",
            field: "Source",
            width: 200,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          },
          {
            headerName: "Status",
            field: "Status",
            width: 200,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          },
          {
            headerName: "Server",
            field: "ServerName",
            width: 100,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          }
        ];
        this.gridApi && this.gridApi.setColumnDefs(this.columnDefs);
        this.gridApi && this.gridApi.setRowData(data);
        this.dataLoading = false;
      });
    }
  }

  patchValue(routeParams: any) {
    this.filtersForm.patchValue({
      rangeDatePickerTo: new Date(routeParams.to),
      rangeDatePickerFrom: new Date(routeParams.from)
    });
  }

  rangeDatePickerValueChange() {
    if (this.filtersForm.controls['rangeDatePickerTo'].value === null) {
      this.filtersForm.patchValue({
        rangeDatePickerTo: new Date()
      });
    }
    if (this.filtersForm.controls['rangeDatePickerFrom'].value === null) {
      this.filtersForm.patchValue({
        rangeDatePickerFrom: new Date()
      });
    }
    var FromDt=new Date(this.datePipe.transform(this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value), 'MM-dd-yyyy'));
    var ToDt= new Date(this.datePipe.transform(this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value), 'MM-dd-yyyy'));
    if(FromDt>ToDt)
    {
      this.filtersForm.setErrors({ 'DateRangeInvalid': true });
    }
    // if (this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value) > this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value)) {
    //   this.filtersForm.setErrors({ 'DateRangeInvalid': true });
    // }
    else {
      this.filtersForm.setErrors(null);
    }
    if (this.filtersForm.valid) {
      let to = new Date(this.filtersForm.controls['rangeDatePickerTo'].value);
      let from = new Date(this.filtersForm.controls['rangeDatePickerFrom'].value);
      this.router.navigate(['/content-usage'], { queryParams: { 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
    }
  }

  getDataSource(params: GridApi) {
    this.gridApi = params;
    if (this.rowData.length == 0) {
      this.gridApi && this.gridApi.setRowData([]);
    }
  }

  onButtonClick(text: any) {
    if (text === 'refresh' && this.filtersForm.valid) {
      let to = new Date(this.filtersForm.controls['rangeDatePickerTo'].value) ? new Date(this.filtersForm.controls['rangeDatePickerTo'].value) : undefined;
      let from = new Date(this.filtersForm.controls['rangeDatePickerFrom'].value) ? new Date(this.filtersForm.controls['rangeDatePickerFrom'].value) : undefined;
      this.router.navigate(['/content-usage'], { queryParams: { 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
    }
    if (text === 'excel') {
      this.onBtExport();
    }
  }

  onBtExport() {
    this.dataLoading = true;
    setTimeout(() => {
      this.gridApi.exportDataAsExcel({
        fileName: this.gridName,
        sheetName: this.gridName
      });
    }, 0)
    setTimeout(() => {
      this.dataLoading = false;
    }, 2000)
  }

}
