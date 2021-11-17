import { FacebookComponent } from './facebook/facebook.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ApplicationRef } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LocationStrategy, HashLocationStrategy, DecimalPipe } from '@angular/common';

//import { ApplicationRef } from ' '
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './material.module';
import { AppComponent } from './app.component';
import { CookieModule } from 'ngx-cookie';
import { DataService } from './shared/data.service';
//import { ResearchComponent } from './research/research.component';
import { BeehiveCookiesService } from './shared/cookies.service';
import {
    // Window,
    WINDOW_TOKEN
} from './shared/active-xobject.service';

import { UtilityService } from './shared/utility.service';


import { APP_BASE_HREF } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import 'ag-grid-enterprise';
import { ResearchUsageComponent } from './research-usage/research-usage.component';
import { MasterdetailviewComponent } from './masterdetailview/masterdetailview.component';
import { DetailCellRendererComponent } from './detail-cell-renderer/detail-cell-renderer.component';
import { BeehiveHeaderComponent } from './beehive-header/beehive-header.component';
import { TypeaheadComponent } from './typeahead/typeahead.component';
import { UserInfoComponent } from './user-info/user-info.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { UrlDecode } from './shared/urldecode.pipe';
import { HighlightSearch } from './typeahead/typeahead.component'; 
import { AbGridModule } from './ab-grid/ab-grid.module';
import { MatSelectModule, MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule, MatProgressSpinnerModule } from '@angular/material';
import { ChartModule } from './charts/c3/charts.module';
import { EnvServiceProvider } from '../env.service.provider'; 
import { SaveQueryComponent } from './research-advance-search/save-query.component';
import { BeehiveFooterComponent } from './beehive-footer/beehive-footer.component';
import { BeehiveFooterModule } from './beehive-footer/beehive-footer.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CacheService } from './shared/cache.service';
import { BeehivePageHeaderComponent } from './beehive-page-header/beehive-page-header.component';
import { AppRoutingModule } from './app-routing.module';
import { BeehivePageHeaderModule } from './beehive-page-header/beehive-page-header.module';
import { OptionsTemplateComponent } from './research/research-grid-templates/options-template/options-template.component';
import { TooltipTemplateComponent } from './research/research-grid-templates/tooltip-template/tooltip-template.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BeehiveCommonModule } from './beehive-components.module';
import { DataGridModule } from './data-grid/data-grid.module';
import { ModelsFiltersComponent } from './models/models-filters/models-filters.component';
import { MdePopoverModule } from '@material-extended/mde';
import { ModelsModule } from './models/models.module';
import { EmailFormModule } from './email-form/email-form.module';
import { CartModule } from './cart/cart.module';
import { AdminSecuritiesGridModule } from './admin-securities/admin-securities-grid.module';
import { AdminModule } from './admin-industries/admin-industries-grid.module';
import { ProductGroupsModule } from './product-groups/product-groups.module';
import { ResearchReadsModule } from './research-reads/research-reads.module';
import { AssetsModule } from './assets/assets.module';
import { MatSelectSearchModule } from './shared/mat-select-search/mat-select-search.module';
import { ConfirmDialogModule } from './shared/confirm-dialog/confirm-dialog.module';
import { ModelDownloadsModule } from './model-downloads/model-downloads.module';
import { BeehiveMessageService } from './shared/message-service';
import { ContentUsageModule } from './content-usage/content-usage.module';
import { EventsUsageComponent } from './events-usage/events-usage.component';
import { EventsUsageModule } from './events-usage/events-usage.module';
import { GlobaldataService } from './shared/globaldata.service';
import { AgGridCheckboxComponent } from './shared/checkbox-renderer/checkbox-renderer.component';
//import { JwtInterceptor } from './Auth/jwt.interceptor'; 
import { ResearchCoverageComponent } from './research-coverage/research-coverage.component';
import {DateFilterRangeComponent} from './shared/date-filter-range/date-filter-range.component';
import {DistributionSitesComponent} from './distribution-sites/distribution-sites.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { Ng2FlatpickrModule } from 'ng2-flatpickr';
import { ResearchAdvanceSearchComponent } from './research-advance-search/research-advance-search.component';
import { SaveAsDialogModule } from './shared/save-as-dialog/save-as-dialog.module';
import {ChangeFeedEventsComponent} from './change-feed-events/change-feed-events.component';
import { XmlViewerComponent} from './change-feed-events/xml-viewer/xml-viewer.component';
import { MeetingReplaysComponent } from './meeting-replays/meeting-replays.component';

let windowtoken: any = window;

@NgModule({
    declarations: [
        AppComponent,
        ResearchUsageComponent,
        MasterdetailviewComponent,
        DetailCellRendererComponent,
        BeehiveHeaderComponent,
        TypeaheadComponent,
        UserInfoComponent,
        TooltipComponent,
        UrlDecode,
        HighlightSearch, 
       // ResearchComponent, 
        SaveQueryComponent, 
        OptionsTemplateComponent,
        TooltipTemplateComponent,
        ModelsFiltersComponent,
        AgGridCheckboxComponent,
        ResearchCoverageComponent,
        DateFilterRangeComponent,
        FacebookComponent,        
        DistributionSitesComponent ,
        ResearchAdvanceSearchComponent,   
        ChangeFeedEventsComponent,
        XmlViewerComponent,
        MeetingReplaysComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MatTooltipModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        HttpClientModule,
        BeehiveCommonModule,
        AgGridModule.withComponents([DetailCellRendererComponent]),
        AbGridModule,
        AdminModule,
        ProductGroupsModule,
        MatSelectModule,
        ChartModule,
        CookieModule.forRoot(),
        BeehivePageHeaderModule,
        // ChartsModule,
        //RouterModule.forRoot(appRoutes, { onSameUrlNavigation: 'reload' }),
        AppRoutingModule,
        BeehiveFooterModule,
        FlexLayoutModule,
        AdminSecuritiesGridModule,
        DataGridModule,
        MdePopoverModule,
        ModelsModule,
        EmailFormModule,
        MatSelectModule,
        MatFormFieldModule,
        CartModule,
        ResearchReadsModule,
        MatProgressSpinnerModule,
        AssetsModule,
        MatSelectSearchModule,
        ConfirmDialogModule,
        ModelDownloadsModule,
        ContentUsageModule,
        EventsUsageModule,
        // AdvanceResearch2Module,	 
        NgSelectModule,
        NgOptionHighlightModule,
        Ng2FlatpickrModule,
        SaveAsDialogModule, 
    ],
    providers: [
        DataService, EnvServiceProvider, CacheService, BeehiveCookiesService, UtilityService, { provide: APP_BASE_HREF, useValue: '/' }, { provide: LocationStrategy, useClass: HashLocationStrategy }, { provide: WINDOW_TOKEN, useValue: windowtoken },
        { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } }, BeehiveMessageService,GlobaldataService, DecimalPipe
      //  { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },   
    ],

    entryComponents: [AppComponent,
        ResearchUsageComponent,  TooltipComponent, MasterdetailviewComponent, TypeaheadComponent, BeehiveHeaderComponent, //ResearchComponent,
        //SearchResultsComponent, 
        SaveQueryComponent, //LoadQueryDialogComponent,
        TooltipComponent, MasterdetailviewComponent, TypeaheadComponent
        , BeehiveHeaderComponent, //AdvancedSearchComponent,
         OptionsTemplateComponent, TooltipTemplateComponent, AgGridCheckboxComponent, XmlViewerComponent],

    // bootstrap: [AppComponent, HeaderComponent]
    exports: [MatSelectModule]
})
export class AppModule {

    // constructor(private injector : Injector){

    //     const header = createCustomElement(BeehiveHeaderComponent, {
    //       injector : this.injector
    //     });

    //     const models = createCustomElement(ModelsComponent, {
    //         injector : this.injector
    //       });

    //       const filter = createCustomElement(FilterComponent, {
    //         injector : this.injector
    //       });

    //       const root = createCustomElement(AppComponent, {
    //         injector : this.injector
    //       });

    //     customElements.define('beehive-root', root);  
    //     customElements.define('beehive-header', header);
    //     customElements.define('app-models', models);
    //     customElements.define('app-filter', filter);
    //   }

    //   ngDoBootstrap(){

    //   }

    ngDoBootstrap(appRef: ApplicationRef) {


        if (document.querySelector('beehive-root')) {
            appRef.bootstrap(AppComponent);
        }
        if (document.querySelector('app-research-usage')) {
            appRef.bootstrap(ResearchUsageComponent);
        }     
        if (document.querySelector('app-masterdetailview')) {
            appRef.bootstrap(MasterdetailviewComponent);
        }
        if (document.querySelector('beehive-header')) {
            appRef.bootstrap(BeehiveHeaderComponent);
        }
        if (document.querySelector('typeahead')) {
            appRef.bootstrap(TypeaheadComponent);
        }
        if (document.querySelector('user-info')) {
            appRef.bootstrap(UserInfoComponent);
        }
        
        // if (document.querySelector('price-chart')) {
        //     appRef.bootstrap(PriceChartComponent);
        // }
        // if (document.querySelector('C3-Chart')) {
        //     appRef.bootstrap(ChartsComponent);
        // }
        
        // if (document.querySelector('app-search-results')) {
        //     appRef.bootstrap(SearchResultsComponent);
        // }
        // if (document.querySelector('app-advanced-search')) {
        //     appRef.bootstrap(AdvancedSearchComponent);
        // }
        if (document.querySelector('app-beehive-footer')) {
            appRef.bootstrap(BeehiveFooterComponent)
        }
        if (document.querySelector('app-beehive-page-header')) {
            appRef.bootstrap(BeehivePageHeaderComponent)
        }
        //if we add these component to other component need to comment manual bootstrap 



    }
}
