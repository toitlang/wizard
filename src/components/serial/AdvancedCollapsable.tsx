// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { Button, Grid, Typography, WithStyles, withStyles } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import { createStyles, Theme } from "@material-ui/core/styles";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import React from "react";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    button: {
      height: 36,
    },
  });

interface AdvancedCollapsableProps extends WithStyles<typeof styles> {
  children: React.ReactNode;
}

interface AdvancedCollapsableState {
  open: boolean;
}

class AdvancedCollapsable extends React.Component<AdvancedCollapsableProps, AdvancedCollapsableState> {
  handleButtonClick(opened: boolean) {
    this.setState({ open: !opened });
  }

  render() {
    const state: AdvancedCollapsableState = this.state || {};
    return (
      <Grid className={this.props.classes.root} direction="row">
        <Grid item container>
          <Button
            variant="outlined"
            className={this.props.classes.button}
            onClick={() => this.handleButtonClick(state.open)}
          >
            {state.open ? <ExpandLess /> : <ExpandMore />}
            <Typography>{state.open ? "Collapse" : "Advanced"}</Typography>
          </Button>
        </Grid>
        <Collapse in={state.open} timeout="auto" unmountOnExit>
          {this.props.children}
        </Collapse>
      </Grid>
    );
  }
}

export default withStyles(styles)(AdvancedCollapsable);
