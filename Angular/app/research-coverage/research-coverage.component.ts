import { Component, OnInit } from '@angular/core';
import { DataService } from '../shared/data.service';
import { ColDef, ColGroupDef, GridOptions, GridApi } from 'ag-grid-community';
import { DatePipe,DecimalPipe  } from '@angular/common';
import { CalendarUtility } from '../shared/calendar-utility';
import { BeehiveCookiesService } from '../shared/cookies.service';

@Component({
  selector: 'app-research-coverage',
  templateUrl: './research-coverage.component.html',
  styleUrls: ['./research-coverage.component.css']
})
export class ResearchCoverageComponent implements OnInit {
      reserachCoverageData: any;
      columnDefs: (ColDef | ColGroupDef)[];
      style: { width: string, height: string, theme: string };
      gridOptions: GridOptions;
      pageSize: any = '1000';
      gridName: string = 'RESEARCH COVERAGE';
      buttonList: { text: string; }[];
      dataLoading: boolean = false;
      gridApi: GridApi;
      gridColumnApi;
      frameworkComponents: any;
      calendarUtility: CalendarUtility = new CalendarUtility();
      saveGridState:boolean=true;
     
  constructor(private dataService: DataService, private datePipe:DatePipe,private decimalPipe:DecimalPipe, private cookiesService:BeehiveCookiesService) {
   
   }

  ngOnInit() {
    this.gridCustomize();
    this.buttonList = [{ text: 'Excel' }, {text:'Reset'}];
  }

 
  getDataSource(params: any) {
        this.gridApi = params;
        this.dataService.getResearchCoverage(this.cookiesService.GetUserID()).subscribe((data) => {
          this.reserachCoverageData = data;
          this.gridApi && this.gridApi.setRowData(this.reserachCoverageData); 
          setTimeout(() => {
              if (typeof(Storage) !== undefined) {
                console.log("storage available");
                // this.gridOptions.columnApi.setColumnGroupState(JSON.parse(localStorage.getItem(this.gridName + "-GRID-COLUMNS-GROUPS")));
               this.applyState();
              } else {
                  console.log("Sorry, your browser does not support Web Storage...");
                  this.filterData("Active");
              }
            //;
        }, 1000);
      });
        
  }

  gridCustomize(){
    this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
    var self = this;
    this.gridOptions = <GridOptions>{
        suppressContextMenu: true,
        floatingFilter: true,
        rowGroupPanelShow: "onlyWhenGrouping",
        context: { componentParent: this },
        masterDetail: true, 
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
        defaultColDef: {
          floatingFilterComponentParams: {
            debounceMs: 3000
          }
        },
        detailCellRendererParams: {
            detailGridOptions: {
                context: { componentParent: this },
                suppressCellSelection: true,
                columnDefs: [
                  {
                    headerName: 'Date', field: 'Date', width: 120, sortable: true, resizable: true, suppressMenu: true,
                    valueFormatter: function (params: any) {
                        return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
                    }
                },
                { headerName:'Rating',field: 'Rating',width: 80,sortable: true, resizable: true, suppressMenu: true },
                { headerName: 'Rating Action',field: 'RatingAction',width: 80,sortable: true, resizable: true, suppressMenu: true },
                { headerName: 'Target Price',field: 'TargetPrice',width: 80,sortable: true, resizable: true, suppressMenu: true},
                { headerName: 'Target Price Action',field: 'TargetPriceAction',width: 120,sortable: true, resizable: true, suppressMenu: true },
                { headerName: 'Closing Price',field: 'ClosingPrice',width: 80,sortable: true, resizable: true, suppressMenu: true },
                { headerName:'Analyst',field: 'Analyst',width: 120,sortable: true, resizable: true, suppressMenu: true },
                ],
                onFirstDataRendered: function (params: any) {
                    params.api.sizeColumnsToFit();
                }
            },
            getDetailRowData: function (params: any) {
              self.dataService.getResearchCoverageDetails(params.data.SecurityID).subscribe((data: any) => {
                    //params.successCallback(data);

                    params.data.callRecords = data;
                    params.successCallback(params.data.callRecords);
                });
            }
        },
        isRowMaster: function (dataItem) {
            return true;
        },
        isFullWidthCell: function () {
            return false;
        },

        // --------------------------------GRID STATE MANAGEMENT ---------------------------------
        onSortChanged: () => {this.saveSortState()},
        //onColumnResized: () => { this.saveColumnState()},
        onColumnGroupOpened: () => {this.saveColumnGroupState()},
        onColumnMoved: () => { this.saveColumnState()},
        onColumnPinned: () => { this.saveColumnState()},
        onColumnVisible: () => {this.saveColumnState()},
        onColumnPivotChanged: () => { this.saveColumnState()},
        onColumnRowGroupChanged: () => { this.saveColumnState(); this.saveColumnGroupState()},
        onFilterChanged:()=>{ this.saveFilterState()},
     
      getRowStyle : function(params) {
        if (params.node.data.Status === "Dropped") {
            return { color: 'gray' };
        }
        else if (params.node.data.Status === "Unlaunched") {
          return { color: 'red' };
        }
      },
  }
    this.columnDefs = [
        {
        headerName: 'Company', field: 'Company',
        width: 250, suppressSizeToFit: false,
        enableRowGroup: true,
        pinned: "left",
        lockPinned: true,
        cellClass: "lock-pinned", filter: "agSetColumnFilter",
        cellRendererSelector: function (params) {
            var groupRenderer = {
                component: 'agGroupCellRenderer'
            };
              return groupRenderer
        }
    },
    {headerName: 'ID', field: 'CoverageId', width:90, enableRowGroup: true,type: "number", cellClass: 'rightAlignIssueFix', resizable: true, suppressMenu: true, hide:true},
      {headerName: 'Ticker', field: 'Ticker', width:120, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
   
      {headerName: 'Analyst', field: 'Analyst', width:180, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true },
      {headerName: 'Region', field: 'Region', width:80, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
    
      {headerName: 'Industry', field: 'Industry', width:280, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
     
      { headerName: 'Rating',field: 'Rating', width:80, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true,
      cellStyle: function(params) {
          if (params.data.Status == "Active"){
            if (params.value == "O")  {
                return  {color: 'green'};
              }
              else if (params.value =="U") {
                return  {color: 'red'};
              }
          }
        }
    },
      { headerName: 'Rating Prior',field: 'RatingPrior', width:100, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, hide:true, suppressMenu: true},
      { headerName: 'Rating Action',field: 'RatingAction', width:100, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, hide:true, suppressMenu: true},
      { headerName: 'Rating Change Date', field: 'RatingChangeDate', width:140, enableRowGroup: true, resizable: true, suppressMenu: true, hide:true,
      valueFormatter: function (params: any) {
          return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
      },  floatingFilterComponentParams: {suppressFilterButton:true}, 
  },
      { headerName: 'Target',field: 'Target', width:100, enableRowGroup: true, type: "number", cellClass: 'rightAlignIssueFix',resizable: true, suppressMenu: true,
            valueFormatter: function (params: any) {
              if(params.value == '-10000'){
                  return '';
              }
              else{
                return self.decimalPipe.transform(Number(params.value), "1.2-2");
              }
          },
          comparator:function(valueA, valueB, nodeA, nodeB, isInverted) {
            if ((Number(valueA) == Number(valueB))) {
                return 0;
            } else  {
                return (Number(valueA)>Number(valueB)) ? 1 : -1;
            }
        }
          
      },
      { headerName: 'Target Prior',field: 'TargetPrior', width:120, enableRowGroup: true, type: "number", cellClass: 'rightAlignIssueFix',resizable: true, suppressMenu: true,
      valueFormatter: function (params: any) {
        if(params.value == '-10000'){
            return '';
        }
        else{
          return self.decimalPipe.transform(Number(params.value), "1.2-2");
        }
    },
    comparator:function(valueA, valueB, nodeA, nodeB, isInverted) {
      if ((Number(valueA) == Number(valueB))) {
          return 0;
      } else  {
          return (Number(valueA)>Number(valueB)) ? 1 : -1;
      }
  }, hide:true,
    },
    { headerName: 'Target Action',field: 'TargetAction', width:100, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true,hide:true,},
    { headerName: 'Target Change Date', field: 'TargetChangeDate', width:140, enableRowGroup: true, resizable: true, suppressMenu: true,
    valueFormatter: function (params: any) {
        return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
    }, hide:true,
},
      { headerName: 'Close Price', field: 'ClosePrice',width:120, enableRowGroup: true, type: "number", cellClass: 'rightAlignIssueFix',resizable: true,suppressMenu: true,
          valueFormatter: function (params: any) {
            if(params.value == '-10000'){
              return '';
          }
            else if(params.value == '-10001'){
                return 'NA';
            }
            else{
              return self.decimalPipe.transform(Number(params.value), "1.2-2");
            }
        },
    comparator:function(valueA, valueB, nodeA, nodeB, isInverted) {
      if ((Number(valueA) == Number(valueB))) {
          return 0;
      } else  {
          return (Number(valueA)>Number(valueB)) ? 1 : -1;
      }
      }  
    }, 
    { headerName: 'Close Date', field: 'CloseDate', width:140, enableRowGroup: true, resizable: true, suppressMenu: true,
    valueFormatter: function (params: any) {
        return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
    }, hide:true,
},
      { headerName: 'Currency', field: 'Cur', width:80, enableRowGroup: true, filter: 'agSetColumnFilter',resizable: true, suppressMenu: true},
      { headerName: 'Upside', field: 'Upside',width:80, enableRowGroup: true,  cellClass: 'rightAlignIssueFix',resizable: true, suppressMenu: true, 
      comparator:function(valueA, valueB, nodeA, nodeB, isInverted) {
        if ((Number(valueA) == Number(valueB))) {
            return 0;
        } else  {
            return (Number(valueA)>Number(valueB)) ? 1 : -1;
        }
    }
    ,
      valueFormatter: function (params: any) {
        return (params.value == '-10000' ? '' : params.value + '%' );
    },
    cellStyle: function(params) {
      if (!isNaN(params.value))  {
        return Number(params.value) < 0 ? 
        {color: 'red'}:{color: 'green'};
        } 
      }
  },
      { headerName: 'Status', field: 'Status', width:120,  filter: 'agSetColumnFilter', resizable: true, suppressMenu: true },
      { headerName: 'Launch Date', field: 'LaunchDate', width:120, enableRowGroup: true, hide:true,  resizable: true, suppressMenu: true,
      valueFormatter: function (params: any) {
          return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
      }
  },
  { headerName: 'Drop Date', field: 'DropDate', width:120, enableRowGroup: true, hide:true, resizable: true, suppressMenu: true,
      valueFormatter: function (params: any) {
          return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
      }
  },
  { headerName: 'Earnings Date', field: 'EarningsDate', width:120, enableRowGroup: true, hide:true, resizable: true, suppressMenu: true,
      valueFormatter: function (params: any) {
          return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
      }
  },
  { headerName: 'Earnings Period', field: 'EarningsPeriod',hide:true, width:120,  filter: 'agSetColumnFilter', resizable: true, suppressMenu: true },
      { headerName: 'CUSIP',field: 'CUSIP', width:120, enableRowGroup: true, filter: 'agTextColumnFilter', hide:true,resizable: true, suppressMenu: true},
      { headerName: 'SEDOL',field: 'SEDOL', width:120, enableRowGroup: true, filter: 'agTextColumnFilter', hide:true,resizable: true, suppressMenu: true},
      { headerName: 'ISIN',field: 'ISIN', width:120, enableRowGroup: true, filter: 'agTextColumnFilter', hide:true,resizable: true, suppressMenu: true},
    ];
}

    onExportClick(text: any) {
      if (text === 'excel') {
        this.onExcelExport();
      }
      if (text === 'reset') {
        localStorage.removeItem(this.gridName + '-GRID-COLUMNS');
        localStorage.removeItem(this.gridName + '-GRID-COLUMNS-GROUPS');
        localStorage.removeItem(this.gridName + '-GRID-FILTER');
        localStorage.removeItem(this.gridName + '-GRID-SORT');
        this.gridOptions.columnApi.resetColumnState();
        this.gridOptions.api.setFilterModel(null);
        this.gridOptions.api.setSortModel(null);
        this.filterData('Active');
      }
    }

   
  filterData(filterText:string) {
      var instance = this.gridApi && this.gridApi.getFilterInstance('Status');
      let model = [filterText];
      instance.setModel(model);
      this.gridApi.onFilterChanged();
    }

  filterColumns(items:any){
      let filteredItems = new Array();
      let objKeys = Object.keys(items)
      objKeys.forEach(function (key, index) {
        let object = { "ColumnName" : objKeys[index] , "FilterValues" : items[key].values};
        filteredItems.push(object)
      })
      //UNABLE TO ACCESS "this.gridApi" object inside objKeys.forEach loop. So created additional for loop 
      for (let i in filteredItems) {
        var instance = this.gridApi && this.gridApi.getFilterInstance(filteredItems[i].ColumnName);
            instance && instance.setModel(filteredItems[i].FilterValues);
      }
    }

  saveColumnState = () => {
     
      if (this.gridOptions === null || this.gridOptions === undefined || !this.saveGridState) {
          return;
      }
      localStorage.setItem(this.gridName + '-GRID-COLUMNS',JSON.stringify(this.gridOptions.columnApi.getColumnState()));
  };
  
  saveColumnGroupState = () => {
      if (this.gridOptions === null || this.gridOptions === undefined || !this.saveGridState) {
          return;
      }
      localStorage.setItem(this.gridName + '-GRID-COLUMNS-GROUPS',JSON.stringify(this.gridOptions.columnApi.getColumnGroupState()));
  };

  saveFilterState= () => {
      if (this.gridOptions === null || this.gridOptions === undefined || !this.saveGridState) {
        return;
      }
      localStorage.setItem(this.gridName + '-GRID-FILTER',JSON.stringify(this.gridOptions.api.getFilterModel()));
  }

  saveSortState= ()=> {
    if (this.gridOptions === null || this.gridOptions === undefined || !this.saveGridState) {
      return;
    }
    localStorage.setItem(this.gridName + '-GRID-SORT',JSON.stringify(this.gridOptions.api.getSortModel()));
  }

    applyState =() => {
      let columnState = JSON.parse(localStorage.getItem(this.gridName +"-GRID-COLUMNS"));
      let sortState = JSON.parse(localStorage.getItem(this.gridName +"-GRID-SORT"));
      let filterState = JSON.parse(localStorage.getItem(this.gridName +"-GRID-FILTER"));
      columnState!= null && columnState.length > 0 ?   this.gridOptions.columnApi.setColumnState(columnState):null;
      sortState!= null && sortState.length > 0 ? this.gridOptions.api.setSortModel(sortState):null;
      console.log("grid filter length", localStorage.getItem(this.gridName +"-GRID-FILTER")==null);
      if (localStorage.getItem(this.gridName +"-GRID-FILTER")==null){
        this.filterData("Active");
      }
      else{
        this.filterColumns(filterState);
      }
      
      this.gridOptions.api.onFilterChanged();
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
  


  