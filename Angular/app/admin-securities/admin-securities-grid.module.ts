import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { MatSnackBarModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatChipsModule, MatIconModule, MatButtonModule, MatCheckboxModule, MatProgressSpinnerModule } from '@angular/material';
import { AdminSecuritiesGridComponent } from './admin-securities-grid.component';
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { BeehiveCommonModule } from '../beehive-components.module';
import { SecuritiesFormComponent } from './securities-form/securities-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AgGridModule } from 'ag-grid-angular';
import { FilterIsActive } from './admin-securities-grid.filter';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { BeehiveMessageService } from '../shared/message-service';
import {NewSecuritiesFormComponent} from './new-securities-form/new-securities-form.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

let materialInputs = [DragDropModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatChipsModule,
    MatIconModule, MatButtonModule, MatCheckboxModule, MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule];

@NgModule({
    declarations: [AdminSecuritiesGridComponent, SecuritiesFormComponent, FilterIsActive,NewSecuritiesFormComponent],
    imports: [AbGridModule, BeehiveCommonModule, CommonModule, ReactiveFormsModule, FormsModule, ...materialInputs,
        AgGridModule.withComponents([FilterIsActive]), BeehivePageHeaderModule,NgSelectModule,NgOptionHighlightModule],
    providers: [BeehiveMessageService],
    entryComponents: [SecuritiesFormComponent, NewSecuritiesFormComponent],
    exports: [AdminSecuritiesGridComponent],
    bootstrap: [AdminSecuritiesGridComponent]
})
export class AdminSecuritiesGridModule {

}
