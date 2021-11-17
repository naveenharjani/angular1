import { NgModule } from '@angular/core';
import { ProductGroupsComponent } from './product-groups.component';
import { AbGridModule } from '../ab-grid/ab-grid.module';
import { CommonModule } from "@angular/common";
import { MatSnackBarModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule,
     MatChipsModule, MatIconModule, MatDatepickerModule,  MatProgressSpinnerModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BeehiveCommonModule } from '../beehive-components.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ProductGroupComponent } from './product-group-form/product-group.component';
import { BeehivePageHeaderModule } from '../beehive-page-header/beehive-page-header.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { MatDialogModule,MatDialog } from '@angular/material'; 

let materialInputs = [MatFormFieldModule, MatInputModule, MatSelectModule, MatCardModule, MatChipsModule, MatIconModule,
    MatDatepickerModule, MatDialogModule, MatSnackBarModule, MatProgressSpinnerModule];


const appRoutes: Routes = [
    { path: 'productGroup', component: ProductGroupComponent },
];


@NgModule({
    declarations: [ProductGroupsComponent, ProductGroupComponent],
    imports: [AbGridModule, BeehiveCommonModule, CommonModule, RouterModule.forChild(appRoutes), ReactiveFormsModule,
        BeehivePageHeaderModule, ...materialInputs, FormsModule,NgSelectModule,NgOptionHighlightModule],
        providers: [
            { provide: MatDialogRef, useValue: {} },
            { provide: MAT_DIALOG_DATA, useValue: [] },
            // ...
        ],
    entryComponents: [ProductGroupComponent],
    exports: [ProductGroupsComponent,],
    bootstrap: [ProductGroupsComponent]
})
export class ProductGroupsModule {

}
