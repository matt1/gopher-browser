import React, {Component} from 'react';
import './StatusBar.css';
import {GopherTabProps} from './GopherTab';

/** A simple Google-Chrome style status bar. */
export class StatusBar extends Component<GopherTabProps, {}> {
  generateCssClasses() {
    let visibility = 'visibility';
    if (!this.props.status) visibility = 'invisible';
    return `statusBar ${visibility}`;
  }

  render() {
    return (
      <div className={this.generateCssClasses()}>{this.props.status}</div>
    );
  }
}