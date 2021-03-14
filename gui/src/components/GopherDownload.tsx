import React, {Component} from 'react';
import './GopherItem.css';
import { GopherTabProps } from './GopherTab';
import { saveAs } from 'file-saver';


/** This component is responsible for triggering a "download" of a selector. */
export class GopherDownload extends Component<GopherTabProps, {}> {

  private downloadTriggerd = false;

  triggerDownload() {
    if (this.props.bytes && this.props.bytes.length > 0 && !this.downloadTriggerd) {
      this.downloadTriggerd = true;
      var blob = new Blob([this.props.bytes!]);
      saveAs(blob, this.props.selector?.selector);
    }
  }

  render() {
    this.triggerDownload();
    return (
      <p>Your download is starting...</p>
    );
  }
}