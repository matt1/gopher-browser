import React, {Component} from 'react';

export class GopherBrowser extends Component<{}, {}> {
  toggleTheme(theme:string) {
    const content = document.querySelector('.gopherContent');
    if (!content) throw Error('Not able to find gopherConent');
    if (theme === 'light') {
      content.removeAttribute('data-theme');
    } else {
      content.setAttribute('data-theme', theme);
    }
  }

  render() {
    return (
      <div></div>
    );
  }
}