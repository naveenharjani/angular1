import {
  Component, OnInit, Input, SimpleChanges, OnChanges, Output, EventEmitter
} from '@angular/core';
import { ColumnProperties } from '../shared/column-properties';
import { GridOptions, AgGridEvent, GridApi } from 'ag-grid-community';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { Role } from '../beehive-page-header/permissions.enums';
import { BeehivePageHeaderComponent } from '../beehive-page-header/beehive-page-header.component';
import { DataService } from '../shared/data.service';

@Component({
  selector: 'app-ab-grid',
  templateUrl: './ab-grid.component.html',
  styleUrls: ['./ab-grid.component.css']
})
export class AbGridComponent implements OnInit, OnChanges {

  @Input() rowData: any[];
  @Input() columnDefs: ColumnProperties[];
  @Input() gridName: string;
  @Input() style: any;
  @Input() set gridOptions(value: GridOptions) {
    this.setGridOptions(value);
  };
  @Input() pageSize: any;
  @Input() buttonClicked: string;
  @Input() isNewButton: boolean;
  @Input() frameworkComponents: any;
  @Input() hideHeaderButtons: boolean;
  @Output() newButtonClicked: EventEmitter<any> = new EventEmitter();
  @Output() create: EventEmitter<any> = new EventEmitter();
  @Output() getDataSource: EventEmitter<any> = new EventEmitter();
  @Output() onRowSelect: EventEmitter<any> = new EventEmitter();

  gridApi: GridApi;
  gridColumnApi: any;
  showpagination: any;
  gridApiOptions: GridOptions;
  dataLoading: boolean = false;
  exportExcelParams: { fileName: string; sheetName: string; columnKeys: string[]; };
  paginationPageSize: any;
  childComponent: BeehivePageHeaderComponent;
  public modules: any[] = [ClientSideRowModelModule];

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    if (!this.gridApiOptions) {
      this.setGridOptions({});
    }
  }

  ngOnChanges(change: SimpleChanges) {
    if (change['exportToExcel'] && change['exportToExcel'].currentValue !== undefined) {
      this.gridApi && this.gridApi.exportDataAsExcel(change['exportToExcel'].currentValue)
    }
    if (change['pageSize'] && change['pageSize'].currentValue !== undefined) {
      let pageSize = change['pageSize'].currentValue;
      if (!this.gridApiOptions) {
        this.setGridOptions({});
      }
      this.setPagination(pageSize);
    }
    if (change['hideHeaderButtons'] && change['hideHeaderButtons'].currentValue !== undefined) {
      this.hideHeaderButtons = change['hideHeaderButtons'].currentValue;
      //this.dynamicComponentLoad(this.hideHeaderButtons);
    }
    if (change['rowData'] && change['rowData'].currentValue !== undefined) {
      //console.log('RowData Received by Wrapper Grid', this.rowData);
      if (change['rowData'].currentValue[0] && change['rowData'].currentValue[0].Id == 0) {
        this.gridApi && this.gridApi.setRowData([]);
        if (this.gridOptions) {
          Object.assign(this.rowData, []);
          this.gridOptions.rowData = [];
          this.gridOptions.api.setRowData([]);
        }
      }
    }
  }

  setPagination(pageSize: any) {
    if (!parseInt(pageSize) && pageSize.toLowerCase() === 'auto') {
      this.gridApiOptions.pagination = true;
      this.gridApiOptions.paginationAutoPageSize = true;
      this.gridApiOptions.paginationPageSize = undefined;
      this.gridApiOptions.suppressPaginationPanel = false;
    }
    else if (parseInt(pageSize)) {
      this.gridApiOptions.pagination = true;
      this.gridApiOptions.paginationAutoPageSize = false;
      this.gridApiOptions.paginationPageSize = parseInt(pageSize);
      this.paginationPageSize = parseInt(pageSize);
      this.gridApiOptions.suppressPaginationPanel = false;
    }
    else {
      this.gridApiOptions.pagination = false;
      this.gridApiOptions.paginationAutoPageSize = false;
      this.gridApiOptions.paginationPageSize = undefined;
      this.gridApiOptions.suppressPaginationPanel = true;
    }
  }

  onGridReady(params: AgGridEvent) {
    this.gridApi = params && params.api;
    this.gridColumnApi = params && params.columnApi;
    if (this.gridApiOptions) {
      this.getDataSource.emit(this.gridApi);
    }
    params.api.closeToolPanel();
    if (!this.gridApiOptions.pagination) {
      this.gridApiOptions.pagination = false;
      this.gridApiOptions.paginationAutoPageSize = false;
      this.gridApiOptions.paginationPageSize = undefined;
      this.gridApiOptions.suppressPaginationPanel = true;
    }
  }

  // onFirstDataRendered(params: AgGridEvent) {
  //   params.api.sizeColumnsToFit();
  // }

  onBtExport() {
    this.dataLoading = true;
    let params = {};
    params = {
      fileName: this.gridName,
      sheetName: this.gridName,
      columnKeys: this.columnDefs.filter((data: any) => data.hide !== true).map((params) => params.field)
    }
    setTimeout(() => {
      this.gridApi.exportDataAsExcel(params);
    }, 0)
    setTimeout(() => {
      this.dataLoading = false;
    }, 2000)
  }

  onRowSelected(event: any) {
    this.onRowSelect.emit(event)
  }

  pageHeader() {
    if (this.childComponent) {
      this.dataService.IsInRole(Role.deAdministrator).subscribe((val) => (val && this.isNewButton) ?
        this.childComponent.buttonList = [{ text: 'Excel' }, { text: 'New' }]
        :
        this.childComponent.buttonList = [{ text: 'Excel' }]);
    }
  }

  setGridOptions(value: GridOptions) {
    if (value) {
      value.rowSelection = 'multiple',
        value.suppressCellSelection = true,
        value.suppressRowClickSelection = true,
        value.suppressDragLeaveHidesColumns = true,
        value.suppressMakeColumnVisibleAfterUnGroup = true
      value.defaultColDef = <GridOptions>{
        enableValue: true,
        enableRowGroup: true,
        enablePivot: true,
        sortable: true,
        resizable: true,
        suppressMenu: true,
        paginationAutoPageSize: false
      }
      this.gridApiOptions = value;
    }
  }

}
