
import { Directive } from '@angular/core';
import { Host, Self, Optional } from '@angular/core';
import { MatSelect } from '@angular/material';

@Directive({
    selector: '[beehiveSelect]',
})
export class BeehiveSelectDirective {
    
    constructor( @Host() @Self() @Optional() public hostSel : MatSelect) {
        
    }

    ngAfterViewInit(): void {
        this.hostSel._keyManager.withTypeAhead(600);
        this.hostSel.disableOptionCentering = true;
        
    }
}