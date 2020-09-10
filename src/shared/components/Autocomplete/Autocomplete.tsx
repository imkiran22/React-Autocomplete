import "./Autocomplete.css";
import React, {
  useEffect,
  useCallback,
  useRef,
  ReactHTMLElement,
  useReducer
} from "react";
import styled from "styled-components";
import useDebounce from "../../hooks/use-debounce";
import { ScrollUtil } from "../../../utils/DataUtil";
let scrollUtil: any;

interface AutocompleteOptions {
  key: string;
  label: string;
  photo?: string;
}

interface AutocompleteProps {
  options: AutocompleteOptions;
  data: { [key: string]: any }[];
  change: Function;
  onSelect: Function;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  color: #191f42;
  flex-wrap: wrap;
  flex-basis: 75%;
  position: relative;
`;

const InputSearch = styled.input`
  background: whitesmoke;
  font-size: 14px;
  line-height: 40px;
  border: 1px groove lightgray;
  outline: none;
  margin-bottom: 1px;
  padding: 0px 10px;
  letter-spacing: 2px;
  &:focus {
    border: 1.5px solid darkblue;
  }
`;
const SearchResults = styled.div`
  font-size: 12px;
  display: inline-flex;
  max-height: 300px;
  flex-direction: column;
  justify-content: space-between;
  flex-wrap: nowrap;
  overflow: auto;
  overflow-x: hidden;
  scroll-behavior: smooth;
`;

const SearchItem = styled.span`
  align-content: center;
  line-height: 40px;
  background: #ecf0f1;
  margin-bottom: 5px;
  font-size: 14px;
  cursor: pointer;
  flex-direction: row;
  display: inline-flex;
  justify-content: space-evenly;
  align-items: center;
  .label {
    flex: 2;
  }
  .photo {
    flex: 1;
    display: inline-flex;
    align-items: flex-end;
    flex-direction: row;
    justify-content: flex-end;
    img {
      width: 50px;
    }
  }
  &.active {
    background: linear-gradient(darkblue, #1f3a93);
    animation: scale 0.2s linear;
    color: #fff;
    letter-spacing: 2px;
  }
  &:hover {
    background: linear-gradient(darkblue, #1f3a93);
    color: #fff;
  }
  @keyframes scale {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.1);
    }
  }
`;

const Clear = styled.div`
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 18px;
  cursor: pointer;
`;

const PRIMARY = `#ececec`;
const SECONDARY = `#bfbfbf`;
const TERTIARY = `#eeeeee`;

const Spinner = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  flex-basis: 100px;
  font-size: 5em;
  align-items: center;
  .shine {
    background: ${PRIMARY};
    background-image: linear-gradient(
      to right,
      ${PRIMARY} 0%,
      ${SECONDARY} 20%,
      ${TERTIARY} 60%,
      ${PRIMARY} 100%
    );
    background-repeat: no-repeat;
    background-size: 800px 40px;
    display: inline-block;
    position: relative;
    -webkit-animation-duration: 1s;
    -webkit-animation-fill-mode: forwards;
    -webkit-animation-iteration-count: infinite;
    -webkit-animation-name: placeholderShimmer;
    -webkit-animation-timing-function: linear;
    height: 40px;
    margin-top: 1px;
    width: 100%;
  }
`;

const initialAutoCompleteState = {
  selected: "",
  selectedIndex: 0,
  focused: false,
  cacheResults: {},
  data: [],
  searching: false
};

const Autocomplete = (props: AutocompleteProps) => {
  const [autoState, dispatch] = useReducer((state: any, action: any) => {
    let newState;
    switch (action.type) {
      case "SELECTED_INDEX":
        newState = Object.assign({}, state);
        newState.selectedIndex = action.payload;
        return newState;
      case "IS_SEARCHING":
        newState = Object.assign({}, state);
        newState.searching = action.payload;
        return newState;
      case "SEARCH_RESULTS":
        newState = Object.assign({}, state);
        newState.data = [...action.payload];
        return newState;
      case "CACHE_RESULTS":
        newState = Object.assign({}, state);
        newState.cacheResults = { ...action.payload };
        return newState;
      case "SET_FOCUS":
        newState = Object.assign({}, state);
        newState.focused = action.payload;
        return newState;
      case "SELECTED":
        newState = Object.assign({}, state);
        newState.selected = action.payload;
        return newState;
      default:
        return state;
    }
  }, initialAutoCompleteState);
  const options = props.options;
  const autoRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(autoState.selected, 500);
  const searchResultRef = useRef<any>(null);

  const {
    selected,
    selectedIndex,
    focused,
    cacheResults,
    data,
    searching
  } = autoState;

  function updateCache(data: any, value: any) {
    const cache = Object.assign({}, cacheResults);
    cache[debouncedValue] = data;
    return cache;
  }

  useEffect(() => {
    dispatch({
      type: "SEARCH_RESULTS",
      payload: props.data as []
    });
  }, [props.data]);

  useEffect(() => {
    const cache = updateCache(data, debouncedValue);
    dispatch({
      type: "CACHE_RESULTS",
      payload: cache
    });
    dispatch({
      type: "SELECTED_INDEX",
      payload: 0
    });
    resetScroll(searchResultRef);
    dispatch({
      type: "IS_SEARCHING",
      payload: false
    });
  }, [data, debouncedValue]);

  const mouseClickListener = (ev: MouseEvent, index: number) => {
    updateSelection(index);
    dispatch({
      type: "SELECTED_INDEX",
      payload: index
    });
    dispatch({
      type: "SET_FOCUS",
      payload: false
    });
    propagateSelectionChange(index);
  };

  function propagateSelectionChange(selectedIndex: number) {
    const val = data
      .filter((d: any, index: number) => index === selectedIndex)
      .pop();
    props.onSelect(val);
  }

  const mouseHoverListener = (ev: MouseEvent, index: number) => {
    const selected: any = data.filter((d: any, i: number) => i === index).pop();
    const value = selected[options.label];
    if (inputRef.current) inputRef.current.value = value;
  };

  const mouseOutListener = (ev: MouseEvent) => {
    if (inputRef.current) inputRef.current.value = selected;
  };

  const onChangeListener = (ev: any) => {
    search(ev.target.value);
    dispatch({
      type: "SET_FOCUS",
      payload: true
    });
    scrollUtil.set(0);
  };

  const handleClickOutside = (ev: MouseEvent) => {
    const { current: element }: any = autoRef;
    if (element && element.contains(ev.target)) {
      dispatch({
        type: "SET_FOCUS",
        payload: true
      });
    } else if (!element || !element.contains(ev.target)) {
      dispatch({
        type: "SET_FOCUS",
        payload: false
      });
    }
  };

  useEffect(() => {
    scrollUtil = ScrollUtil();
    scrollUtil.set(0);
    document.body.addEventListener("click", (ev: MouseEvent) => {
      handleClickOutside(ev);
    });
    return () => {
      document.body.removeEventListener("click", (ev) => {});
      scrollUtil = undefined;
    };
  }, []);

  function updateSelection(index: number) {
    setSelection(index);
    dispatch({
      type: "SET_FOCUS",
      payload: false
    });
  }

  const renderSearchItems = () => {
    const { options } = props;
    if (selected && (!data || !data.length)) {
      return (
        <SearchItem className="no-results" key="no-results">
          No Search Results
        </SearchItem>
      );
    }
    return data.map((d: any, index: number) => (
      <SearchItem
        className={index === selectedIndex ? `active` : ``}
        key={index}
        onMouseOut={(e: any) => mouseOutListener(e)}
        onMouseOver={(e: any) => mouseHoverListener(e, index)}
        onClick={(e: any) => mouseClickListener(e, index)}
      >
        <span className="label">{d[options.label]}</span>
        {options?.photo ? (
          <span className="photo">
            <img src={d[options?.photo]} alt={d[options.label]} />
          </span>
        ) : (
          <></>
        )}
      </SearchItem>
    ));
  };

  const resetScroll = (searchResultRef: any) => {
    if (
      scrollUtil &&
      scrollUtil.get &&
      searchResultRef &&
      searchResultRef.current
    ) {
      const scrollPos = scrollUtil.get();
      searchResultRef.current.scrollTo(0, scrollPos);
    }
  };

  const preferCache = (value: string) => {
    if (value in cacheResults) {
      console.log("FETCHING FROM CACHE", value);
      dispatch({
        type: "SELECTED_INDEX",
        payload: 0
      });
      dispatch({
        type: "SEARCH_RESULTS",
        payload: cacheResults[value]
      });
      setTimeout(() => resetScroll(searchResultRef));
    } else {
      console.log("DOESNT EXIST IN CACHE", value);
      dispatch({
        type: "IS_SEARCHING",
        payload: true
      });
      props.change(value);
    }
  };

  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 0) {
      preferCache(debouncedValue);
    } else {
      dispatch({
        type: "IS_SEARCHING",
        payload: false
      });
      dispatch({
        type: "SEARCH_RESULTS",
        payload: []
      });
    }
  }, [debouncedValue]);

  const search = (value: string) => {
    dispatch({
      type: "SELECTED",
      payload: value
    });
  };

  const setSelection = (index: number) => {
    const selected: any = data.filter((d: any, i: number) => i === index).pop();
    dispatch({
      type: "SELECTED",
      payload: selected[options.label]
    });
  };

  const moveSelection = (ev: KeyboardEvent | any) => {
    const { keyCode } = ev;
    const element = searchResultRef.current;
    if (!element) {
      return;
    }
    switch (keyCode) {
      //UP
      case 38:
        ev.preventDefault();
        if (selectedIndex > 0) {
          dispatch({
            type: "SELECTED_INDEX",
            payload: selectedIndex - 1
          });
          let scrollPos = scrollUtil.get() || 0;
          let newScrollPos = scrollPos - 45;
          scrollUtil.set(newScrollPos);
          searchResultRef.current.scrollTop = newScrollPos;
        }
        break;
      //DOWN
      case 40:
        ev.preventDefault();
        if (selectedIndex < data.length - 1) {
          dispatch({
            type: "SELECTED_INDEX",
            payload: selectedIndex + 1
          });
          let scrollPos = scrollUtil.get() || 0;
          let newScrollPos = scrollPos + 45;
          scrollUtil.set(newScrollPos);
          searchResultRef.current.scrollTop = newScrollPos;
        }
        break;
      //ENTER
      case 13:
        updateSelection(selectedIndex);
        propagateSelectionChange(selectedIndex);
        break;
      default:
        return true;
    }
  };

  const onFocusListener = (searchResultRef: any) => {
    dispatch({
      type: "SET_FOCUS",
      payload: true
    });
    setTimeout(() => {
      if (scrollUtil && searchResultRef && searchResultRef.current) {
        searchResultRef.current.scrollTo(0, scrollUtil.get());
      }
    });
  };

  const clearInput = (e: any) => {
    dispatch({
      type: "SEARCH_RESULTS",
      payload: []
    });
    dispatch({
      type: "SELECTED",
      payload: ""
    });
    dispatch({
      type: "IS_SEARCHING",
      payload: false
    });
    scrollUtil.set(0);
    props.onSelect(null);
  };

  return (
    <Container ref={autoRef}>
      <InputSearch
        type={`text`}
        ref={inputRef}
        onFocus={(e: any) => onFocusListener(searchResultRef)}
        onChange={(ev: any) => onChangeListener(ev)}
        onKeyDown={(e: any) => moveSelection(e)}
        value={selected}
      ></InputSearch>
      {selected ? (
        <Clear onClick={(e: any) => clearInput(e)}>
          <i className="fa fa-times fa-1x"></i>
        </Clear>
      ) : (
        <></>
      )}
      {focused ? (
        <SearchResults ref={searchResultRef}>
          {searching ? (
            <Spinner>
              <div className="shine"></div>
              <div className="shine"></div>
              <div className="shine"></div>
            </Spinner>
          ) : (
            renderSearchItems()
          )}
        </SearchResults>
      ) : (
        <></>
      )}
    </Container>
  );
};

export default Autocomplete;
