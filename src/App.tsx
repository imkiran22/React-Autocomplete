import * as React from "react";
import "./styles.css";
import styled from "styled-components"
import Autocomplete from "./shared/components/Autocomplete/Autocomplete";
import {SelectedUser} from "./components/SelectedUser/SelectedUser";
const API_END_POINT = `https://api.github.com/search/users`;
const Options = {
  key: "id",
  label: "login",
  photo: "avatar_url"
};

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  .Autocomplete-Container {
    display: inline-flex;
    flex: 1;
    
  }
  .SelectedUser-Container {
    flex: 1;
    /* display: inline-flex;
justify-content: flex-start;
   align-items: center; */
  }
`
export default function App() {
  const [selected, setSelected] = React.useState(null as any);
  const [filteredData, setFilteredData] = React.useState([] as any);

  const onSelect = (val: any) => {
    setSelected(val)
    console.log(val)
  }

  const filter = (value: string, data: any) => {
    const currentFilterData: any = data || [];
    setFilteredData(currentFilterData);
  };

  const searchListener = (value: string) => {
    queryApi(value);
  };

  const queryApi = async (value: string) => {
    const URL = `${API_END_POINT}?q=${value}`;
    const response = await fetch(URL);
    const data = await response.json();
    console.log(data)
    filter(value, data.items);
  };
  return (
    <div className="App">
      <h1 style={{letterSpacing: '7px'}}>Search Github Users</h1>
      <FlexContainer>
      <div className="Autocomplete-Container">
        <Autocomplete
          options={Options}
          data={filteredData}
          change={searchListener}
          onSelect={onSelect}
        />
      </div>
      <div className="SelectedUser-Container">
       <SelectedUser data={selected}></SelectedUser>
      </div>
      </FlexContainer>
    </div>
  );
}
