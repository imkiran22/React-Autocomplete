import React, { useEffect, useCallback, useRef, ReactHTMLElement } from "react";
import styled from "styled-components";
import useDebounce from "../../hooks/use-debounce";
import { ScrollUtil } from "../../../utils/DataUtil";
let scrollUtil: any;

interface AutocompleteOptions {
  key: string;
  label: string;
}

interface AutocompleteProps {
  options: AutocompleteOptions;
  data: { [key: string]: any }[];
  change: Function;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  color: #191f42;
  flex-wrap: wrap;
  flex-basis: 50%;
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

const Autocomplete = (props: AutocompleteProps) => {
  const [selected, setSelected] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const options = props.options;
  const autoRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(selected, 500);
  const searchResultRef = useRef<any>(null);
  const [cacheResults, setCacheResults] = React.useState({} as any);
  const [data, setData] = React.useState([] as any);
  const [temp, setTemp] = React.useState(0);

  function updateCache(data: any, value: any) {
    const cache = Object.assign({}, cacheResults);
    cache[debouncedValue] = data;
    return cache;
  }

  useEffect(() => {
    setData(props.data as []);
  }, [props.data]);

  useEffect(() => {
    const cache = updateCache(data, debouncedValue);
    setCacheResults(cache);
    setSelectedIndex(0);
    resetScroll(searchResultRef);
  }, [data, debouncedValue]);

  const mouseClickListener = (ev: MouseEvent, index: number) => {
    updateSelection(index);
    setSelectedIndex(index);
    setFocused(false);
  };

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
    setFocused(true);
    scrollUtil.set(0);
  };

  const handleClickOutside = (ev: MouseEvent) => {
    const { current: element }: any = autoRef;
    if (element && element.contains(ev.target)) {
      setFocused(true);
    } else if (!element || !element.contains(ev.target)) {
      setFocused(false);
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
    setFocused(false);
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
        {d[options.label]}
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
      setSelectedIndex(0);
      setData(cacheResults[value]);
      setTimeout(() => resetScroll(searchResultRef))
    } else {
      console.log("DOESNT EXIST IN CACHE", value);
      props.change(value);
    }
  };

  useEffect(() => {
    if (debouncedValue && debouncedValue.length > 0) {
      preferCache(debouncedValue);
    } else {
      setData([]);
    }
  }, [debouncedValue]);

  const search = (value: string) => {
    setSelected(value);
  };

  const setSelection = (index: number) => {
    const selected: any = data.filter((d: any, i: number) => i === index).pop();
    setSelected(selected[options.label]);
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
        if (selectedIndex > 0) {
          setSelectedIndex(selectedIndex - 1);
          let scrollPos = scrollUtil.get() || 0;
          let newScrollPos = scrollPos - 45;
          scrollUtil.set(newScrollPos);
          searchResultRef.current.scrollTop = newScrollPos;
        }
        break;
      //DOWN
      case 40:
        if (selectedIndex < data.length - 1) {
          setSelectedIndex(selectedIndex + 1);
          let scrollPos = scrollUtil.get() || 0;
          let newScrollPos = scrollPos + 45;
          scrollUtil.set(newScrollPos);
          searchResultRef.current.scrollTop = newScrollPos;
        }
        break;
      //ENTER
      case 13:
        updateSelection(selectedIndex);
        break;
      default:
        return true;
    }
  };

  const onFocusListener = (searchResultRef: any) => {
    setFocused(true);
    setTimeout(() => {
      if (searchResultRef && searchResultRef.current) {
        searchResultRef.current.scrollTo(0, scrollUtil.get());
      }
    });
  };

  const clearInput = (e: any) => {
    setData([]);
    setSelected("");
    scrollUtil.set(0);
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
      <Clear onClick={(e: any) => clearInput(e)}>
        <i className="fa fa-times fa-1x"></i>
      </Clear>
      {focused ? (
        <SearchResults ref={searchResultRef}>
          {renderSearchItems()}
        </SearchResults>
      ) : (
        <></>
      )}
    </Container>
  );
};

export default Autocomplete;
