import { NgModule} from '@angular/core';
import {BeehiveSelectDirective} from './shared/beehive-select.directive'

@NgModule({
    declarations: [BeehiveSelectDirective],
    exports:[BeehiveSelectDirective]
   })
   export class BeehiveCommonModule{}