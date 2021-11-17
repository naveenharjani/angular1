
import { NgModule, Component } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ModelsComponent } from './models/models.component'; 
import { MasterdetailviewComponent } from './masterdetailview/masterdetailview.component';
import { DataGridComponent } from './data-grid/data-grid.component';
import { EmailFormComponent } from './email-form/email-form.component';
import { CartComponent } from './cart/cart.component';
import { AdminSecuritiesGridComponent } from './admin-securities/admin-securities-grid.component';
import { AdminIndustriesGridComponent } from './admin-industries/admin-industries-grid.component';
import { ProductGroupsComponent } from './product-groups/product-groups.component';
import { ResearchReadsComponent } from './research-reads/research-reads.component';
import { AssetsComponent } from './assets/assets.component';
import { ModelDownloadsComponent } from './model-downloads/model-downloads.component';
import { ContentUsageComponent } from './content-usage/content-usage.component';
import { EventsUsageComponent } from './events-usage/events-usage.component';
import {ResearchCoverageComponent} from './research-coverage/research-coverage.component';
import { DateFilterRangeComponent } from './shared/date-filter-range/date-filter-range.component';
import { FacebookComponent} from './facebook/facebook.component'
// import { SearchResults1Component } from './search-results1/search-results1.component';  
import {DistributionSitesComponent} from './distribution-sites/distribution-sites.component'
import { ResearchAdvanceSearchComponent } from './research-advance-search/research-advance-search.component';
import { IndustryFormNewComponent } from './admin-industries/industry-form-new/industry-form-new.component';
import {ChangeFeedEventsComponent} from './change-feed-events/change-feed-events.component';
import {MeetingReplaysComponent} from './meeting-replays/meeting-replays.component';
  
const appRoutes: Routes = [
  { path: 'models', component: ModelsComponent },
  { path: 'content-usage', component: ContentUsageComponent },
  { path: 'industries', component: AdminIndustriesGridComponent },
  { path: 'quota', component: MasterdetailviewComponent },
  { path: 'product-groups', component: ProductGroupsComponent },
  { path: 'securities', component: AdminSecuritiesGridComponent },
  { path: 'datagrid', component: DataGridComponent },
  { path: 'email', component: EmailFormComponent },
  { path: 'cart', component: CartComponent },
  { path: 'research-reads', component: ResearchReadsComponent },
  { path: 'assets', component: AssetsComponent },
  { path: 'model-downloads', component: ModelDownloadsComponent },
  { path: 'events-usage', component: EventsUsageComponent },
  { path:'research-coverage',component:ResearchCoverageComponent},
  { path:'calender', component:DateFilterRangeComponent},
  { path:'facebook', component:FacebookComponent},
 // { path: 'research1', component: SearchResults1Component }, 
  { path:'distribution-sites', component:DistributionSitesComponent},
  {path:'research',component:ResearchAdvanceSearchComponent },
  {path:'IndustryNew',component:IndustryFormNewComponent},
  {path:'change-feed-events', component:ChangeFeedEventsComponent},
  {path:'MeetingReplays', component:MeetingReplaysComponent}

  // { path: 'charts', component: PriceChartComponent },
  // { path: 'pricechart', component: PriceChartComponent },
  // { path: 'pricechart/:securityid', component: PriceChartComponent },
  // { path: 'pricechart/:securityid', component: PriceChartComponent },
  // { path: 'charts/pricechart', component: PriceChartComponent },
  // { path: 'charts/pricechart/:securityid', component: PriceChartComponent },
  // { path: 'charts/pricechart/:securityid/:image', component: PriceChartComponent },

  // { path: 'pricehistory/:securityid', component: PriceHistoryComponent },
  // { path: 'charts/pricehistory', component: PriceHistoryComponent },
  // { path: 'charts/pricehistory/:securityid', component: PriceHistoryComponent },
  // { path: 'charts/pricehistory/:securityid/:image', component: PriceHistoryComponent },

  // { path: 'relativereturn/:securityid', component: RelativeReturnComponent },
  // { path: 'charts/relativereturn', component: RelativeReturnComponent },
  // { path: 'charts/relativereturn/:securityid', component: RelativeReturnComponent },
  // { path: 'charts/relativereturn/:securityid/:image', component: RelativeReturnComponent },

  // { path: 'priceperformance/:securityid', component: PerformanceComponent },
  // { path: 'charts/priceperformance', component: PerformanceComponent },
  // { path: 'charts/priceperformance/:securityid', component: PerformanceComponent },
  // { path: 'charts/priceperformance/:securityid/:image', component: PerformanceComponent },

];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {


}


