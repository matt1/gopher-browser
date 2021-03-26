import React, {ChangeEvent, Component} from 'react';
import './NavigationControls.css';
import {GopherSelector, GopherTabProps, GopherTabState} from './GopherTab';
import {GopherAutocomplete} from './GopherAutocomplete';


/** Regular expression used for parsing URIs */ // eslint-disable-next-line
const URI_REGEX = /^(gopher:\/\/){0,1}([\w\-_\.]+)(?::(\d+)){0,1}(?:(?:\/)|([\/!].+){0,1})$/;

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

  parseUri(uri:string):GopherSelector {
    const matches = uri.match(URI_REGEX);
    const selector = new GopherSelector();
    if (!matches) {
      throw new Error(`URI of '${uri}' appears to be invalid`);
    }
    if (matches[1] && matches[1].length > 0 && matches[1] !== 'gopher://') {
      throw new Error('Only gopher:// address supported.');
    }
    selector.hostname = matches[2];
    if (matches.length >= 3) selector.port = Number.parseInt(matches[3]) || 70;
    if (matches.length >= 4) selector.selector = matches[4];
    return selector;
  }

  onNavigate(uri:string) {
    if (this.props.onNavigate) {
      const selector = this.parseUri(uri);
      selector.type = this.props.address?.type! || '1';
      this.props.onNavigate(selector);
    } else {
      throw new Error('No onNavigate function in props.');
    }
  }  

  render() {
    // compare the last URI we got from props - it will only be different from
    // our cahced copy if there is some sort of external navigation event.
    if (this.props.uri !== this.lastUri) {
      this.lastUri = this.props.uri;
      this.setState({uri: this.lastUri});
    }

    //     <input
    //     onChange={this.onChange}
    //     onKeyDown={this.onKeyDown}
    //     value={this.state.uri}
    // ></input>

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
              suggestions={this.props.history?.map(frame => frame.selector)}
              onChange={this.onChange}
              onNavigate={(uri:string) => this.onNavigate(uri)}
              uri={this.state.uri}>
              
          </GopherAutocomplete>
        </div>
        <div className="right"></div>
      </div>
    );
  }
}