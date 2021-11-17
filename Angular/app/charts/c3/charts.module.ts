import { NgModule } from '@angular/core';
import { ChartsComponent } from './charts.component';
import { PriceChartComponent } from './PriceChart/pricechart.component';
import { PriceHistoryComponent } from './pricehistory/pricehistory.component';
import { RelativeReturnComponent } from './relativereturn/relativereturn.component';
import { PerformanceComponent } from './performance/performance.component';
import { CommonModule, DatePipe} from '@angular/common';
import { FormsModule,ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { BeehivePageHeaderModule } from '../../beehive-page-header/beehive-page-header.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

import {
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatAutocompleteModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatGridListModule,
    MatSidenavModule,
    MatChipsModule,
    MatListModule, 
    MatSelectModule
} from '@angular/material';
import { BeehiveCommonModule } from '../../beehive-components.module';





const appRoutes: Routes = [
   
    {path: 'charts', component: ChartsComponent , children: [
        { path: '', component: PriceChartComponent },
        { path: 'pricechart', component: PriceChartComponent },
        { path: 'pricechart/:securityid', component: PriceChartComponent },
        { path: 'pricechart/:securityid/:image', component: PriceChartComponent },
       
        { path: 'pricehistory/:securityid', component: PriceHistoryComponent },
        { path: 'pricehistory/:securityid/:image', component: PriceHistoryComponent },

        { path: 'relativereturn', component: RelativeReturnComponent },
        { path: 'relativereturn/:securityid', component: RelativeReturnComponent },
        { path: 'relativereturn/:securityid/:image', component: RelativeReturnComponent },

        { path: 'priceperformance', component: PerformanceComponent },
        { path: 'priceperformance/:securityid', component: PerformanceComponent },
        { path: 'priceperformance/:securityid/:image', component: PerformanceComponent }
    ]}
  ];

@NgModule({
    declarations: [
        ChartsComponent,
        PriceChartComponent,
        PriceHistoryComponent,
        RelativeReturnComponent,
        PerformanceComponent],

    imports: [CommonModule, FormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCardModule,
        MatAutocompleteModule,
        MatIconModule,
        MatToolbarModule,
        MatButtonModule,
        MatMenuModule,
        MatBadgeModule,
        MatGridListModule,
        MatSidenavModule,
        MatChipsModule,
        MatListModule, 
        MatSelectModule,
        BeehivePageHeaderModule,
        RouterModule.forRoot(appRoutes),
        ReactiveFormsModule,
        BeehiveCommonModule,
        NgSelectModule,
        NgOptionHighlightModule
    ],
    providers: [DatePipe],
    entryComponents: [],
    exports: [ChartsComponent,
        PriceChartComponent,
        PriceHistoryComponent,
        RelativeReturnComponent,
        PerformanceComponent],
    bootstrap: [ChartsComponent]
})
export class ChartModule {

}
