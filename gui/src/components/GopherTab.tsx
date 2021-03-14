import React, {Component} from 'react';
import {GopherContent} from './GopherContent';
import {NavigationControls} from './NavigationControls';
import {StatusBar} from './StatusBar';
import './GopherTab.css';

export class EventHandlers {
  onNavigate?: (selector:GopherSelector) => void;
  onScroll?: (scroll:number) => void;
  onSearch?:(selector:GopherSelector) => void;
  onStatus?:(status:string) => void;
  onBack?: () => void;
}

export class GopherSelector extends EventHandlers {
  /** Single character indicating type of this selector. */
  type?:string = '';

  hostname?:string = '';

  port?:number = 70;

  selector?:string = '';

  /** The user-visible string for this elector. */
  name?:string = '';

  /** A query to be sent to a search server. */
  query?:string = '';

  /** Required for React - not part of Gopher. */
  key?:string = '';
  
  toString() {
    return `${this.hostname}:${this.port}${this.selector || ''}`;
  }
}

export class HistoryFrame {
  constructor(readonly selector:GopherSelector, public scrollPos:number = 0){}
}

export class GopherMenu {
  items:Array<GopherSelector> = [];
}

export class GopherTabState {
  /** The selector that is currently being viewed in this tab. */
  selector?:GopherSelector;

  /** The URI the user is inputting/has input. */
  uri?:string;

  /** JSON content for the gopher menu */
  bytes?:Uint8Array;

  /** Scroll position of the gopher content. */
  scrollPos?:number = 0;

  /** Status bar message. */
  status?:string = '';

  /** History items */
  history?: Array<HistoryFrame> = [];

  /** Pointer to item in `history` array. */
  historyPointer?: number = 0;
}

export interface GopherTabProps extends GopherTabState, EventHandlers {
  address?:GopherSelector;
  key?: string;
}

/** A single "tab" that contains everything for a single browser tab. */
export class GopherTab extends Component<GopherTabProps, GopherTabState> {
  static defaultProps: Partial<GopherTabProps> = {}

  /** Flag used to indicate that the page is loading. **/
  private loading = false;

  constructor(props:GopherTabProps) {
    super(props);
    this.state = {
      selector: new GopherSelector(),
      uri: '',
      bytes: new Uint8Array(),
      status: '',
      scrollPos: 0,
      history: [],
      historyPointer: 0,
    };
    this.setState(this.state);

    this.onBack = this.onBack.bind(this);
  }

  onBack() {
    if (!this.state.history) throw new Error('No history in state.');
    let shadowHistoryPointer = this.state.historyPointer || 0;
    const newPointer = Math.max(shadowHistoryPointer - 1, 0);
    const historyItem = this.state.history[newPointer];
    this.setState({
      bytes: new Uint8Array(),
      historyPointer: newPointer,
      scrollPos: historyItem.scrollPos,
    })
    
    this._navigate(historyItem.selector);
  }

  /** Performs a "normal" navigation and adds new element to the history. */
  onNavigate(selector:GopherSelector) {
    let shadowHistoryPointer = this.state.historyPointer || 0;
    let historySoFar:Array<HistoryFrame> = [];
    if (this.state.history) {
      historySoFar = this.state.history.slice(0, shadowHistoryPointer + 1);
    }
    if (historySoFar.length > 0) {
      historySoFar[historySoFar.length - 1].scrollPos = this.state.scrollPos || 0;
    }
    const history = historySoFar.concat([new HistoryFrame(selector, 0)]);
    this.setState({
      scrollPos: 0,
      uri: selector.toString(),
      bytes: new Uint8Array(),
      history,
      historyPointer: history.length-1
    });

    this._navigate(selector)
  }

  

  _navigate(selector:GopherSelector) {
    const host = document.location.hostname;
    let path = `http://${host}:7070/api/v1/downloadMenu`;
    if (selector.type !== '1') {
      path = `http://${host}:7070/api/v1/downloadItem`
    }
    if (selector.query) {
      path = `http://${host}:7070/api/v1/search`
    }

    
    this.setState({
      uri: selector.toString(),
      selector,
      status: `Waiting for ${selector.hostname}...`,
    });
    

    fetch(path, {
      method: 'POST',
      mode: 'cors',
      body: JSON.stringify(selector),
    }).then((response) => {
      if (!response.ok) {
        // TODO: proper error handling
        response.text().then((errorMessage) => {
          alert(`Request failed:\n${errorMessage}`);
          this.setState({status: ''});   
        });
      } else {
        return response.arrayBuffer();
      }
    }).then((response) => {
      if (response) {
        this.setState({
          status: '',
          bytes: new Uint8Array(response),
        });
      }
    }).catch((error) => {
      console.log(error);      
      this.setState({status: ''});      
    });
  }

  onSearch(selector:GopherSelector) {
    // Set the type to 1 (menu) to display the results as a menu.
    selector.type = '1';

    let shadowHistoryPointer = this.state.historyPointer || 0;
    let historySoFar:Array<HistoryFrame> = [];
    if (this.state.history) {
      historySoFar = this.state.history.slice(0, shadowHistoryPointer + 1);
    }
    const history = historySoFar.concat([new HistoryFrame(selector, this.state.scrollPos)]);
    this.setState({
      uri:selector.toString(),
      bytes: new Uint8Array(),
      scrollPos: 0,
      history,
      historyPointer: history.length-1
    });

    this._navigate(selector)
  }

  onStatus(status:string) {
    this.setState({status});
  }

  onScroll(scrollPos:number) {
    // todo: request animation frame?
    this.setState({scrollPos});
  }
  
  render() {
    return (
      <div className="gopherTab grid">
        {/* TODO parse the URL */ }
        <NavigationControls
          history={this.state.history}
          historyPointer={this.state.historyPointer}
          onBack={this.onBack}
          uri={this.state.uri}
          onNavigate={(selector:GopherSelector) => this.onNavigate(selector)}>
        </NavigationControls>
        <GopherContent 
          onNavigate={(selector:GopherSelector) => this.onNavigate(selector)}
          onScroll={(scroll:number) => this.onScroll(scroll)}
          onSearch={(selector:GopherSelector) => this.onSearch(selector)}
          onStatus={(status:string) => this.onStatus(status)}
          bytes={this.state.bytes}
          selector={this.state.selector}
          scrollPos={this.state.scrollPos}>
        </GopherContent>
        <StatusBar status={this.state.status}></StatusBar>
      </div>
    );
  }
}