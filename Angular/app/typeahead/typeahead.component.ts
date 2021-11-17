import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import {Observable, of} from 'rxjs';
import {FormControl} from '@angular/forms';
import {DataService} from '../shared/data.service';
import {debounceTime, switchMap, startWith, distinctUntilChanged,map } from 'rxjs/operators';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';
import {MatAutocomplete, MatAutocompleteTrigger, MatFormField} from '@angular/material';

// import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'typeahead',
  templateUrl: './typeahead.component.html',
  styleUrls: ['./typeahead.component.css'],
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        width: '200px'
      })),
      state('out', style({
        width: '450px'
      })),
      transition('in => out', animate('500ms ease-in-out')),
      transition('out => in', animate('500ms ease-in-out'))
    ])
  ]
 // encapsulation : ViewEncapsulation.Native
})
export class TypeaheadComponent implements OnInit{
  //@Input() searchUrl : string;
  @Input() groupByField : string;
  searchResults$  :Observable<any[]>
  searchCtrl : FormControl = new FormControl();
  searchText : string;
  inputExtend :  string = 'in';
  activeItem : string; 
  panelWidth : string;
  textSearchEnabled : boolean = this.environment.textSearchEnabled
  showContent : boolean = this.environment.showTypeaheadContent;
  @ViewChild(MatAutocomplete) autocomplete: MatAutocomplete;
  @ViewChild(MatAutocompleteTrigger) trigger : MatAutocompleteTrigger;
  @ViewChild(MatFormField) inputElement : MatFormField;


  constructor(private dataService : DataService,
              private location: Location,
              private environment : EnvService,
              private overlay : Overlay) {}

   ngOnInit(){
    this.panelWidth = this.environment.app.toLowerCase() == "beehive" ? '' : "400px";
    this.searchResults$ = this.searchCtrl.valueChanges
    .pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(data =>{
        if(data){
          this.searchText = data.trim();
          return this.search(data.trim())
        }
        return of([])
      }
      )
    )

    
  }

  public ngAfterViewInit(): void {
    (<any>this.trigger)._getOverlayPosition = () => this.getAutocompleteOverlayPosition();
  }

  private getAutocompleteOverlayPosition(): PositionStrategy {
    const autocompleteTrigger = this.trigger as any;
    const strategy = autocompleteTrigger._overlay.position().flexibleConnectedTo(
        this.inputElement.getConnectedOverlayOrigin()
    ).withFlexibleDimensions(false)
    .withPush(false);


    const belowPosition: ConnectedPosition = {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top'
    };

    strategy.withPositions([belowPosition]);
    autocompleteTrigger._positionStrategy = strategy;
    
    return autocompleteTrigger._positionStrategy;
}

  onKeydown(e){

    if(e.key == "ArrowDown" || e.key == "ArrowUp"){
      let result = this.autocomplete._keyManager.activeItem.value;
      if(result)
        this.searchCtrl.setValue(result, {emitEvent: false});
    }
  }

  displayFn(result?: any): string | undefined {

    return result ? result.Value : undefined;
  }

  onFocus(){
    // this.inputExtend = 'out';
    // console.log('focused!')
  }

  onFocusOut(){

    // if(this.searchCtrl.value == '' || this.searchCtrl.value == null)
    //   this.inputExtend = 'in';
    //   console.log('no more focus')
  }
   search(term : string) : Observable<any>{

     return this.dataService.searchByText(term).pipe(
         map(x=> {
          let temp =  this.generateGroupMapping(x, term)
          return temp;
        }));
   }

   previewOption(result){
    this.searchCtrl.setValue(result, {emitEvent: false});
   }

   onOptionSelected(selectedOption : any){

      let option = selectedOption.option.value;
      let value;

      //When Angular research page is being used, use Id instead of Value
      if(this.environment.app == 'Beehive' || option.Content == 'Keyword')
        {
         let redirectUrl = this.environment.tickerSearchUrl;          
          if(option.Content == 'Research' && redirectUrl.search(".asp")==-1)
            value = option.Id;
          else
            value = option.Value;
        }
      else
        value = option.Id;

      

      let sUrl : string = '';

      if(option.Content == 'Keyword'){
        sUrl = this.environment.freeTextSearchUrl.replace('{0}',value);
        //this.router.navigate(['/research'], {queryParams: {text: option.Value}})
      }

      if(option.Content == 'Research' && option.Section == 'Securities')
        sUrl = this.environment.tickerSearchUrl.replace('{0}', value);
        //this.router.navigate(['/research'], {queryParams: {Ticker: option.Value}})
      else if(option.Content == 'Research' && option.Section == 'Analyst')
      //this.router.navigate(['/research'], {queryParams: {Analyst: option.Value}})
        sUrl = this.environment.analystSearchUrl.replace('{0}',value);
      else if(option.Content == 'Financials'){
        sUrl = this.environment.financialsSearchUrl.replace('{0}', value);
      }
    
      else if(option.Content == 'Charts'){
        sUrl= `../charts/PriceCharts.aspx$?type=threeyrpricechart&ticker=${option.Value}`
      }

      else if(option.Content == 'Models'){
        sUrl = this.environment.modelSearchUrl.replace('{0}', value);
      }


      console.log(sUrl);
      window.location.assign(sUrl);


   }

   generateGroupMapping(results : any[], term: string){
    let uniqueSections = Array.from(new Set(results.map(res => res.Section)));
    let searchGroups = [];
    for(let group of uniqueSections){
      searchGroups.push(
      {
        Group: group,
        Results : results.filter(x=>x.Section == group)
      }
      );
    }

    searchGroups.push( 
      {
        Group : 'Keyword',
        Results: [
          {
            Display : term,
            Value : term,
            Content: 'Keyword'
          }
      ]
      }
    )

    return searchGroups;
   }


   optionFocus(){
     console.log('option focused')
   }
 








}


import { Pipe, PipeTransform } from '@angular/core';
import { EnvService } from '../../env.service';
import { Overlay, OverlayConfig, ConnectedPosition, FlexibleConnectedPositionStrategy, PositionStrategy } from '@angular/cdk/overlay';

@Pipe({
    name: 'highlight'
})

export class HighlightSearch implements PipeTransform {

    transform(value: any, args: any): any {
        if (!args) {return value;}
        var re = new RegExp(args, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
        return value.replace(re, "<b>$&</b>");
    }
}
