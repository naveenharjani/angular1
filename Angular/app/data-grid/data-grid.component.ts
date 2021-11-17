import { Component, OnInit } from '@angular/core';
import { EnvService } from '../../env.service';
import { FormGroup, FormControl } from '@angular/forms';
import { GridApi, ColDef, ColGroupDef, GridOptions } from 'ag-grid-community';
import { UtilityService } from '../shared/utility.service';
import { DataService } from '../shared/data.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {

  filtersForm: FormGroup;
  gridFilters = [];
  gridApi: GridApi;
  rowData = [];
  style: { width: string, height: string, theme: string };
  pageSize: any = '1000';
  gridName: string = 'DATA GRID';
  columnDefs: (ColDef | ColGroupDef)[];
  buttonList: { text: string; }[];
  dataLoading: boolean = false;
  gridOptions: GridOptions;
  colData: any;
  PivotMode: boolean;
  gridID: string = '';

  constructor(private router: Router, private environment: EnvService, private utility: UtilityService, private dataService: DataService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.gridFilters = this.environment.gridFilters;
    this.filtersForm = new FormGroup({
      filterTypes: new FormControl('')
    });
    this.patchForm();
    this.style = { width: '100%', height: '660px', theme: 'ag-theme-balham my-grid' };
    this.gridOptions = <GridOptions>{
      context: { componentParent: this },
      sideBar: true,
      rowGroupPanelShow: 'always',
      floatingFilter: false
    };
    this.filtersForm.controls['filterTypes'].valueChanges.subscribe((value: any) => {
      this.gridID = value;
      this.router.navigate(['/datagrid'], { queryParams: { 'gridID': value } });
    });
    this.route.queryParams.subscribe(val => {
      this.gridID = val.gridID ? val.gridID : 'authors';
      this.loadData(this.gridID);
    });
    this.buttonList = [{ text: 'Excel' }];
  }

  patchForm() {
    this.filtersForm.patchValue({
      filterTypes: 'authors'
    });
    this.loadData(this.filtersForm.controls['filterTypes'].value);
  }

  loadData(gridID: any) {
    if (gridID) {
      this.dataLoading = true;
      this.dataService.GetSourceData(gridID, '').subscribe(rData => {
        this.colData = rData[0];
        this.rowData = rData;
        this.addColumnHeader();
        this.rowData.shift();
        this.dataLoading = false;
      },
        () => {
          this.rowData = [];
        });
    }
  }

  addColumnHeader() {
    var columns = [];
    if (this.colData != undefined)
      Object.keys(this.colData).forEach(key => {
        var colType = this.colData[key]

        if (key.toLowerCase().indexOf('_piv') !== -1) {
          columns.push({ headerName: key.replace("_piv", ""), field: key, enableRowGroup: true, width: 120, pivot: true, enablePivot: true });
          this.PivotMode = true;
        }
        else if (key.toLowerCase().indexOf('_sum') !== -1) {
          columns.push({
            headerName: key.replace("_sum", ""), field: key, filter: "agNumberColumnFilter", width: 120, type: "numericColumn", aggFunc: "sum",
            enableValue: true, valueFormatter: this.utility.formatNumber
          });
        }
        else if (key.toLowerCase().indexOf('_grp') !== -1) {
          columns.push({
            headerName: key.replace("_grp", ""), field: key, enableRowGroup: true, width: 120, filter: "agTextColumnFilter", rowGroup: true,
            rowGroupIndex: 0, hide: true
          });
        }
        else {
          switch (colType) {
            case 'String':
              columns.push({ headerName: key, field: key, enableRowGroup: true, filter: "agTextColumnFilter", sortable: true, resizable: true })
              break;
            case 'Int32':
            case 'Int16':
            case 'Int64':
            case 'Decimal':
            case 'Double':
              columns.push({
                headerName: key, field: key, enableRowGroup: true, filter: "agNumberColumnFilter", type: "numericColumn", width: 100, sortable: true, resizable: true
              })
              break;
            case 'DateTime':
              columns.push({
                headerName: key, field: key, enableRowGroup: true, filter: "agDateColumnFilter", type: ['dateColumn', 'nonEditableColumn'],
                valueFormatter: function (params) {
                  return params.value == undefined ? '' : new UtilityService().LocalDateDisplayFormat(params.value).toLocaleString();
                },
                filterParams: {
                  comparator: function (filterLocalDateAtMidnight, cellValue) {
                    return new UtilityService().LocalDateComparator(filterLocalDateAtMidnight, cellValue);
                  },
                  browserDatePicker: true
                }, sortable: true, resizable: true
              })
              break;
            default:
              columns.push({ headerName: key, field: key, nableRowGroup: true, sortable: true, resizable: true })
          }
        }

      });
    this.columnDefs = columns;
    this.gridApi && this.gridApi.setColumnDefs(columns);
  }

  getDataSource(params: GridApi) {
    this.gridApi = params;
    if (this.rowData.length == 0) {
      this.gridApi && this.gridApi.setRowData([]);
    }
  }

  onButtonClick(text: any) {
    if (text === 'excel') {
      this.onBtExport();
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

}
