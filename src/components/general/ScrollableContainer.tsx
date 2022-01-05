// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { createStyles, Theme, WithStyles, withStyles } from "@material-ui/core";
import React from "react";

const styles = (theme: Theme) =>
  createStyles({
    container: {
      position: "relative",
      height: "100%",
    },
    containerInner: {
      scrollbarColor: "dark",
      position: "absolute",
      height: "100%",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
    },
    containerInnerDark: {
      scrollbarColor: "dark",
      position: "absolute",
      height: "100%",
      width: "100%",
      overflowY: "auto",
      overflowX: "hidden",
      "&::-webkit-scrollbar": {
        width: "0.4rem",
      },
      "&::-webkit-scrollbar-track": {
        boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
        webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
        marginTop: 2,
        marginBottom: 2,
      },
      "&::-webkit-scrollbar-thumb": {
        borderRadius: 4,
        backgroundColor: "rgba(255,255,255,.2)",
      },
    },
  });

interface ScrollableContainerProps extends WithStyles<typeof styles> {
  backgroundColor?: string;
  darkScrollbar?: boolean;
}

class ScrollableContainer extends React.Component<ScrollableContainerProps> {
  render() {
    return (
      <div
        className={this.props.classes.container}
        style={{ backgroundColor: this.props.backgroundColor !== undefined ? this.props.backgroundColor : "" }}
      >
        <div
          className={
            this.props.darkScrollbar === true
              ? this.props.classes.containerInnerDark
              : this.props.classes.containerInner
          }
        >
          {this.props.children}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(ScrollableContainer);
