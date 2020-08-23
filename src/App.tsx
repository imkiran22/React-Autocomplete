import * as React from "react";
import "./styles.css";
import Autocomplete from "./shared/components/Autocomplete/Autocomplete";
const API_END_POINT = `https://api.github.com/search/users`;
const Options = {
  clientSide: true,
  showNoData: true,
  key: "id",
  label: "login"
};

export default function App() {
  const [filteredData, setFilteredData] = React.useState([] as any);

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
    filter(value, data.items);
  };
  return (
    <div className="App">
      <h1>Search Your Query</h1>
      <div className="Autocomplete-Container">
        <Autocomplete
          options={Options}
          data={filteredData}
          change={searchListener}
        />
      </div>
    </div>
  );
}
