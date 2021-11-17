import { Component, OnInit } from '@angular/core';
import { ColDef, ColGroupDef, GridOptions, GridApi } from 'ag-grid-community';
import { AssetsOptionComponent } from './assets-option/assets-option.component';
import { DataService } from '../shared/data.service';
import { BeehiveCookiesService } from '../shared/cookies.service';
import { AssetsFormComponent } from './assets-form/assets-form.component';
import { MatDialog, MatSnackBar } from '@angular/material';
import { BeehiveMessageService } from '../shared/message-service';
import { DatePipe } from '@angular/common';
import { CalendarUtility } from '../shared/calendar-utility';
import { EnvService } from '../../env.service';
import { Role } from '../beehive-page-header/permissions.enums';
import { AgGridCheckboxComponent } from '../shared/checkbox-renderer/checkbox-renderer.component';

@Component({
    selector: 'app-assets',
    templateUrl: './assets.component.html',
    styleUrls: ['./assets.component.css']
})
export class AssetsComponent implements OnInit {

    rowData: any;
    columnDefs: (ColDef | ColGroupDef)[];
    style: { width: string, height: string, theme: string };
    gridOptions: GridOptions;
    pageSize: any = '1000';
    gridName: string = 'DECKS+ ';
    buttonList: { text: string; }[];
    dataLoading: boolean = false;
    gridApi: GridApi;
    roleList: boolean = false;
    franchiseList = [];
    cartArray = [];
    expiredAssetData: boolean = false;
    frameworkComponents: any;
    calendarUtility: CalendarUtility = new CalendarUtility();
    cartData: any;

    constructor(private snackBar: MatSnackBar, public dialog: MatDialog, private dataService: DataService,
        private cookiesService: BeehiveCookiesService, private service: BeehiveMessageService, private datePipe: DatePipe, private environment: EnvService) { }

    ngOnInit() {
        this.passValuestoGrid();
        this.franchiseList = this.cookiesService.GetFranchiseList().split(',');
        if (this.franchiseList.length === 1 && this.franchiseList[0].trim() === '') {
            this.dataService.IsInRole(Role.deManager).subscribe((val) => {
                if (val === false) {
                    this.buttonList = [{ text: 'Excel' }];
                }
                else {
                    this.buttonList = [{ text: 'Excel' }, { text: 'New Link' }];
                }
            });
        }
        else {
            this.buttonList = [{ text: 'Excel' }, { text: 'New Link' }];
        }
        this.roleList = (this.cookiesService.GetRoleList().split(',').indexOf('1') >= 0) ? true : false;
        this.fetchData();
    }

    onButtonClick(text: any) {
        if (text === 'excel') {
            this.onBtExport();
        }
        if (text === 'new link') {
            this.uploadAsset('new link');
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

    getDataSource(params: any) {
        this.gridApi = params;
    }

    passValuestoGrid() {
        this.style = { width: '100%', height: '624px', theme: 'ag-theme-balham my-grid' };
        var self = this;
        this.gridOptions = <GridOptions>{
            suppressContextMenu: true,
            floatingFilter: true,
            rowGroupPanelShow: "onlyWhenGrouping",
            context: { componentParent: this },
            masterDetail: true,
            detailCellRendererParams: {
                detailGridOptions: {
                    context: { componentParent: this },
                    suppressCellSelection: true,
                    columnDefs: [
                        {
                            headerName: 'LinkId', field: 'LinkId', width: 25, sortable: true, resizable: true, suppressMenu: true
                        },
                        {
                            headerName: 'AssetId', field: 'AssetId', width: 25, sortable: true, resizable: true, suppressMenu: true
                        },
                        {
                            headerName: 'Type', field: 'AssetType', width: 40, sortable: true, resizable: true, suppressMenu: true
                        },
                        {
                            headerName: 'Title', field: 'Title', width: 100, sortable: true, resizable: true, suppressMenu: true,
                            cellRenderer: function (params: any) {
                                if (params.data) {
                                    let href = "/files/links/assets/" + params.data.FileName;
                                    return ((params.data.AssetTypeId === 3) || (params.data.AssetTypeId === 4)) ? params.data.Title : "<a style='cursor: pointer;border-bottom: 1px solid blue' target='HISTORICALASSET' href=" + href + " > " + params.data.Title + "</a>";
                                }
                            }
                        },
                        {
                            headerName: 'Effective', field: 'EffectiveDate', width: 70, sortable: true, resizable: true, suppressMenu: true,
                            valueFormatter: function (params: any) {
                                return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
                            }
                        },
                        {
                            headerName: 'Expiry', field: 'ExpiryDate', width: 70, sortable: true, resizable: true, suppressMenu: true,
                            valueFormatter: function (params: any) {
                                return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
                            }
                        },
                        { headerName: 'Status', field: 'Status', width: 30, sortable: true, resizable: true, suppressMenu: true },
                        {
                            field: 'CreatedBy', width: 60, sortable: true, resizable: true, suppressMenu: true
                        },
                        {
                            field: 'ExpiredBy', width: 60, sortable: true, resizable: true, suppressMenu: true
                        }
                    ],
                    onFirstDataRendered: function (params: any) {
                        params.api.sizeColumnsToFit();
                    }
                },
                getDetailRowData: function (params: any) {
                    self.dataService.getAssetHistory(params.data.LinkId).subscribe((data: any) => {
                        params.data.callRecords = data;
                        params.successCallback(params.data.callRecords);
                    });
                }
            },
            isRowMaster: function (dataItem) {
                return (self.roleList ||
                    (self.franchiseList.indexOf(dataItem.AnalystId && dataItem.AnalystId.toString()) != -1)) ? true : false;
            },
            isFullWidthCell: function () {
                return false;
            },
            rowClassRules: {
                'dropped': function (params) { return params.data && (params.data.State === 'Not Available' || params.data.State === 'Expired') }
            }
        };
        this.columnDefs = [
            {
                headerName: 'Analyst', field: 'Analyst',
                width: 250, suppressSizeToFit: false,
                enableRowGroup: true,
                pinned: "left",
                lockPinned: true,
                cellClass: "lock-pinned", filter: 'agSetColumnFilter',
                cellRendererSelector: function (params) {
                    var groupRenderer = {
                        component: 'agGroupCellRenderer'
                    };
                    return groupRenderer;
                }
            },
            {
                headerName: 'Region',
                field: 'Region',
                width: 90,
                filter: 'agSetColumnFilter',
                // floatingFilterComponent: "sliderFloatingFilter",
                // floatingFilterComponentParams: {
                //   value: 'All',
                //   suppressFilterButton: true
                // },
                suppressMenu: true
            },
            { headerName: 'Type', field: 'AssetType', width: 150, suppressSizeToFit: false, filter: 'agSetColumnFilter' },
            {
                headerName: 'Title', field: 'Title', width: 200, suppressSizeToFit: false, filter: "agTextColumnFilter",
                //cellRendererFramework: AssetHistoryDownloadComponent,
                cellRenderer: function (params: any) {
                    if (params.data) {
                        return (params.data.State === 'Expired') ? params.data.Title : "<a style='cursor: pointer;border-bottom: 1px solid blue' target='CONTENT' href=" + params.data.cid + " > " + params.data.Title + "</a>";
                    }
                }
            },
            {
                headerName: 'Effective', field: 'EffectiveDate', width: 120, enableRowGroup: true,
                valueFormatter: function (params) {
                    return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
                }
            },
            {
                headerName: 'Expiry', field: 'ExpiryDate', width: 120, enableRowGroup: true,
                valueFormatter: function (params) {
                    return params.value == undefined ? '' : self.datePipe.transform(self.calendarUtility.formatDate(params.value), 'dd-MMM-yyyy');
                }
            },
            { headerName: 'Status', field: 'State', width: 100, filter: 'agSetColumnFilter' },
            {
                headerName: "Option", field: "id", width: 75,
                cellRendererFramework: AssetsOptionComponent,
                cellClassRules: {
                    notInExcel: function (params: any) {
                        return true;
                    }
                }
            },
            {
                headerName: "Cart",
                width: 100,
                field: 'IsInCart',
                cellClassRules: {
                    notInExcel: function (params: any) {
                        return true;
                    }
                },
                cellRendererFramework: AgGridCheckboxComponent,
            }
            // {
            //     headerName: "Cart",
            //     width: 100,
            //     checkboxSelection: true,
               
            //     cellStyle: params =>
            //         (params.data.State === 'Not Available' || params.data.State === 'Expired') ?
            //             { 'pointer-events': 'none' }
            //             : ''
            // }
        ];
    }

    fetchData() {
        this.dataService.getAssets(this.cookiesService.GetUserID().toString()).subscribe((data: any) => {
            if (data) {
                this.rowData = data;
                this.gridApi && this.gridApi.setRowData(this.rowData);
                this.passValuestoGrid();
                setTimeout(() => {
                    this.setSelectedRows();
                }, 1000);
            }
        });
    }

    uploadAsset(assetsData?: any) {
        if (!this.expiredAssetData) {
            this.expiredAssetData = (assetsData && (assetsData.IsInCart === 'true' ? true : false));
        }
        const createNewLink = assetsData === 'new link' ? true : false;
        const dialogRef = this.dialog.open(AssetsFormComponent, {
            height: '700px',
            width: '1000px',
            hasBackdrop: false,
            data: { asset: assetsData, assetWasinCartBeforeExpire: this.expiredAssetData, createNewLink: createNewLink }
        });
        dialogRef.afterClosed().subscribe((data: any) => {
            if (data.event !== 'Close') {
                this.fetchData();
                if (data.event === true) {
                    let payload = {
                        UserId: this.cookiesService.GetUserID(),
                        ContentType: 'Asset',
                        ContentId: assetsData.LinkId,
                        Selected: true
                    }
                    this.dataService.saveCart(payload).subscribe(() => { });
                    this.setSelectedRows();
                }
            }
        });
    }

    expireAsset(assetsData: any) {
        if (!this.expiredAssetData) {
            this.expiredAssetData = (assetsData && (assetsData.IsInCart === 'true' ? true : false));
        }
        this.dataService.expireAsset(assetsData.AssetId, this.cookiesService.GetUserID()).subscribe((message: any) => {
            if (message) {
                this.snackBar.open(message, 'Close', {
                    duration: 2000
                });
                /*
                  Only Reduce the Cart Count for Expired Assets.
                */
                if (this.expiredAssetData === true) {
                    this.service.changeMessage({ 'itemRemoved': true, 'itemID': assetsData.LinkId, 'type': 'Asset' });
                }
                this.fetchData();
            }
        });
    }

    resetExpire(assetsData: any) {
        if (!this.expiredAssetData) {
            this.expiredAssetData = (assetsData && (assetsData.IsInCart === 'true' ? true : false));
        }
        this.dataService.resetExpire(assetsData.AssetId, this.environment.AssetsExpiryDays).subscribe((message: any) => {
            if (message) {
                this.snackBar.open(message, 'Close', {
                    duration: 2000
                });
                this.fetchData();
                if (this.expiredAssetData) {
                    let payload = {
                        UserId: this.cookiesService.GetUserID(),
                        ContentType: 'Asset',
                        ContentId: assetsData.LinkId,
                        Selected: true
                    }
                    this.dataService.saveCart(payload).subscribe(() => { });
                    this.setSelectedRows();
                }
            }
        });
    }


    setSelectedRows() {
        this.gridApi && this.gridApi.forEachNode((node: any) => {
            const nodeIsSelected = ((node.data.IsInCart === 'true' ? true : false));
            node.setSelected(nodeIsSelected, false, true);
        });
    }

}
