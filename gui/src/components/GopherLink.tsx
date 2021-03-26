import React, {Component} from 'react';
import './GopherLink.css';
import { GopherSelector } from './GopherTab';

/** This component is responsible for "rendering" a link. */
export class GopherLink extends Component<GopherSelector, {}> {
  constructor(props:GopherSelector) {
    super(props);
    this.onStatus = this.onStatus.bind(this);
    this.clearStatus = this.clearStatus.bind(this);
  }

  onNavigate() {
    if (!this.props.onNavigate) throw new Error('No onNavigate in props.');
    const selector = new GopherSelector();
    selector.hostname = this.props.hostname;
    selector.port = this.props.port;
    selector.selector = this.props.selector;
    selector.type = this.props.type;
    this.props.onNavigate(selector);
  }

  onStatus() {
    if (!this.props.onStatus) throw new Error('No onStatus in props.');
    if (!this.props.hostname) {console.warn('No hostname in props.'); return;}
    let url = this.props.hostname;
    if (this.props.port !== 70) {
      url += ':70';
    }
    url += this.props.selector;
    this.props.onStatus(url);
  }

  clearStatus() {
    if (!this.props.onStatus) throw new Error('No onStatus in props.');
    this.props.onStatus('');
  }

  render() {
    if (!this.props.type || !this.props.name) {
      console.warn('Invalid selector link?');
      console.warn(this.props);
    }
    return (
      <div className="gopherItem gopherLink">
        <div className="type">{this.props.type}</div>
        <div className="name"
            onMouseEnter={this.onStatus}
            onMouseLeave={this.clearStatus}
            onClick={() => {this.clearStatus(); this.onNavigate();}}>
              {this.props.name}
        </div>        
      </div>
    );
  }
}