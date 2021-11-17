import { Component, OnInit, AfterViewInit, OnChanges, AfterViewChecked, AfterContentChecked, OnDestroy, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common'
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DataService } from '../../shared/data.service';
import { BeehiveCookiesService } from '../../shared/cookies.service';
import { BeehivePageHeaderComponent } from '../../beehive-page-header/beehive-page-header.component';
import { Role } from '../../beehive-page-header/permissions.enums';


@Component({
    selector: 'C3-Chart',
    templateUrl: './charts.component.html',
    styleUrls: ['./charts.component.css'],
    providers: [DatePipe, DecimalPipe]
})

export class ChartsComponent implements OnInit {

    @ViewChild('container', { read: ViewContainerRef }) container: ViewContainerRef;
    securities: any;
    securitiesCtrl: FormControl;
    filteredSecurityList: Observable<Security[]>;
    securityList: Security[] = [];

    public randomNumber: number;

    chart: { securityid: string, type: string };
    tickers:any;
    charts: Array<object> = [];

    selectedTicker: any;
    selectedType: string;
    image: string;
    TargetData: JSON;
    TgtData: JSON;
    bindto: string;
    chartwidth: number;
    noCoverage: string;

    CurrencyCode: string;
    CompanyName: string;
    CompanyTicker: string;
    BenchmarkIndex: string;
    CompanyTarget: string;
    Duration: string;
    Format: string;
    Count: number;
    TargetDataText: string;
    bThreeYrPriceChart: boolean;
    ApplicationName: string;
    chartheight: number = 350;
    ClosePriceChartType: string = 'spline';
    TargetChartType: string = 'area-step';
    anchorx: number = 200;
    date: Date = new Date();
    strDate?: string;
    todaysDate: string;
    currentTicker: number;
    flag: boolean;
    pageName: string;
    isAdmin: boolean = false;
    buttonClicked: string;
    beehivePageName: string;
    childComponent: BeehivePageHeaderComponent;

    constructor(private apiService: DataService, public datepipe: DatePipe, private router: Router,
        private route: ActivatedRoute, private cookieservice: BeehiveCookiesService, private resolver: ComponentFactoryResolver) {
            //this.getTickers();
    }
    ngOnInit() {
        this.pageName = 'Charts';
       
        this.todaysDate = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');

        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: this.route.snapshot.params['type']

        };

       
        this.apiService.IsInRole(Role.deAdministrator).subscribe((data: boolean) => {
            if (data == true) {
                this.isAdmin = true; 
            }
        });

    }

    ngAfterContentInit() {
        
}


    // filterTicker(value: string) {
    //     if (!value) {
    //         console.info('No Name')
    //         return;
    //     }
    //     return this.securityList.filter(country =>
    //         country.value.toLowerCase().indexOf(value.toLowerCase()) === 0);
    // }

    onTypeChange(charttype) {
        if (this.selectedTicker != null && this.selectedType != null) {
           let ticker;
           this.selectedTicker.Ticker != undefined || this.selectedTicker.Ticker != null 
            ? ticker = this.selectedTicker.Ticker:null;

           // const ticker =

            if (this.selectedType == "pricechart") {
                this.router.navigateByUrl('/charts/pricechart', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricechart', ticker]));

                this.router.navigateByUrl('/charts', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricechart', ticker]));

                this.router.navigateByUrl('/charts/pricehistory', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricechart', ticker]));

                this.router.navigateByUrl('/charts/relativereturn', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricechart', ticker]));

                this.router.navigateByUrl('/charts/priceperformance', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricechart', ticker]));
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricechart', ticker]));
            }

            if (this.selectedType == "pricehistory") {
                this.router.navigateByUrl('/charts', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricehistory', ticker]));

                this.router.navigateByUrl('/charts/pricehistory', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricehistory', ticker]));

                this.router.navigateByUrl('/charts/relativereturn', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricehistory', ticker]));

                this.router.navigateByUrl('/charts/priceperformance', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricehistory', ticker]));

                this.router.navigateByUrl('/charts/pricechart', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricehistory', ticker]));

                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/pricehistory', ticker]));
            }
            if (this.selectedType == "relativereturn") {
                this.router.navigateByUrl('/charts/relativereturn', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/relativereturn', ticker]));

                this.router.navigateByUrl('/charts/pricehistory', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/relativereturn', ticker]));

                this.router.navigateByUrl('/charts', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/relativereturn', ticker]));

                this.router.navigateByUrl('/charts/priceperformance', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/relativereturn', ticker]));

                this.router.navigateByUrl('/charts/pricechart', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/relativereturn', ticker]));
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/relativereturn', ticker]));
            }
            if (this.selectedType == "priceperformance") {
                this.router.navigateByUrl('/charts/relativereturn', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/priceperformance', ticker]));

                this.router.navigateByUrl('/charts/pricehistory', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/priceperformance', ticker]));

                this.router.navigateByUrl('/charts', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/priceperformance', ticker]));

                this.router.navigateByUrl('/charts/priceperformance', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/priceperformance', ticker]));

                this.router.navigateByUrl('/charts/pricechart', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/priceperformance', ticker]));

                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
                    this.router.navigate(['/charts/priceperformance', ticker]));
            }
        }
    }

    onActivate(componentRef) {
        this.apiService.GetMetaDataFields("ticker", 2).subscribe((data) => {
            this.tickers = data;
            this.apiService.saveTickers(data);
            // for (let entry of this.tickers) {
            //     this.securityList.push(new Security( entry["Display"], entry["Ticker"]));
            // }

        let charts = componentRef.works();
        this.image = charts.image;


        let tickerValue = this.tickers.find(x=>x.Ticker==charts.securityid);

       this.selectedTicker = tickerValue;
        this.selectedType = charts.type;

        if(this.image == null){
            let factory = this.resolver.resolveComponentFactory(BeehivePageHeaderComponent);
            let component = this.container.createComponent(factory);
            this.childComponent = component.instance;
            this.childComponent.beehivePageName = 'CHARTS ';
            this.childComponent.buttonList = [
               // { text: 'Batch Job', isRoleNeeded: true, roleType: Role.deAdministrator },
                 { text: 'Download', isRoleNeeded: false }];
            this.childComponent.onButtonClick.subscribe((buttonText: any) => {
                if (buttonText === 'download') {
                    this.onDownload();
                }
                // else if (buttonText === 'batch job') {
                //     this.onBatchJob();
                // }
            })
        }
    });
        //console.log(charts);
    }

    componentRemoved($event) {

    }
    someMethod($event) {
        console.log($event);
    }

    onDownload() {
       // alert("chart image download is in progress...")
        const result = (this.apiService.getTickers()).find(tickers => tickers.Ticker === this.selectedTicker.Ticker);
        this.apiService.getChartsImage(result.Value, result.Ticker, this.selectedType).subscribe((res) => {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(res);
            a.download = result.Ticker + ".png";
            document.body.appendChild(a);
            a.click();
        });
        //console.table(result);
    }

    onBatchJob() {
        alert("Batch job started ...")

        this.apiService.executeBatchJob().subscribe((res) => {

        });
    }
    
}

export class Security {
    value: string;
    code: string;
    constructor(code: string, value: string) {
        this.code = code;
        this.value = value;
    }
}