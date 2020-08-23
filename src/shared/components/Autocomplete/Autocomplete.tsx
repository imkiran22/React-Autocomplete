import React, { useEffect, useCallback, useRef } from "react";
import styled from "styled-components";
import useDebounce from "../../hooks/use-debounce";

interface AutocompleteOptions {
  clientSide: boolean;
  showNoData: boolean;
  key: string;
  label: string;
}

interface AutocompleteProps {
  options: { [key: string]: any };
  data: { [key: string]: any }[];
  change: Function;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  color: #191f42;
  flex-wrap: wrap;
  flex-basis: 50%;
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
    background: linear-gradient(darkblue, navy);
    animation: scale 0.2s linear;
    color: #fff;
    letter-spacing: 2px;
  }
  &:hover {
    background: green;
    color: #f5f5f5;
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

const Autocomplete = (props: AutocompleteProps) => {
  const [selected, setSelected] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [focused, setFocused] = React.useState(false);
  const options = props.options;
  const autoRef = useRef(null);
  const debouncedValue = useDebounce(selected, 500);
  const searchResultRef = useRef<any>(null);
  const [cacheResults, setCacheResults] = React.useState({} as any);
  const [data, setData] = React.useState([]);

  useEffect(() => {
    setSelectedIndex(0);
    setData(props.data as []);
  }, [props.data]);

  const mouseClickListener = (ev: MouseEvent, index: number) => {
    updateSelection(index);
    setSelectedIndex(index);
    setFocused(false);
  };

  const onChangeListener = (ev: any) => {
    search(ev.target.value);
    setFocused(true);
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
    document.body.addEventListener("click", (ev: MouseEvent) => {
      handleClickOutside(ev);
    });
    return () => document.body.removeEventListener("click", (ev) => {});
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
        onClick={(e: any) => mouseClickListener(e, index)}
      >
        {d[options.label]}
      </SearchItem>
    ));
  };

  const preferCache = (value: string) => {
    if (value in cacheResults) {
      cacheResults[value];
    } else {
      props.change(value);
    }
  };

  useEffect(() => {
    // preferCache(debouncedValue);
    props.change(debouncedValue);
  }, [debouncedValue]);

  const search = (value: string) => {
    setSelected(value);
  };

  const setSelection = (index: number) => {
    const selected: any = props.data
      .filter((d: any, i: number) => i === index)
      .pop();
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
          searchResultRef.current.scrollBy(0, -40);
        }
        break;
      //DOWN
      case 40:
        if (selectedIndex < props.data.length - 1) {
          setSelectedIndex(selectedIndex + 1);
          searchResultRef.current.scrollBy(0, 40);
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

  return (
    <Container ref={autoRef}>
      <InputSearch
        type={`text`}
        onFocus={(e: any) => setFocused(true)}
        // onBlur={(e: any) => setFocused(false)}
        onChange={(ev: any) => onChangeListener(ev)}
        onKeyDown={(e: any) => moveSelection(e)}
        value={selected}
      ></InputSearch>
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
