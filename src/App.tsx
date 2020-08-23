import * as React from "react";
import "./styles.css";
import Autocomplete from "./shared/components/Autocomplete/Autocomplete";
import { ScrollUtil } from "./utils/DataUtil";
const API_END_POINT = `https://randomapi.com/api/6de6abfedb24f889e0b5f675edc50deb?fmt=raw&sole`;

const Options = {
  clientSide: true,
  showNoData: true,
  key: "email",
  label: "first"
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
    const response = await fetch(API_END_POINT);
    const data = await response.json();
    filter(value, data);
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
