import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DataService } from '../../../shared/data.service';
import { DatePipe } from '@angular/common'

import * as d3 from 'd3';
import * as c3 from 'c3';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'relativereturn-chart',
    templateUrl: './relativereturn.component.html',
    styleUrls: ['./relativereturn.component.css']
})
export class RelativeReturnComponent implements OnInit, OnChanges {
    @Input() ticker: string;
    @Input() type: string;

    private tickers: Array<object> = [];
    private charts: Array<object> = [];

    selectedTicker: string;
    selectedType: string;

    TargetData: JSON;
    TgtData: JSON;
    bindto: string;
    chartwidth: number;
    noCoverage: string;

    CurrencyCode: string;
    CompanyName: string;
    CompanyTicker: string;
    Index: string;
    CompanyTarget: string;
   
    
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

    MaxRelative: number = 0.00;
    MinRelative: number = 0.00;
    MaxTicker: number = 0;

    Format: string;
    Count: number=8;
   
    is1M: boolean = false;
    is3M: boolean = false;
    is6M: boolean = false;
    is1Y: boolean = false;
    is2Y: boolean = false;
    is3Y: boolean = true;
    duration: string = "3y";

    chart: { securityid: string, type: string,image:string };
    constructor(private apiService: DataService, public datepipe: DatePipe, private route: ActivatedRoute
        , private router: Router) { }
    ngOnInit() {
        this.todaysDate = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');
       
        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: 'relativereturn',
            image:this.route.snapshot.params['image']

        };
        
        this.route.params.subscribe(params => {
            this.chart = {
                securityid: this.route.snapshot.params['securityid'],
                type: 'relativereturn',
                image:this.route.snapshot.params['image']
    
            };

        });
       // this.apiService.setChartValue(this.ticker, this.type);

       if(this.ticker == null){
        this.getTickers();
       
    }

        if (this.ticker != null)
            this.getChartData();
    }
    onButtonClick(period: string) {
        this.is1M = false;
        this.is3M = false;
        this.is6M = false;
        this.is1Y = false;
        this.is2Y = false;
        this.is3Y = false;
        if (period == '1m') {
            this.is1M = true;
            this.duration = '1m'
            this.Count = 12;
        }
        else if (period == '3m') {
            this.is3M = true;
            this.duration = '3m';
            this.Count = 3;

        }
        else if (period == '6m') {
            this.is6M = true;
            this.duration = '6m';
            this.Count = 6;
        }
        else if (period == '1y') {
            this.is1Y = true;
            this.duration = '1y';
            this.Format = '%b %y';
            this.Count = 12;
        }
        else if (period == '2y') {
            this.is2Y = true;
            this.duration = '2y'
            this.Format = '%b %y';
            this.Count = 8;
        }
        else if (period == '3y') {
            this.is3Y = true;
            this.duration = '3y';
            this.Format = '%b %y';
            this.Count = 8;
        }
        this.getChartData();
    }
    public getTickers() {
        this.apiService.GetMetaDataFields("ticker",2).subscribe((data: Array<object>) => {
            this.tickers = data;
            this.apiService.saveTickers(this.tickers);
            this.ticker = this.chart.securityid;
            this.getChartData();
        }); 
    }
    ngOnChanges() {
        this.getChartData();
    }
    works(){
        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: 'relativereturn',
            image:this.route.snapshot.params['image']

        };
       
        this.route.params.subscribe(params => {
            this.chart = {
                securityid: this.route.snapshot.params['securityid'],
                type: 'relativereturn',
                image:this.route.snapshot.params['image']
    
            };
        });
      
        return this.chart;
      }
    public getChartData() {
        const result = (this.apiService.getTickers()).find( tickers => tickers.Ticker === this.chart.securityid );
        this.apiService.getChartData(this.ticker, this.type,result.Value,this.duration).subscribe((data: Array<object>) => {
            this.charts = data;
            this.flag = true;

            this.RelativeReturn(data, this.datepipe);
        });
    }


    public RelativeReturn(response, datepipe) {
        var json1 = response.closePrices;
        var json2 = response.targetPrices;
        this.chartwidth = 800;
        this.bindto = '#chart'

        var relativeData = [];
        var convertedData2 = [];
        var chartDate = [];
        var limit = 1000;
        this.MaxRelative = 0.00;
        this.MinRelative = 0.00;

        var dataTicker = json1;

        this.CurrencyCode = "";
        this.Index = "";
        this.CompanyTarget = "";

        var TickYear = "";
        var TickMonth = "";
        

        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        for (let entry of dataTicker) {
            this.CurrencyCode = entry["CurrencyCode"]//dataTicker[i]["CurrencyCode"];
            this.CompanyName = entry["Ticker"] + "\u2000/\u2000" + entry["Company"];
            this.CompanyTicker = entry["Ticker"] + " - Close";//"Close Price";
            this.Index = entry["Index"];
            this.CompanyTarget = entry["Ticker"] + " - Target";
            var companytickername = this.CompanyTicker;
       
            break;
        }

        if (dataTicker.length > 0) {
            var PreviousTicker = 0;
            var PreviousIndex = 0;
            var PreviousRelativevalue = 0;
            relativeData.push("RETN");
            chartDate.push('x');
            var RelativeValue = 0;
            for (let entry of dataTicker) {
                if (PreviousTicker == 0) {
                    PreviousTicker = entry["ClosePrice"];
                    PreviousIndex = entry["IndexClosePrice"];
                    this.MinRelative = PreviousTicker;
                    this.MaxRelative = PreviousTicker;
                }
                else {
                    RelativeValue = (((entry["ClosePrice"] / PreviousTicker)
                        - (entry["IndexClosePrice"] / PreviousIndex)) + 1) * 100;
                    relativeData.push(RelativeValue);
                    PreviousRelativevalue = RelativeValue;
                }
                if (this.MinRelative == 0) {
                    this.MinRelative = RelativeValue;
                    this.MaxRelative = RelativeValue;
                }
                if (Number(RelativeValue) > Number(this.MaxRelative)) {
                    this.MaxRelative = RelativeValue;
                }
                if (Number(RelativeValue) < Number(this.MinRelative)) {
                    if (RelativeValue > 100) {
                        var x = 0;
                    }
                    this.MinRelative = RelativeValue;
                }
            }
            var arr = [];
            var MinRelative = this.getRoundDown(this.MinRelative) - 10;
            var MaxRelative = this.getRoundup(this.MaxRelative);
            var noofiterMax = this.getRoundup(this.MaxRelative) / 5;
            var i = 0;
            for (i = MinRelative; i <= MaxRelative; i = i + noofiterMax) {
                arr.push(i);
            }
            var NoOfTick = 7;
var duration = this.duration;

            for (let entry of dataTicker) {
                if (i != 0)
                    chartDate.push(new Date(entry["Date"]));
                i++;
            };


            var yLabelTickerlength = this.MaxTicker.toString().length;
            if (yLabelTickerlength >= 7)
                yLabelTickerlength = 35;
            else if (yLabelTickerlength >= 4)
                yLabelTickerlength = 15;


            if (relativeData.length > 1) {
                this.TargetDataText = "";

                var chart = c3.generate({
                    bindto: this.bindto,
                    size: {
                        width: this.chartwidth,
                        height: 350
                    },
                    data: {
                        x: 'x',
                        columns: [chartDate, relativeData],
                        types: {
                            RETN: 'spline',
                        },
                        names: {
                            RETN: this.CompanyTicker
                        },
                        axes: {
                            RETN: 'y2',
                        },

                        keys: {
                            value: ['RETN'],
                        }
                    },
                    axis: {
                        y: {
                            show: false,
                            tick: {
                                count: 4,
                            }
                        },
                        y2: {
                            show: true,
                            // inner: false,
                            tick: {
                                count: 4,
                                format: function (obj: number): string {
                                    return  Math.ceil(obj).toString();
                                },
                                // values: arr
                            },
                            max: MaxRelative,
                            min: MinRelative,
                            padding: {
                                top: 0, bottom: 0
                            },
                            label:
                            {
                                text: '',
                                position: 'outer-middle'
                            },
                        },
                        x: {
                            type: 'timeseries',
                            height: 40,
                            tick: {
                                count: 8,
                                rotate: 0,
                                multiline: true,
                                width: 100,
                                outer: false,
                                // format: $scope.Format,
                                format: function (objDate: any): string {
                                    var date = objDate.getDate();
                                    var year = objDate.getFullYear();
                                    var month = monthNames[objDate.getMonth()]
                                    if (duration != '1m') {

                                        if (year == TickYear) {
                                            return month;
                                        }
                                        else {
                                            TickYear = year;
                                            TickMonth = month;
                                            return month + ' ' + TickYear;
                                        }
                                    }
                                    else {

                                        return date + '  ' + month + '     ' + year;

                                    }
                                },
                                centered: true,
                                culling: {
                                    max: 20 // the number of tick texts will be adjusted to less than this value
                                },
                                fit: true,

                            },
                            padding: {
                                left: 20,
                                right: 30
                            }
                        },
                    },
                    grid: {
                        y: {
                            show: true
                        }
                        // , x: {
                        //     show: true,

                        // }
                        
                    },
                    color: {
                        pattern: ['#C0219B', '#5e97f6']
                    },
                    legend: {
                        position: 'inset',
                        inset: {
                            anchor: 'top-left',
                            x: 300,
                            y: -30,
                            step: 1
                        }
                    },
                    padding: {
                        top: 30
                    },
                    point: {
                        r: 0,
                        focus: {
                            expand: {
                                r: 1
                            }
                        }
                    },
                    tooltip: {
                        position: function (data, ttWidth, ttHeight) {
                            var $$ = this;  // c3 internal
                            var top = ($$.currentHeight - ttHeight - $$.margin.top - $$.margin.bottom) / 2;  // centers the tool tip
                            var domainLeft = $$.x.orgDomain()[0],
                                domainRight = $$.x.orgDomain()[1];
                            var toolTipMargin = 20;

                            var ms_per_pixel = (domainRight - domainLeft) / $$.width;
                            var data_x = data[0].x;  // x Date value

                            var left = (data_x - domainLeft) / ms_per_pixel + $$.margin.left + toolTipMargin;
                            if (left + ttWidth - $$.margin.left + toolTipMargin > $$.width) {  // swap side
                                left = left - ttWidth - 2 * toolTipMargin;
                            }
                            return {
                                top: top, left: left
                            };
                        },
                        contents: function (d, defaultTitleFormat, defaultValueFormat, color) {
                            var $$ = this, config = $$.config, CLASS = $$.CLASS,
                                titleFormat = config.tooltip_format_title || defaultTitleFormat,
                                nameFormat = config.tooltip_format_name || function (name) { return name; },
                                valueFormat = config.tooltip_format_value || defaultValueFormat,
                                text, i, title, value, name, bgcolor;
                           
                            for (i = 0; i < d.length; i++) {
                                if (!(d[i] && (d[i].value || d[i].value === 0))) {
                                    continue;
                                }
                                if (d[i].name === 'dataTicker') {
                                    continue;
                                }
                                if (!text) {

                                    var date = new Date(d[0].x.toDateString());
                                    var year = date.getFullYear();
                                    var month = (1 + date.getMonth()).toString();
                                    var monthname = monthNames[date.getMonth()];
                                    var day = date.getDate().toString();
                                    day = day.length > 1 ? day : '0' + day;
                                    title = day + ' ' + monthname + ' ' + year;
                                    text = "<table class='" + CLASS.tooltip + "'>" + (title || title === 0 ? "<tr><th style=\"background-color: #6D6B64\" colspan='2'>" + title + "</th></tr>" : "");
                                }
                                name = nameFormat(d[i].name);
                                // value = valueFormat(d[i].value, d[i].ratio, d[i].id, d[i].index);
                                bgcolor = $$.levelColor ? $$.levelColor(d[i].value) : color(d[i].id);
                                text += "<tr class='" + CLASS.tooltipName + "-" + d[i].id + "'>";
                                if (d[i].name == companytickername) {
                                    text += "<td class='name'><span style='background-color:" + bgcolor + "; border-radius: 5px;'></span>" + companytickername; + "</td>";
                                    text += "<td class='value'>" + Number(d3.format('.2f')(d[i].value)).toFixed(2) + "</td>";
                                }
                                text += "</tr>";
                            }

                            text += "</tr></table>";

                            text += "</div>";
                            return text;
                        },
                    }
                });
            }
        }
        else {

            this.TargetDataText = "Chart is not available for this Ticker.";
        }
        TickYear = '';
        TickMonth = '';
        chart.flush();
    }

    public numberWithCommas(x) {
        var parts = x.toString().split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return parts.join(".");
    }

    public getRoundup(value) {
        return Math.ceil(Math.ceil(value / 10) * 10 + (Math.ceil(value / 10) * 10) * 5 / 100);
    }

    public getRoundDown(value) {
        return Math.floor((Math.floor(value / 10) * 10) - (Math.floor(value / 10) * 10) * 5 / 100);
    }
}