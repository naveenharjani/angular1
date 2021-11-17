//import { InjectionToken } from '@angular/core'

//export let ACTIVEX_TOKEN = new InjectionToken<any>('activex');

// export class ActiveXObject {

// }

interface ActiveXObject {
    new (s: string): any;
}
export  let  ActiveXObject: ActiveXObject;


import { Injectable, InjectionToken } from '@angular/core';

export let WINDOW_TOKEN = new InjectionToken<any>('windowtoken');
//export let ACTIVEX_TOKEN = new InjectionToken<any>('activex');
//function _window(): any {
//    // return the global native browser window object
//    return window;
//}

//@Injectable()
//export class Window {
//    get getWindow(): any {
//        return _window();
//    }
//}


