import { Component, OnInit } from '@angular/core';
import { GridApi, ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { FormGroup, FormControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { DataService } from '../shared/data.service';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { takeUntil } from 'rxjs/internal/operators/takeUntil';
import { CalendarUtility } from '../shared/calendar-utility';
import { DatePipe } from '@angular/common';
import { Role } from '../beehive-page-header/permissions.enums';
import { EnvService } from '../../env.service';

@Component({
  selector: 'app-events-usage',
  templateUrl: './events-usage.component.html',
  styleUrls: ['./events-usage.component.css']
})
export class EventsUsageComponent implements OnInit {

  gridApi: GridApi;
  filtersForm: FormGroup;
  rowData = [];
  style: { width: string, height: string, theme: string };
  pageSize: any = '1000';
  gridName: string = 'EVENTS USAGE';
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
      console.log('inside manager',val);
       if (val == true ) {
         this.isManager = true;
         console.log('inside manager1',val);
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
          let row = params.data && params.data.Status;
          if ((params.data.Status === 'F') || (params.data.FileFound === 'F')) {
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
      this.router.navigate(['/events-usage'], { queryParams: { 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
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
      this.dataService.getUsage('events', startDate, endDate).subscribe((data: any) => {
        this.rowData = data;      
        this.columnDefs = [
          {
            headerName: "Event",
            field: "Name",
            width: 500,
            filter: 'agSetColumnFilter'
          },
          {
            headerName: "Type",
            field: "ContentFileType",     
            width: 90,
            filter:'agSetColumnFilter',
            cellRenderer: function (params: any) {
              if (params.data) {
                return params.data.ContentSource.split('.')[1];
              }
            }
          },
          {
            headerName: 'Date Accessed',
            field: 'UsageTime',
            width: 180
          },
          {
            headerName: 'Date Logged',
            field: 'CreatedOn',
            width: 180
          },
          {
            headerName: "Email",
            field: "AccessMailAddr",
            width: 300,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          },
          {
            headerName: "Source Product",
            field: "Source",
            width: 120,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          },
          {
            headerName: "Status",
            field: "Status",
            width: 150,
            filter: 'agSetColumnFilter',
            cellRenderer: function (params: any) {
              if (params.data) {
                if (params.data.Status === 'F') {
                  return 'Unrecognized email';
                }
                else if (params.data.FileFound === 'F') {
                  return 'Unrecognized document id';
                }
                else return '';
              }
            },
            comparator: customComparator
          },
          {
            headerName: "Server Name",
            field: "ServerName",
            width: 120,
            filter: 'agSetColumnFilter',
            comparator: customComparator
          },
          {
            headerName: "Source Internal",
            field: "Source_Internal",
            width: 120,
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
      this.router.navigate(['/events-usage'], { queryParams: { 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
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
      this.router.navigate(['/events-usage'], { queryParams: { 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
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
      })
    }, 0)
    setTimeout(() => {
      this.dataLoading = false;
    }, 2000)
  }

}
