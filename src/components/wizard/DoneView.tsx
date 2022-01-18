// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import { Box, Button, createStyles, Grid, Link, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import ScrollableFeed from "react-scrollable-feed";
import { white } from "../../assets/theme/theme";
import * as Serial from "../../misc/serial";
import ScrollableContainer from "../general/ScrollableContainer";
import { closePort, openPort } from "../general/util";
import { OutputItem } from "./FlashView";

const styles = (theme: Theme) =>
  createStyles({
    bottomGrid: {
      height: 68,
      position: "fixed",
      bottom: 16,
      width: 440,
    },
    consoleOutput: {
      fontFamily: "Courier New",
      whiteSpace: "pre-line",
      wordBreak: "break-all",
      padding: 10,
      overflowY: "scroll",
      height: "300px",
      marginTop: theme.spacing(2),
      color: theme.palette.primary.light,
      backgroundColor: theme.palette.primary.dark,
      borderRadius: 5,
      width: "100%",
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
    err: {
      color: theme.palette.primary.main,
    },
    scrollableWrapper: {
      height: "calc(100% - 8px)",
      width: "100%",
    },
    containerWrapper: {
      height: "100%",
      alignContent: "space-around",
      paddingBottom: theme.spacing(10),
    },
    button: {
      minWidth: 100,
      height: 36,
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
    },
    contentContainer: {
      paddingTop: theme.spacing(5),
      maxWidth: 440,
    },
    textContent: {
      paddingTop: theme.spacing(5),
      textAlign: "center",
    },
    heading: {
      fontSize: "2rem",
      fontFamily: "Clash Display",
      fontWeight: 500,
    },
    descriptionText: {
      fontSize: 16,
    },
  });

interface DoneProps extends WithStyles<typeof styles> {
  currentPort?: SerialPort;
  currentPortOpen?: boolean;
  updateCurrentPort: (state: SerialPort | undefined) => void;
  updateCurrentPortOpen: (state: boolean) => void;
}

interface DoneState {
  monitorRunning?: boolean;
  output: OutputItem[];
}

class DoneView extends React.Component<DoneProps, DoneState> {
  //Monitor
  private monitorReader: Serial.LineReader | undefined = undefined;
  private monitorRun: Promise<void> | undefined = undefined;
  async toggleMonitor() {
    if (!this.props.currentPort) {
      return;
    }

    if (!this.state.monitorRunning) {
      this.monitorRun = this.startMonitor();
    } else {
      await this.stopMonitor();
      this.monitorRun = undefined;
    }
  }

  async stopMonitor() {
    if (!this.props.currentPort) {
      return;
    }

    if (this.monitorReader) {
      await this.monitorReader.stop();
      this.monitorReader = undefined;
    }
    if (this.monitorRun) {
      try {
        await this.monitorRun;
      } catch (e) {}
    }
  }

  async onRestart() {
    if (this.props.currentPort)
      try {
        await Serial.restart(this.props.currentPort);
      } catch (e) {
        console.log("Failed restarting", e);
      }
  }

  async startMonitor() {
    if (!this.props.currentPort) {
      return;
    }
    await openPort(this.props);
    void this.onRestart();
    try {
      this.setState({
        monitorRunning: true,
        output: [] as OutputItem[],
      });
      const lineReader = new Serial.LineReader(this.props.currentPort);
      this.monitorReader = lineReader;

      while (true) {
        const { value, closed } = await lineReader.read();
        if (closed) {
          break;
        }

        if (value) {
          this.setState((state, props) => ({
            output: [...state.output, { text: value || "", type: "out" }] as OutputItem[],
          }));
        }
      }
    } finally {
      try {
        if (this.monitorReader !== undefined) {
          await this.monitorReader.stop();
          this.monitorReader = undefined;
        }
        await closePort(this.props);
      } catch (e) {
        console.log("got error trying to close port" + e);
      }
      this.setState({
        monitorRunning: false,
      });
    }
  }

  componentDidMount() {
    this.setState({ monitorRunning: false });
    navigator.serial.ondisconnect = async () => {
      try {
        await this.onDisconnect();
      } catch (e) {
        console.log("Failed to close ports on disconnect", e);
      }
    };
  }

  async onDisconnect() {
    if (this.state.monitorRunning) {
      await this.stopMonitor();
    }
    try {
      await closePort(this.props);
    } catch (e) {
      console.log("Failed to close ports on disconnect", e);
    }

    this.props.updateCurrentPort(undefined);
    this.setState({
      output: [{ type: "out", text: "Started" }],
      monitorRunning: false,
    });
  }

  async componentWillUnmount() {
    if (this.state.monitorRunning) {
      await this.stopMonitor();
    }
    await closePort(this.props);
    this.props.updateCurrentPort(undefined);
  }

  render() {
    const state: DoneState = this.state || {};
    return (
      <Box className={this.props.classes.scrollableWrapper}>
        <ScrollableContainer>
          <Grid className={this.props.classes.containerWrapper} container direction="row" justify="center">
            <Grid container justify="center" className={this.props.classes.contentContainer}>
              <Grid item xs={12} className={this.props.classes.textContent}>
                <Typography className={this.props.classes.heading}>Success 🥳</Typography>
                <Typography className={this.props.classes.descriptionText}>
                  Your device has been successfully set up!{" "}
                </Typography>
                <Typography className={this.props.classes.descriptionText}>
                  <Link href="https://github.com/toitlang/toit/discussions/244" target="_blank" rel="noreferrer">
                    Setup of your development environment
                  </Link>
                </Typography>
              </Grid>
              {state.monitorRunning && (
                <Grid container justify="center">
                  <ScrollableFeed className={this.props.classes.consoleOutput}>
                    {state.monitorRunning &&
                      state.output.map((item, index) => (
                        <span className={item.type === "err" ? this.props.classes.err : ""} key={index}>
                          {item.text}
                          {"\n"}
                        </span>
                      ))}
                  </ScrollableFeed>
                </Grid>
              )}
            </Grid>
            <Grid container justifyContent="center"></Grid>
            <Grid container justify="center" className={this.props.classes.bottomGrid}>
              <Grid item className={this.props.classes.bottomInnerGrid}>
                <Button
                  className={this.props.classes.button}
                  variant="contained"
                  size="large"
                  onClick={() => window.location.reload()}
                >
                  Set up another
                </Button>
                <Button
                  className={this.props.classes.button}
                  variant="contained"
                  size="large"
                  onClick={() => this.toggleMonitor()}
                >
                  Toggle monitor
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </ScrollableContainer>
      </Box>
    );
  }
}

export default withStyles(styles)(DoneView);
