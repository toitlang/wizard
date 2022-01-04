import { MuiThemeProvider } from "@material-ui/core";
import React from "react";
import "./App.css";
import theme from "./assets/theme/theme";
import MainView from "./components/MainView";

function App(): JSX.Element {
  return (
    <MuiThemeProvider theme={theme}>
      <MainView />
    </MuiThemeProvider>
  );
}

export default App;
