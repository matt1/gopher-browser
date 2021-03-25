import React, {Component} from 'react';
import './StatusPage.css';
import {GopherTabProps} from './GopherTab';

/** A component for showing status - e.g. laoding, errors etc. */
export class StatusPage extends Component<GopherTabProps, {}> {
  generateCssClasses() {
    let visibility = 'visibility';
    if (!this.props.status) visibility = 'invisible';
    return `statusBar ${visibility}`;
  }

  render() {
    return (
      <div className="statusPage">
        {this.props.error}
      </div>
    );
  }
}