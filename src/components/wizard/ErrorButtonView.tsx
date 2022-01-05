// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { Box, Button, createStyles, Grid, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { passion, white } from "../../assets/theme/theme";
import ScrollableContainer from "../general/ScrollableContainer";

const styles = (theme: Theme) =>
  createStyles({
    contentContainer: {
      maxWidth: 440,
      width: 440,
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
    scrollableWrapper: {
      height: "calc(100% - 8px)",
      width: "100%",
    },
    containerWrapper: {
      alignContent: "space-between",
      paddingBottom: theme.spacing(10),
      textAlign: "center",
    },
    button: {
      minWidth: 100,
      height: 36,
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
    },
    bottomGrid: {
      height: 68,
      position: "fixed",
      bottom: 16,
      width: 440,
    },
    bottomInnerGrid: {
      height: "100%",
      width: "100%",
      backgroundColor: white,
      paddingLeft: theme.spacing(4),
      paddingRight: theme.spacing(4),
      boxShadow: "0 2px 4px rgb(1 14 40 / 5%)",
      border: "1px solid #e5e8ed",
      display: "flex",
      alignItems: "center",
      borderRadius: 4,
      placeContent: "center",
    },
  });

interface ErrorButtonProps extends WithStyles<typeof styles> {
  buttonText: string;
  buttonFunction?: () => void;
  buttonTo?: string;
  buttonHref?: string;
  buttonTarget?: string;
  description?: string | false;
  title?: string;
}

class ErrorButtonView extends React.Component<ErrorButtonProps> {
  constructor(props: ErrorButtonProps) {
    super(props);
  }

  render() {
    const description =
      this.props.description !== false
        ? this.props.description ||
          "Try again. If it keeps failing, please contact us by writing a message in the chat and we will help you."
        : undefined;
    return (
      <Box className={this.props.classes.scrollableWrapper}>
        <ScrollableContainer>
          <Grid className={this.props.classes.containerWrapper} container direction="row" justify="center">
            <Grid className={this.props.classes.contentContainer}>
              <Typography className={this.props.classes.errorHeading}>{this.props.title || "Error"}</Typography>
              {this.props.children && this.props.children}
              {description && <Typography>{description}</Typography>}
              <Grid container justify="center" className={this.props.classes.bottomGrid}>
                <Grid item className={this.props.classes.bottomInnerGrid}>
                  {this.props.buttonFunction ? (
                    <Button
                      className={this.props.classes.button}
                      variant="contained"
                      size="large"
                      onClick={this.props.buttonFunction}
                    >
                      {this.props.buttonText}
                    </Button>
                  ) : this.props.buttonTo ? (
                    <Button
                      className={this.props.classes.button}
                      variant="contained"
                      size="large"
                      component={RouterLink}
                      to={this.props.buttonTo}
                    >
                      {this.props.buttonText}
                    </Button>
                  ) : (
                    <Button
                      className={this.props.classes.button}
                      variant="contained"
                      size="large"
                      component="a"
                      href={this.props.buttonHref}
                      target={this.props.buttonTarget}
                    >
                      {this.props.buttonText}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </ScrollableContainer>
      </Box>
    );
  }
}

export default withStyles(styles)(ErrorButtonView);
