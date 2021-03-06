// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { createStyles, Grid, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { black, passion, white } from "../../assets/theme/theme";
import { ReactComponent as SuggestionIcon } from "./images/suggestion.svg";

const styles = (theme: Theme) =>
  createStyles({
    contentContainer: {
      maxWidth: 440,
      width: 440,
    },
    suggestionBox: {
      borderStyle: "solid",
      borderColor: black,
      backgroundColor: white,
      borderRadius: 4,
      borderWidth: 1,
      padding: theme.spacing(2),
      paddingTop: theme.spacing(3),
      textAlign: "start",
      marginTop: theme.spacing(2),
    },

    suggestionBoxHeading: {
      fontWeight: 200,
      fontSize: "1.5rem",
      paddingBottom: theme.spacing(2),
    },
    suggestionItem: {
      flexFlow: "row",
      paddingBottom: theme.spacing(2),
    },
    suggestionIcon: {
      marginTop: theme.spacing(0),
      marginRight: theme.spacing(1),
    },
    errorHeading: {
      paddingTop: theme.spacing(2),
      fontSize: "2rem",
      color: passion,
      fontFamily: "Clash Display",
      fontWeight: 500,
    },
    heading: {
      fontSize: "2rem",
      fontFamily: "Clash Display",
      fontWeight: 500,
    },
  });

interface ErrorProps extends WithStyles<typeof styles> {
  errorType?: string;
  suggestionContent: React.ReactElement[];
  suggestionHeader?: string;
}

class ErrorView extends React.Component<ErrorProps> {
  constructor(props: ErrorProps) {
    super(props);
  }

  render() {
    return (
      <Grid className={this.props.classes.contentContainer}>
        <Typography className={this.props.classes.errorHeading}>{this.props.errorType || "Error"}</Typography>
        <Grid container className={this.props.classes.suggestionBox} justify="flex-start">
          <Typography className={this.props.classes.suggestionBoxHeading}>
            {this.props.suggestionHeader || "Suggestion to fix the error"}
          </Typography>
          {this.props.suggestionContent.map((element, index) => (
            <Grid container className={this.props.classes.suggestionItem} key={index}>
              <Grid item>
                <SuggestionIcon className={this.props.classes.suggestionIcon} />
              </Grid>
              <Grid item>{element}</Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    );
  }
}

export default withStyles(styles)(ErrorView);
