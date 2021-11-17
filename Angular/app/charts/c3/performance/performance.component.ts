import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DataService } from '../../../shared/data.service';
import { DatePipe } from '@angular/common'

import * as d3 from 'd3';
import * as c3 from 'c3';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'performance-chart',
    templateUrl: './performance.component.html',
    styleUrls: ['./performance.component.css']
})
export class PerformanceComponent implements OnInit, OnChanges {
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
    CompanyTickerPer: string;
    IndexPer: string;
    duration: string = "3y";
    
    Format: string;
    Count: number=8;
    is1M: boolean = false;
    is3M: boolean = false;
    is6M: boolean = false;
    is1Y: boolean = false;
    is2Y: boolean = false;
    is3Y: boolean = true;

    chart: { securityid: string, type: string, image: string };
    constructor(private apiService: DataService, public datepipe: DatePipe, private route: ActivatedRoute
        , private router: Router) { }
    ngOnInit() {
        this.todaysDate = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');

        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: 'priceperformance',
            image: this.route.snapshot.params['image']

        };

        this.route.params.subscribe(params => {
            this.chart = {
                securityid: this.route.snapshot.params['securityid'],
                type: 'priceperformance',
                image: this.route.snapshot.params['image']

            };
        });
        if (this.ticker == null) {
            this.getTickers();

        }
        // this.apiService.setChartValue(this.ticker, this.type);
        if (this.ticker != null)
            this.getChartData();
    }

    works() {
        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: 'priceperformance',
            image: this.route.snapshot.params['image']

        };

        this.route.params.subscribe(params => {
            this.chart = {
                securityid: this.route.snapshot.params['securityid'],
                type: 'priceperformance',
                image: this.route.snapshot.params['image']

            };
        });

        return this.chart;
    }

    ngOnChanges() {
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
    public getChartData() {
        const result = (this.apiService.getTickers()).find(tickers => tickers.Ticker === this.chart.securityid);
        this.apiService.getChartData(this.ticker, this.type, result.Value, this.duration).subscribe((data: Array<object>) => {
            this.charts = data;
            this.flag = true;

            if (this.chart.type == "priceperformance")
                this.Performance(data, this.datepipe);
        });
    }

    //This method binds data for the charttype pricehistory.
    public Performance(response, datepipe) {
        var json1 = response.closePrices;
        var json2 = response.targetPrices;

        this.bindto = '#chart';
        this.chartwidth = 800;


        var RelativeTickerData = [];
        var RelativeIndexData = [];
        var DateDate = [];

        var TargetconvertedData = [];
        var limit = 1000;

        var dataTicker = json1;

        this.CurrencyCode = "";
        this.CompanyName = "";
        this.CompanyTicker = "";
        this.Index = "";
        this.CompanyTarget = "";

        var TickYear = 0;
        let TickMonth = "";
        let MaxTicker = 0;
        let MinTicker = 0;

        for (let entry of dataTicker) {
            this.CurrencyCode = entry["CurrencyCode"]//dataTicker[i]["CurrencyCode"];
            this.CompanyName = entry["Ticker"] + "\u2000/\u2000" + entry["Company"];
            this.CompanyTicker = entry["Ticker"] + " - Close";
            this.CompanyTarget = entry["Ticker"] + " - Target";
            this.CompanyTickerPer = entry["Ticker"];
            this.Index = entry["Index"];
            this.CompanyTarget = "Target Price";
            this.IndexPer = entry["Index"];
            var companytickernamePer = this.CompanyTickerPer;
            var IndexPer = this.IndexPer;
            break;
        }

        MaxTicker = 0;
        MinTicker = 0;
        var duration = this.duration;
        if (dataTicker.length > 0) {
            var StartIndex = 0;
            var MaxRelativeTicker = 0;
            var MinRelativeIndex = 0;
            var MinRelativeTicker = 0;
            var MaxRelativeIndex = 0;
            RelativeIndexData.push("Index");
            var StartTicker = 0;
            RelativeTickerData.push("Ticker");
            DateDate.push('x');
            for (let entry of dataTicker) {

                if (StartIndex == 0) {
                    StartIndex = entry["IndexClosePrice"];
                    MinRelativeIndex = 0;
                    MaxRelativeIndex = 0;
                    RelativeIndexData.push(0);
                }
                else {
                    var RelativeIndex = ((entry["IndexClosePrice"] - StartIndex) / StartIndex) * 100;
                    RelativeIndexData.push(RelativeIndex);
                }
                if (Number(RelativeIndex) > Number(MaxRelativeIndex)) {
                    MaxRelativeIndex = RelativeIndex;
                }
                if (Number(RelativeIndex) < Number(MinRelativeIndex)) {
                    MinRelativeIndex = RelativeIndex;
                }

                if (StartTicker == 0) {
                    StartTicker = entry["ClosePrice"];
                    MaxRelativeTicker = 0;
                    MaxRelativeTicker = 0;
                    RelativeTickerData.push(0);
                }
                else {
                    var RelativeTicker = ((entry["ClosePrice"] - StartTicker) / StartTicker) * 100;
                    RelativeTickerData.push(RelativeTicker);
                }
                if (Number(RelativeTicker) > Number(MaxRelativeTicker)) {
                    MaxRelativeTicker = RelativeTicker;
                }
                if (Number(RelativeTicker) < Number(MinRelativeTicker)) {
                    MinRelativeTicker = RelativeTicker;
                }
                DateDate.push(new Date(entry["Date"]));
            }



            if (MaxRelativeIndex > MaxRelativeTicker)
                MaxRelativeTicker = MaxRelativeIndex;

            if (MinRelativeIndex < MinRelativeTicker)
                MinRelativeTicker = MinRelativeIndex;

            var NoOfTick = 7;
            var arr = [];

            var MinRelativeTicker = this.getRoundDown(MinRelativeTicker);
            var noofiter = -(this.getRoundDown(MinRelativeTicker / 5));
            var noofiterMax = (this.getRoundup(MaxRelativeTicker / 5));
            if (noofiter < noofiterMax)
                noofiter = noofiterMax;
            var i;
            for (i = 0; i <= -(this.getRoundDown(MinRelativeTicker)); i = i + noofiter) {
                if (i != 0)
                    arr.push(-i);
            }
            var MaxRelativeTicker = this.getRoundup(MaxRelativeTicker);

            for (i = 0; i <= MaxRelativeTicker; i = i + noofiter) {
                arr.push(i);
            }
            var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            if (RelativeTickerData.length > 1) {

                this.TargetDataText = "";
                var chart = c3.generate({
                    bindto: this.bindto,
                    size: {
                        width: this.chartwidth,
                        height: 350
                    },
                    data: {
                        x: 'x',
                        columns: [DateDate, RelativeTickerData, RelativeIndexData],
                        types: {
                            Ticker: 'spline',
                            Index: 'spline',
                        },
                        names: {
                            Index: this.IndexPer,
                            Target: this.CompanyTarget,
                            Ticker: this.CompanyTickerPer
                        },
                        axes: {

                            Ticker: 'y2',
                            Index: 'y2',
                        },
                        keys: {
                            value: ['Ticker', 'Index'],
                        }
                    },
                    axis: {
                        y: {
                            show: false,
                            tick: {
                                count: 4,
                            }
                        },
                        y2:
                        {
                            show: true,
                            // inner: false,

                            tick: {
                                count: NoOfTick,
                                format: function (d) {
                                    return d + "%"
                                },
                                values: arr
                            },
                            max: MaxRelativeTicker,
                            min: MinRelativeTicker,
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
                            height: 50,
                            tick: {
                                count: this.Count,
                                rotate: 0,
                                multiline: true,
                                width: 100,
                                outer: false,
                                format: function (objDate: Date): string {
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
                                fit: true

                            },
                            padding: {
                                left: 20,
                                right: 30
                            }
                        },

                    },
                    grid: {
                        // x: {
                        //     show: true,
                        // },
                        y: {
                            show: true,
                            lines: [
                                { value: 0, text: '', axis: 'y2', position: 'middle', class: 'grid800' },
                            ]
                        },
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
                                if (d[i].name == companytickernamePer) {
                                    text += "<td class='name'><span style='background-color:" + bgcolor + "; border-radius: 5px;'></span>" + companytickernamePer.replace(/\s+/g, ''); + "</td>";
                                    text += "<td class='value'>" + Number(d3.format('.2f')(d[i].value)).toFixed(2) + '%' + "</td>";
                                }
                                if (d[i].name == IndexPer) {
                                    text += "<td class='name'><span style='background-color:" + bgcolor + "; border-radius: 5px;'></span>" + IndexPer.replace(/\s+/g, ''); + "</td>";
                                    text += "<td class='value'>" + Number(d3.format('.2f')(d[i].value)).toFixed(2) + '%' + "</td>";
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