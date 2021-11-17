import { IFloatingFilter, IFloatingFilterParams, TextFilterModel, TextFilter } from "@ag-grid-community/all-modules";
import { Component } from "@angular/core";
import { AgFrameworkComponent } from "ag-grid-angular";

export interface FilterIsActiveParams extends IFloatingFilterParams {
    value: string
}

@Component({
    template: `
            <select [(ngModel)]="currentValue" (change)="valueChanged()">
                    <option>All</option>
                    <option>Yes</option>
                    <option>No</option>
            </select>
    `
})
export class FilterIsActive implements IFloatingFilter, AgFrameworkComponent<FilterIsActiveParams> {

    params: FilterIsActiveParams;
    currentValue: string;

    agInit(params: FilterIsActiveParams): void {
        this.params = params;
        this.currentValue = this.params.value;
    }

    valueChanged() {
        let valueToUse = this.currentValue === 'All' ? null : this.currentValue;
        this.params.parentFilterInstance(function (instance) {
            (<TextFilter>instance).onFloatingFilterChanged('equals', valueToUse);
        });
    }
    onParentModelChanged(parentModel: TextFilterModel): void {
        if (!parentModel) {
            this.currentValue = 'All';
        } else {
            // note that the filter could be anything here, but our purposes we're assuming a greater than filter only,
            // so just read off the value and use that
            this.currentValue = parentModel.filter
        }
    }
}