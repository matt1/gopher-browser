import React, {ChangeEvent, Component} from 'react';
import './GopherAutocomplete.css';
import { GopherSelector } from './GopherTab';


/**
 * Autocomplete input for gopher address bar.
 * 
 * Based on https://www.digitalocean.com/community/tutorials/react-react-autocomplete
 */
export class GopherAutocompleteState {
  activeSuggestion:number = 0;
  filteredSuggestions:Array<GopherSelector> = [];
  showSuggestions:boolean = false;
  userInput:GopherSelector|undefined;
  uri:string|undefined = '';
}

export class GopherAutocompleteProps {
  onChange?: (event:ChangeEvent<HTMLInputElement>) => void;
  onNavigate?: (uri:string) => void;
  suggestions:Array<GopherSelector>|undefined = [];
  uri:string|undefined = '';
}

export class GopherAutocomplete extends Component<GopherAutocompleteProps, GopherAutocompleteState>  {
  
  /** Reference for the main input box, so we can dynamically position suggestions. */
  inputRef:React.RefObject<HTMLInputElement>;

  private lastUri:string|undefined;

  constructor(props:GopherAutocompleteProps) {
    super(props);
    this.state = {
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: '',
      uri: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);

    this.inputRef = React.createRef();
  }

  onChange(event:ChangeEvent<HTMLInputElement>){
    if (!event || !event.currentTarget) return;
    if (!this.props.suggestions) return;
    const userInput = (event.currentTarget as HTMLInputElement).value;
  
    const filteredSuggestions = this.props.suggestions.filter((suggestion:GopherSelector) =>
        suggestion.toString().toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );
  
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions,
      showSuggestions: true,
      userInput: userInput,
      uri: userInput,
    });
  };

  onClick(event:React.MouseEvent) {
    this.setState({
      activeSuggestion: 0,
      filteredSuggestions: [],
      showSuggestions: false,
      userInput: (event.currentTarget as HTMLElement).innerText
    });
    this.onNavigate((event.currentTarget as HTMLElement).innerText);
  };

  onNavigate(uri:string) {
    if (!this.props.onNavigate) throw new Error('no onNavigate in props');
    this.setState({
      activeSuggestion: 0,
      showSuggestions: false,
    });
    this.props.onNavigate(uri);
  }

  onKeyDown(event:React.KeyboardEvent) {
    const { activeSuggestion, filteredSuggestions } = this.state;
  
    // enter
    if (event.keyCode === 13) {
      const selected = filteredSuggestions[activeSuggestion]?.toString() || this.state.userInput?.toString() || '';
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        uri: selected,
      });
      this.onNavigate(selected);
      
    } else if (event.keyCode === 38) {
      if (activeSuggestion === 0) {
        return;
      }
      this.setState({ activeSuggestion: activeSuggestion - 1 });
    }
    // User pressed the down arrow, increment the index
    else if (event.keyCode === 40) {
      if (activeSuggestion - 1 === filteredSuggestions.length) {
        return;
      }
      this.setState({ activeSuggestion: activeSuggestion + 1 });
    }
    // escape
    else if (event.keyCode === 27) {
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
      });
    }
  };

  render() {
    const {
      onChange,
      onClick,
      onKeyDown,
      state: {
        activeSuggestion,
        filteredSuggestions,
        showSuggestions,
        userInput
      }
    } = this;
    
    // compare the last URI we got from props - it will only be different from
    // our cahced copy if there is some sort of external navigation event.
    if (this.props.uri !== this.lastUri) {
      this.lastUri = this.props.uri;
      this.setState({
        activeSuggestion: 0,
        showSuggestions: false,
        uri: this.lastUri
      });
    }
  
    // dynamically calculate the position of the suggestions div. We need to do
    // this as it seems hard (impossible?) to have the absolute position suggestions
    // be the same size as the input, but also "float" over the page content.
    const input = this.inputRef.current;
    let top = `25px`; let left = `0px`; let width = `400px`;
    if (input) {
      top = `${input.clientTop + input.clientHeight}px`;
      left = `${input.offsetLeft}px`;
      width = `${input.clientWidth + 1.2}px`; // not sure where the 1.2 comes from
    }

    let suggestionsListComponent;
    if (showSuggestions && userInput) {
      if (filteredSuggestions.length) {
        suggestionsListComponent = (
          <div className='suggestions' style={{top, left, width}}>
            <ul className='suggestions'>
              {filteredSuggestions.map((suggestion, index) => {
                let className;
                if (index === activeSuggestion) {
                  className = 'suggestion-active';
                }
                return (
                  <li className={className} key={`${index}-${suggestion.toString()}`} onClick={onClick}>
                    {suggestion.toString()}
                  </li>
                );
              })}
            </ul>
          </div>
        );
      }
    }

    return (
      <div className="gopherAutocomplete">
        <input
          type='text'
          ref={this.inputRef}
          onChange={onChange}
          onClick={(event) => (event.target as HTMLInputElement).select()}
          onKeyDown={onKeyDown}
          placeholder='Search or enter gopher address'
          value={this.state.uri}
        />
        {suggestionsListComponent}
      </div>
    );
  }

}