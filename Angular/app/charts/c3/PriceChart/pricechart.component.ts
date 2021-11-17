import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { DataService } from '../../../shared/data.service';
import { DatePipe, DecimalPipe } from '@angular/common'

import * as d3 from 'd3';
import * as c3 from 'c3';
import { Router, ActivatedRoute } from '@angular/router';


@Component({
    selector: 'price-chart',
    templateUrl: './pricechart.component.html',
    styleUrls: ['./pricechart.component.css'],
    providers:[DecimalPipe]
   
})
export class PriceChartComponent implements OnInit, OnChanges {

    chart: { securityid: number, type: string, image: string };
    @Input() ticker: any;
    @Input() type: string;

    private tickers: Array<object> = [];
    private charts: Array<object> = [];
    uniqueRatingAction=[];
    jsonClosePrices:any;
    jsonTargetPrices:any;
    selectedTicker: any;
    selectedType: string;

    
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
    
    ApplicationName: string;
    chartheight: number = 350;
    ClosePriceChartType: string = 'spline';
    TargetChartType: string = 'area-step';
 
    strDate?: string;
    todaysDate: string;
    currentTicker: number;
    flag: boolean;

    constructor(private apiService: DataService,
        public datepipe: DatePipe
        , private route: ActivatedRoute
        , private router: Router
        ,private decimalPipe:DecimalPipe
    ) { }
    ngOnInit() {

        this.todaysDate = this.datepipe.transform(new Date(), 'dd-MMM-yyyy');
        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: 'pricechart',
            image: this.route.snapshot.params['image']

        };

        this.route.params.subscribe(params => {

            this.chart = {
                securityid: this.route.snapshot.params['securityid'],
                type: 'pricechart',
                image: this.route.snapshot.params['image']

            };

        });
        //this.apiService.setChartValue(this.ticker,this.type);
        if (this.ticker == null) {
            this.getTickers();

        }

        if (this.ticker != null)
            this.getChartData();
    }

    public onlyUnique(value, index, self) { 
        return self.indexOf(value) === index;
    }
    public getTickers() {
        this.apiService.GetMetaDataFields("ticker",2).subscribe((data: Array<object>) => {
            this.tickers = data;
            this.apiService.saveTickers(this.tickers);
            this.ticker = this.chart.securityid;
            this.getChartData();
        });
    }

    works() {
        this.chart = {
            securityid: this.route.snapshot.params['securityid'],
            type: 'pricechart',
            image: this.route.snapshot.params['image']

        };

        this.route.params.subscribe(params => {
            this.chart = {
                securityid: this.route.snapshot.params['securityid'],
                type: 'pricechart',
                image: this.route.snapshot.params['image']

            };
        });
        // console.table(this.chart);
        return this.chart;
    }
    onTypeChange(charttype) {
    }
    ngOnChanges() {

        this.getChartData();
    }

    public getChartData() {
        const result = (this.apiService.getTickers()).find(tickers => tickers.Ticker === this.chart.securityid);
        if(result){
            this.apiService.getChartData(this.ticker, this.type, result.Value,'3y').subscribe((data: Array<object>) => {
                this.charts = data;
                this.flag = true;
                this.PriceChart(data, this.datepipe);
            });
        }

    }

    public PriceChart(response, datepipe) {
        this.jsonClosePrices = response.closePrices;
        this.jsonTargetPrices = response.targetPrices;
        var arrRatingAction = [];
        for (let entry of response.targetPrices) {
            arrRatingAction.push(entry["RatingActionCode"]);
        }
        this.uniqueRatingAction = arrRatingAction.filter( this.onlyUnique );

        var TickYear = 0;
        let TickMonth = "";
        let MaxTicker = 0;
        let MinTicker = 0;

       
        this.bindto = '#chart'
       
        if(this.chart.image == 'yes'){
           this.chartheight = 250;
           this.chartwidth = 625;
        }
           else{
           this.chartheight = 300;
           this.chartwidth = 650;
           }
        TickYear = 0;
      
        if (this.jsonTargetPrices.length == 0)
            this.noCoverage = 'No coverage data'
        else
            this.noCoverage = '';

        var arrClosePrice = [];
        var arrDate = [];
        var arrTagetPrice = [];

        var dataTicker = this.jsonClosePrices;
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        this.CurrencyCode = "";
        this.CompanyName = "";
        this.CompanyTicker = "";
        this.BenchmarkIndex = "";
        this.CompanyTarget = "";

        for (let entry of dataTicker) {
            this.CurrencyCode = entry["CurrencyCode"];
            this.CompanyName = entry["Ticker"] + "\u2000/\u2000" + entry["Company"];
            this.CompanyTicker = "Close Price";
            this.BenchmarkIndex = entry["Index"];
            this.CompanyTarget = "Target Price";
            break;
        }

        MaxTicker = 0;
        MinTicker = 0;

        var companytickername = this.CompanyTicker;
        var companyticker = this.CompanyTicker;
        var companytarget = this.CompanyTarget;


        if (dataTicker.length > 0) {
            arrClosePrice.push("Ticker");
            arrTagetPrice.push("Target");
            arrDate.push('x');
          
            for (let entry of dataTicker) {
          
              
                arrDate.push(new Date(entry["Date"]));
               
                arrClosePrice.push(entry["ClosePrice"]);
                if (MinTicker == 0)
                    MinTicker = entry["ClosePrice"];

                if (Number(entry["ClosePrice"]) > Number(MaxTicker)) {
                    MaxTicker = entry["ClosePrice"];
                }
                if (Number(entry["ClosePrice"]) < Number(MinTicker)) {
                    MinTicker = entry["ClosePrice"];
                }

                arrTagetPrice.push(entry["TargetPrice"]);
                if (Number(entry["TargetPrice"]) > Number(MaxTicker)) {
                    MaxTicker = entry["TargetPrice"];
                }
                if (Number(entry["TargetPrice"]) < Number(MinTicker)) {
                    if (entry["TargetPrice"] != 0 && entry["TargetPrice"] != null )
                        MinTicker = entry["TargetPrice"];
                }
            }

            const RoundMaxValue = this.getRoundup(MaxTicker);
            const RoundMinTicker = this.getRoundDown(MinTicker);
            let tickcount = 8

           var startDate = arrDate[1];
           var endDate = arrDate[arrDate.length-1];
           var diffc = endDate.getTime() - startDate.getTime();
           //getTime() function used to convert a date into milliseconds. This is needed in order to perform calculations.
          
           var days = Math.round(Math.abs(diffc/(1000*60*60*24)))


            if(days<=240)
                tickcount = 5

            if (arrClosePrice.length > 1 && TickYear == 0) {
                
                var chart = c3.generate({
                    bindto: this.bindto,
                    size: {
                        width: this.chartwidth,
                        height: this.chartheight,
                    },

                    data: {
                        x: 'x',
                        xFormat: '%Y-%m-%d',
                        columns: [arrDate, arrClosePrice, arrTagetPrice],
                        types: {
                            Ticker: 'spline',
                            Target: 'area-step',

                        },
                        names: {
                            Target: this.CompanyTarget,
                            Ticker: this.CompanyTicker
                        },
                        axes: {
                            "Ticker": 'y2',
                            "Target": 'y2'
                        }
                    },

                    line: {
                        step: {
                            type: 'step-after'
                        }
                    },
                    axis:
                    {

                        x: {
                            type: 'timeseries',
                            height: 40,
                            tick: {

                                count: tickcount,
                                outer: false,
                                rotate: 0,
                                multiline: true,

                                width: 40,
                                centered: true,

                                fit: true,
                                culling: {
                                    max: 20
                                },
                                format: function (objDate: any): string {
                                    var year = objDate.getFullYear();
                                    var monthName = monthNames[objDate.getMonth()];
                                    var date = objDate.getDate();
                                 if(days >=240)
                                 {
                                    if (year == TickYear && monthName == TickMonth)
                                    {
                                       
                                        return monthName + ' ' + TickYear;
                                    }
                                    
                                    if (year == TickYear) {
                                        return monthName;
                                    }
                                    
                                    else {
                                        TickYear = year;
                                        TickMonth = monthName;
                                        return monthName + ' ' + TickYear;
                                    }
                                }
                                else
                                {
                                    return date + '  ' + monthName + '     ' + year;
                                }
                                }


                            },
                            padding: {
                                left: 0,
                                right: 0
                            }
                        },
                        y: {
                            show: false,

                            tick: {
                                count: 4
                            }
                        },
                        y2: {
                            tick: {
                                count: 4,
                                format: function (obj: number): string {
                                   var y2num =  Math.ceil(obj).toString()
                                   .replace(/\B(?=(\d{3})+(?!\d))/g, ",");


                                //    var lenMax = RoundMaxValue.toString()
                                //    .replace(/\B(?=(\d{3})+(?!\d))/g, ",").length;
                                //    var lenMin = y2num.length;
                                //    if(lenMin == lenMax)
                                //       return y2num
                                //    else{
                                //        var x= lenMax-lenMin;
                                //        var str= "";
                                //        for(var i=0;i<x;i++)
                                //        {
                                //         str = str +"\u2000";
                                //        }
                                //        return str +y2num;
                                //    }
                                // },
                                return y2num;
                                }
                                
                            },
                            show: true,
                            max: RoundMaxValue,
                            min: RoundMinTicker,
                       

                            padding: {
                                top: 0, bottom: 0
                            },
                            label:
                            {
                                text: '',
                                position:'outer-right'
                              
                            },
                        }
                    },
                    padding: {
                        top: 30
                    },
                    point: {
                        r: 0,
                    },
                    color: {
                        pattern: ['#C0219B', '#5e97f6']
                    },
                    legend: {
                        position: 'inset',
                        inset: {
                            anchor: 'top-left',
                            x: 200,
                            y: -30,
                            step: 1
                            
                        },
                        item:{
                            tile:{
                                height:500
                            }
                        }
                    },
                    grid: {
                        y: {
                            show: true
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
                                    text += "<td class='name'><span style='background-color:" + bgcolor + "; border-radius: 5px;'></span>" + companyticker.replace(/\s+/g, ''); + "</td>";
                                    text += "<td class='value'>" + Number((d[i].value)).toFixed(2) + "</td>";
                                }
                                if (d[i].name == companytarget && Number((d[i].value))) {
                                    text += "<td class='name'><span style='background-color:" + bgcolor + "; border-radius: 5px;'></span>" + companytarget.replace(/\s+/g, ''); + "</td>";
                                    text += "<td class='value'>" + Number((d[i].value)).toFixed(2) + "</td>";
                                }
                                text += "</tr>";
                            }
                            text += "</tr></table>";
                            text += "</div>";
                            return text;
                        },
                    }

                });
                TickYear = 0;
                this.flag = false;
            }
        }
        chart.flush();
    }


    // public numberWithCommas(x) {
    //     var parts = x.toString().split(".");
    //     parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    //     return parts.join(".");
    // }

    public getRoundup(value) {
        return Math.ceil(Math.ceil(value / 10) * 10 + (Math.ceil(value / 10) * 10) * 5 / 100);
    }

    public getRoundDown(value) {
        return Math.floor((Math.floor(value / 10) * 10) - (Math.floor(value / 10) * 10) * 5 / 100);
    }

    public numberWithCommas(x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    public formatted_string(pad, user_str, pad_pos)
{
  
}
}