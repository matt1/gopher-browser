import React, {Component} from 'react';
import {GopherSelector} from './GopherTab';

/** A component for showing a search input field. */
export class GopherSearch extends Component<GopherSelector, {}> {  
  /** Reference to the input field so we can obtain the current value. */
  private inputRef:React.RefObject<HTMLInputElement>;

  constructor(props:GopherSelector) {
    super(props);
    this.inputRef = React.createRef();
  }

  onSearch() {
    if (!this.props.onSearch) throw new Error('No onSearch in props.');
    const selector = new GopherSelector();
    selector.hostname = this.props.hostname;
    selector.port = this.props.port;
    selector.selector = this.props.selector;
    selector.query = this.inputRef.current?.value || '';
    this.props.onSearch(selector);    
  }

  render() {
    return (
      <div className="gopherItem gopherSearch">
        <div className="type">{this.props.type}</div>
        <div className="name">          
          <input ref={this.inputRef} placeholder={this.props.name}></input>
          <button onClick={() => {this.onSearch()}}>{this.props.name}</button>          
        </div>
      </div>
    );
  }
}