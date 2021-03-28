import React, {ChangeEvent, Component} from 'react';
import './NavigationControls.css';
import {GopherSelector, GopherTabProps, GopherTabState} from './GopherTab';
import {GopherAutocomplete} from './GopherAutocomplete';

export enum SuggestionType {
  URI,
  HISTORY,
  SEARCH
}

/** Suggestion for auto-complete. */
export class Suggestion {
  query:string = '';
  suggestionType?:SuggestionType;
  
  constructor(readonly selector?:GopherSelector){}

  toString():string {
    if (this.selector) return this.selector.toString();
    return this.query;
  }
}

/** Contains controls for navigating */
export class NavigationControls extends Component<GopherTabProps, GopherTabState> {
  
  private lastUri:string | undefined;

  constructor(props:any) {
    super(props);
    this.state = {
      uri: this.props.uri,
    }
    this.lastUri = this.props.uri;
    this.onBack = this.onBack.bind(this);
    this.backDisabled = this.backDisabled.bind(this);
    this.onForward = this.onForward.bind(this);
    this.forwardDisabled = this.forwardDisabled.bind(this);
    this.onStop = this.onStop.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  generateUrl() {
    if (this.props.history && this.props.historyPointer !== undefined) {
      const hist = this.props.history[this.props.historyPointer];
      if (hist) {
        return `${hist.selector.hostname}${hist.selector.selector}`;
      }
    }
  }

  onChange(event:ChangeEvent<HTMLInputElement>) {
    this.setState({uri: event.target.value});
  }

  onKeyDown(event:React.KeyboardEvent) {
    if (event.keyCode === 13) {
      this.onNavigate(this.state.uri!);
    }
  }

  backDisabled(): boolean {
    if (!this.props.history || this.props.historyPointer === undefined) return true;
    if (this.props.historyPointer === 0) return true;
    return false;
  }

  onBack() {
    if (this.props.onBack) {
      this.props.onBack();
    } else {
      throw new Error('No onBack function in props.');
    }
  }

  forwardDisabled():boolean {
    if (!this.props.history || this.props.historyPointer === undefined) return true;
    if (this.props.historyPointer > this.props.history.length) return true;
    return false;
  }

  onForward() {
    if (!this.props.onForward) throw new Error('No onForward function in props');
    this.props.onForward();
  }

  onStop() {
    if (!this.props.onStop) throw new Error('No onStop function in props');
    this.props.onStop();
  }

  onNavigate(selector:GopherSelector) {
    if (!this.props.onNavigate) throw new Error('No onNavigate function in props.');
    this.props.onNavigate(selector);
  }

  onSearch(query:string) {
    if (!this.props.onSearch) throw new Error('No onSearch function in props.');
    // TODO: don't hardcode floodgap - allow different engines.
    const selector = new GopherSelector();
    selector.hostname = 'gopher.floodgap.com';
    selector.port = 70;
    selector.selector = '/v2/vs';
    selector.query = query;
    this.props.onSearch(selector);
  }

  render() {
    // compare the last URI we got from props - it will only be different from
    // our cahced copy if there is some sort of external navigation event.
    if (this.props.uri !== this.lastUri) {
      this.lastUri = this.props.uri;
      this.setState({uri: this.lastUri});
    }

    return (
      <div className="navigationControls">
        <div className="left">
          <button className="flatButton" disabled={this.backDisabled()} onClick={this.onBack} title="Click to go back">
            <span className="material-icons">arrow_back</span>
          </button>
          <button className="flatButton" disabled={this.forwardDisabled()} onClick={this.onForward} title="Click to go forward">
            <span className="material-icons">arrow_forward</span>
          </button>          
        </div>
        <div className="address middle">

          <GopherAutocomplete
              suggestions={this.props.history?.map(frame => {
                const sug = new Suggestion(frame.selector);
                sug.suggestionType = SuggestionType.HISTORY;
                return sug;
              })}
              onChange={this.onChange}
              onSearch={(query:string) => this.onSearch(query)}
              onNavigate={(selector:GopherSelector) => this.onNavigate(selector)}
              uri={this.state.uri}>
              
          </GopherAutocomplete>
        </div>
        <div className="right"></div>
      </div>
    );
  }
}