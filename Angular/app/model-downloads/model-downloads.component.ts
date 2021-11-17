import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { Router, ActivatedRoute, RouterEvent, NavigationEnd } from '@angular/router';
import { GridApi, ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { FormGroup, FormControl } from '@angular/forms';
import { ViewModelDownloadsComponent } from './view-model-downloads/view-model-downloads.component';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DatePipe } from '@angular/common/';
import { CalendarUtility } from '../shared/calendar-utility';
import { EnvService } from '../../env.service';

@Component({
  selector: 'app-model-downloads',
  templateUrl: './model-downloads.component.html',
  styleUrls: ['./model-downloads.component.css']
})
export class ModelDownloadsComponent implements OnInit {

  gridApi: GridApi;
  filtersForm: FormGroup;
  rowData = [];
  style: { width: string, height: string, theme: string };
  pageSize: any = '1000';
  gridName: string = 'MODEL DOWNLOADS';
  columnDefs: (ColDef | ColGroupDef)[];
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridOptions: GridOptions;
  destroyed = new Subject<any>();
  calendarUtility: CalendarUtility = new CalendarUtility();

  constructor(private dataService: DataService, private router: Router, private route: ActivatedRoute, private datePipe: DatePipe, private environment: EnvService) { }

  ngOnInit() {
    this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
    this.gridOptions = <GridOptions>{
      floatingFilter: true,
      context: { componentParent: this }
    }
    this.buildForm();

    if (this.filtersForm.controls['rangeDatePickerTo'].value === "" && this.filtersForm.controls['rangeDatePickerFrom'].value === "") {
      console.log('Initial Load');
      let sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - this.environment.DownloadsFromDays);
      this.filtersForm.patchValue({
        rangeDatePickerTo: new Date(),
        rangeDatePickerFrom: sinceDate
      });
      let to = new Date(this.filtersForm.controls['rangeDatePickerTo'].value);
      let from = new Date(this.filtersForm.controls['rangeDatePickerFrom'].value);
      this.router.navigate(['/model-downloads'], { queryParams: { type: 'research', 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
    }

    this.filtersForm.controls['Type'].valueChanges.subscribe((data: any) => {
      if (data !== undefined && data !== this.route.snapshot.queryParams['type']) {
        let to = new Date(this.filtersForm.controls['rangeDatePickerTo'].value) ? new Date(this.filtersForm.controls['rangeDatePickerTo'].value) : this.route.snapshot.queryParams.to;
        let from = new Date(this.filtersForm.controls['rangeDatePickerFrom'].value) ? new Date(this.filtersForm.controls['rangeDatePickerFrom'].value) : this.route.snapshot.queryParams.from;
        this.router.navigate(['/model-downloads'], { queryParams: { 'type': data, 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
      }
    });

    this.router.events.pipe(
      filter((event: RouterEvent) => event instanceof NavigationEnd),
      takeUntil(this.destroyed)
    ).subscribe((val: any) => {
      const from = val.url.split('?')[1].split('&')[1].split('=')[1] ? new Date(val.url.split('?')[1].split('&')[1].split('=')[1]) : '';
      const to = val.url.split('?')[1].split('&')[2].split('=')[1] ? new Date(val.url.split('?')[1].split('&')[2].split('=')[1]) : '';
      const type = val.url.split('?')[1].split('&')[0].split('=')[1] ? val.url.split('?')[1].split('&')[0].split('=')[1] : '';
      let routeParams = { to: to, from: from, type: type };
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
      rangeDatePickerFrom: new FormControl(''),
      Type: new FormControl('')
    });
  }

  patchValue(routeParams: any) {
    this.filtersForm.patchValue({
      rangeDatePickerTo: new Date(routeParams.to),
      rangeDatePickerFrom: new Date(routeParams.from),
      Type: routeParams.type
    });
  }

  fetchData(routeParams?: any) {
    let endDate = routeParams ? this.calendarUtility.formatDate(routeParams.to) : this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value);
    let startDate = routeParams ? this.calendarUtility.formatDate(routeParams.from) : this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value);
    let type = routeParams ? routeParams.type : this.filtersForm.controls['Type'].value;
    if (endDate !== '' && startDate !== '') {
      this.dataLoading = true;
      const customComparator = (valueA: any, valueB: any) => {
        if (valueA !== null && valueB !== null) {
          return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
        }
      };
      this.dataService.getModelDownloadsData(type, startDate, endDate).subscribe((data: any) => {
        this.rowData = data[0];
        if (type === 'sales') {
          this.columnDefs = [
            {
              headerName: 'Account',
              field: 'Account',
              width: 300,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'US Tier',
              field: 'USTier',
              width: 120,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'EU Tier',
              field: 'EUTier',
              width: 120,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'AP Tier',
              field: 'APTier',
              width: 120,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'Downloads',
              field: 'Downloads',
              width: 120,
              cellClass: 'rightAlign',
              cellRendererFramework: ViewModelDownloadsComponent,
              cellRendererParams: {
                enableDetail: data[1]
              }
            }
          ];
          this.gridApi && this.gridApi.setColumnDefs(this.columnDefs);
          this.gridApi && this.gridApi.setRowData(data[0]);
        }
        else if (type === 'research') {
          this.columnDefs = [
            {
              headerName: 'Company',
              field: 'Company',
              width: 300,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'Model',
              field: 'Model',
              width: 120,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'Analyst',
              field: 'Analyst',
              width: 200,
              filter: 'agSetColumnFilter',
              comparator: customComparator
            },
            {
              headerName: 'Downloads',
              field: 'Downloads',
              width: 120,
              cellClass: 'rightAlign',
              cellRendererFramework: ViewModelDownloadsComponent,
              cellRendererParams: {
                enableDetail: data[1]
              }
            }
          ];
        }
        this.dataLoading = false;
      });
    }
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
   
    // if (this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value) > this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value)) {
    //   this.filtersForm.setErrors({ 'DateRangeInvalid': true });
    // }
    if(FromDt>ToDt)
    {
      this.filtersForm.setErrors({ 'DateRangeInvalid': true });
    }
    else {
      this.filtersForm.setErrors(null);
    }
    if (this.filtersForm.valid) {
      let to = new Date(this.filtersForm.controls['rangeDatePickerTo'].value);
      let from = new Date(this.filtersForm.controls['rangeDatePickerFrom'].value);
      let type = this.filtersForm.controls['Type'].value;
      this.router.navigate(['/model-downloads'], { queryParams: { 'type': type, 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
    }
  }

  openLink(data: any) {
    var self = this;
    let until = self.calendarUtility.formatDate(self.filtersForm.controls['rangeDatePickerTo'].value) ? self.calendarUtility.formatDate(self.filtersForm.controls['rangeDatePickerTo'].value) : undefined;
    let since = self.calendarUtility.formatDate(self.filtersForm.controls['rangeDatePickerFrom'].value) ? self.calendarUtility.formatDate(self.filtersForm.controls['rangeDatePickerFrom'].value) : undefined;
    let url = '';
    if (self.filtersForm.controls['Type'].value === 'research') {
      url = "/research/modeldownloaddetails.aspx?ticker=" + data.Model + "&since=" + since + "&until=" + until;
    }
    else if (self.filtersForm.controls['Type'].value === 'sales') {
      url = "/research/modeldownloaddetails.aspx?accountid=" + data.AccountId + "&since=" + since + "&until=" + until;

    }
    window.open(url.toString(), 'FORM', 'left=50,top=50,width=1000,height=750,menubar=no,toolbar=no,location=no,directories=no,status=yes,resizable=yes,scrollbars=yes', true);
    return false;
  }

  getDataSource(params: GridApi) {
    this.gridApi = params;
    if (this.rowData.length == 0) {
      this.gridApi && this.gridApi.setRowData([]);
    }
  }

  onButtonClick(text: any) {
    if (text === 'refresh' && this.filtersForm.valid) {
      let to = this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value) ? this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerTo'].value) : undefined;
      let from = this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value) ? this.calendarUtility.formatDate(this.filtersForm.controls['rangeDatePickerFrom'].value) : undefined;
      this.router.navigate(['/model-downloads'], { queryParams: { 'type': this.filtersForm.controls['Type'].value, 'from': this.datePipe.transform(this.calendarUtility.formatDate(from), 'MM-dd-yyyy').toString(), 'to': this.datePipe.transform(this.calendarUtility.formatDate(to), 'MM-dd-yyyy').toString() } });
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