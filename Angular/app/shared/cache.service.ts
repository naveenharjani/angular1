import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, forkJoin, Observable } from 'rxjs';
import { DataService } from './data.service';
import { map, shareReplay } from 'rxjs/operators';
@Injectable()
export class CacheService {



    constructor(private dataService : DataService){
    }

    private tickers$ : Observable<any[]>;
    private authors$ : Observable<any[]> ;
    private analyst$ : Observable<any[]> ;
    private industries$ : Observable<any[]> ;
    private types$ : Observable<any[]>;
    private coverageAction$ : Observable<any[]>;
    private ratingAction$ : Observable<any[]>;
    private targetPriceAction$ : Observable<any[]>;
    private estimateActionTags$ : Observable<any[]>;
    private subTypes$ : Observable<any[]>;
    private keywords$ : Observable<any[]>;
    private investorThemes$ : Observable<any[]>;
    private thematicTags$ : Observable<any[]>;

    get fieldMap() {
        return {
            "ticker.id": this.tickers,
            "author.id" : this.authors,
            "analyst.id" : this.analyst,
            "industry.id" :this.industries,
            "typeid" : this.types,
            "ticker.coverageaction" : this.coverageAction,
            "ticker.ratingaction" : this.ratingAction,
            "ticker.targetpriceaction" : this.targetPriceAction,
            "ticker.estimateaction" : this.estimateActionTags, 
            "subtype" : this.subTypes,
            "keyword.id" : this.keywords,
            "investortheme.id" : this.investorThemes,
            "thematictagid" : this.thematicTags
        }
    }

    get tickers() : Observable<any[]>{
        if(!this.tickers$){
            this.tickers$ = this.dataService.GetMetaDataFields("ticker", 1).pipe(
              shareReplay(1)
            )
        }

        return this.tickers$;
    }

    get subTypes() : Observable<any[]>{
        if(!this.subTypes$){
            this.subTypes$ = this.dataService.GetMetaDataFields("subType", null).pipe(
                shareReplay(1)
            )
        }

        return this.subTypes$;
    }

    get keywords() : Observable<any[]>{
        if(!this.keywords$){
            this.keywords$ = this.dataService.GetMetaDataFields("keyword", null).pipe(
                shareReplay(1)
            )
        }

        return this.keywords$;
    }

    get investorThemes() : Observable<any[]>{
        if(!this.investorThemes$){
            this.investorThemes$ = this.dataService.GetMetaDataFields("investorThemes", 2).pipe(
                shareReplay(1)
            )
        }
        return this.investorThemes$;
    }

    get authors() : Observable<any[]>{
        if(!this.authors$){
            this.authors$ = this.dataService.GetMetaDataFields("Author", 4).pipe(
              shareReplay(1)
            )
        }

        return this.authors$;
    }

    get analyst() : Observable<any[]>{
        if(!this.analyst$){
            this.analyst$ = this.dataService.GetMetaDataFields("Author", 7).pipe(
              shareReplay(1)
            )
        }

        return this.analyst$;
    }

    get industries() : Observable<any[]>{
        if(!this.industries$){
            this.industries$ = this.dataService.GetMetaDataFields("Industry", 3).pipe(
              shareReplay(1)
            )
        }

        return this.industries$;
    }

    get types() : Observable<any[]>{
        if(!this.types$){
            this.types$ = this.dataService.GetMetaDataFields("Type", null).pipe(
              shareReplay(1)
            )
        }

        return this.types$;
    }

    get coverageAction() : Observable<any[]>{
        if(!this.coverageAction$){
            this.coverageAction$ = this.dataService.GetMetaDataFields("CoverageAction", null).pipe(
                shareReplay(1)
            )
        }

        return this.coverageAction$;
    }
    get ratingAction() : Observable<any[]>{
        if(!this.ratingAction$){
            this.ratingAction$ = this.dataService.GetMetaDataFields("RatingAction", null).pipe(
                shareReplay(1)
            )
        }
        return this.ratingAction$;
    }

    get targetPriceAction() : Observable<any[]>{
        if(!this.targetPriceAction$){
            this.targetPriceAction$ = this.dataService.GetMetaDataFields("TargetPriceAction", null).pipe(
                shareReplay(1)
            )
        }

        return this.targetPriceAction$;
    }

    get estimateActionTags() : Observable<any[]>{
        if(!this.estimateActionTags$){
            this.estimateActionTags$ = this.dataService.GetMetaDataFields("EstimateAction", null).pipe(
                shareReplay(1)
            )
        }

        return this.estimateActionTags$;
    }

    get thematicTags() : Observable<any[]>{
        if(!this.thematicTags$){
            this.thematicTags$ = this.dataService.GetMetaDataFields("ThematicTag", null).pipe(
                shareReplay(1)
            )
        }

        return this.thematicTags$;
    }





}