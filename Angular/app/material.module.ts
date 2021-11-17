import { NgModule } from '@angular/core';

import {
    MatFormFieldModule, 
    MatInputModule,
    MatCheckboxModule,
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
    MatTabsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule
} from '@angular/material';

@NgModule({
  imports: [
    MatFormFieldModule, 
    MatInputModule,
    MatAutocompleteModule,
    MatIconModule, 
    MatToolbarModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatGridListModule,
    MatBadgeModule,
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule
  ],
  exports: [
    MatFormFieldModule, 
    MatInputModule,
    MatIconModule,
    MatAutocompleteModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatMenuModule,
    MatGridListModule,
    MatBadgeModule, 
    MatCardModule,
    MatChipsModule,
    MatListModule,
    MatTabsModule,
    MatCheckboxModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule
  ]
})
export class MaterialModule {}