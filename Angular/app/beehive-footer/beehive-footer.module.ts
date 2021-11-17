import { NgModule } from '@angular/core';
import { BeehiveFooterComponent } from './beehive-footer.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    declarations: [BeehiveFooterComponent],
    imports: [BrowserModule,
        FormsModule,],
    providers: [],
    entryComponents: [BeehiveFooterComponent],
    exports: [BeehiveFooterComponent],
    bootstrap: [BeehiveFooterComponent]
})
export class BeehiveFooterModule {


}
