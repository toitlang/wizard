// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { MuiThemeProvider } from "@material-ui/core";
import React from "react";
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
