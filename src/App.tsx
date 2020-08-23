import * as React from "react";
import "./styles.css";
import Autocomplete from "./shared/components/Autocomplete/Autocomplete";
import { UsersData } from "./utils/DataUtil";

const API_END_POINT = `https://reqres.in/api/users?page=1&per_page=20`;
const HERE_CREDENTIALS = {
  apiKey: "hQNwl1RRpVcT3Cg7Z0v-2A3-M7XHjR27HlanLM7n-AU"
};
const HERE_END_POINT = `https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json
?apiKey={${HERE_CREDENTIALS.apiKey}}
&query=$q
&beginHighlight=<b>
&endHighlight=</b>`
const Options = {
  clientSide: true,
  showNoData: true,
  key: "id",
  label: "last_name"
};
export default function App() {
  const [data, setData] = React.useState([
    /*...UsersData*/
  ] as []);
  const [filteredData, setFilteredData] = React.useState([] as any);

  const filter = (value: string) => {
    const currentFilterData = data.filter((d: any) => {
      return d[Options.label].toLowerCase().startsWith(value.toLowerCase());
    });
    setFilteredData(currentFilterData as []);
  };

  const searchListener = (value: string) => {
    queryApi(value);
  };

  const queryApi = async (value: string) => {
    const URL = API_END_POINT.replace("$q", value || 'chicago')
    console.log('FETCHING', URL)
    fetch("https://api.spotify.com/v1/search?q=micheal", {
  "method": "GET"
})
.then(response => response.json())
.then(response => console.log(response))
.catch(err => {
	console.log(err);
});
    const response = await fetch(URL);
    const d = await response.json();
    setData(d.data);
    filter(value);
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
