import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule, MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatButtonModule } from '@angular/material';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { BeehiveCommonModule } from '../beehive-components.module';
import { EventsUsageComponent } from './events-usage.component';
import { RouterModule, Routes } from '@angular/router';

const materialsModule = [MatDatepickerModule, MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
    MatButtonModule, MatProgressSpinnerModule];

const appRoutes: Routes = [
    { path: 'events-usage', component: EventsUsageComponent }
];

@NgModule({
    declarations: [EventsUsageComponent],
    imports: [AbGridModule, RouterModule.forRoot(appRoutes, {
        onSameUrlNavigation: 'reload'
    }), CommonModule, BeehiveCommonModule, AgGridModule.withComponents([]), BeehivePageHeaderModule, ...materialsModule, FormsModule, ReactiveFormsModule],
    providers: [],
    entryComponents: [EventsUsageComponent],
    exports: [EventsUsageComponent],
    bootstrap: [EventsUsageComponent]
})
export class EventsUsageModule {

}