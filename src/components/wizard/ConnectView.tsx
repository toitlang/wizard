// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import {
  Box,
  Button,
  CircularProgress,
  createStyles,
  Grid,
  Link,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import React from "react";
import { FaChevronRight } from "react-icons/fa";
import { DetectState } from "../../actions/serial";
import { FlashingProperties, WizardAction, WizardError, WizardErrorType } from "../../actions/wizard";
import { white } from "../../assets/theme/theme";
import * as Serial from "../../misc/serial";
import RiveAnimation from "../general/rive/RiveAnimation";
import ScrollableContainer from "../general/ScrollableContainer";
import { closePort, detect, openPort } from "../general/util";
import GetStartedView from "../serial/GetStartedView";
import ErrorView from "./ErrorView";

const styles = (theme: Theme) =>
  createStyles({
    contentContainer: {
      maxWidth: 440,
    },
    textContent: {
      paddingTop: theme.spacing(5),
    },
    landingText: {
      display: "inline-block",
    },
    boldText: {
      fontWeight: 500,
      display: "inline-block",
    },
    button: {
      height: 36,
      width: 100,
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
    scrollableWrapper: {
      height: "calc(100% - 8px)",
      width: "100%",
    },
    containerWrapper: {
      alignContent: "space-between",
      paddingBottom: theme.spacing(10),
    },
    link: {
      cursor: "pointer",
    },
  });

interface ConnectProps extends WithStyles<typeof styles> {
  currentPort?: SerialPort;
  detectState?: DetectState;
  currentPortOpen?: boolean;
  flashingProperties?: FlashingProperties;
  updateDetectState: (state: DetectState) => void;
  updateCurrentPort: (state: SerialPort | undefined) => void;
  updateCurrentPortOpen: (state: boolean) => void;
  updateFlashingProperties: (state: FlashingProperties) => void;
  updateCurrentAction: (state: WizardAction | WizardError) => void;
}

export const siliconlabs = "https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers";

enum ConnectError {
  NOT_FOUND_ERR = "Not found",
  NETWORK_ERR = "Network error",
  HARDWARE_INVALID = "Hardware invalid",
  UNKNOWN_ERR = "Unkonwn error",
}

interface ConnectState {
  inProgress: boolean;
  noFilter: boolean;
  serialSupported: boolean;
  error?: ConnectError;
}

class ConnectView extends React.Component<ConnectProps, ConnectState> {
  constructor(props: ConnectProps) {
    super(props);

    this.state = {
      inProgress: false,
      noFilter: (window as unknown as { TOIT_SERIAL_NOFILTER: boolean | undefined }).TOIT_SERIAL_NOFILTER || false,
      serialSupported: Serial.isSupported(),
    };
  }

  async onConnect() {
    const serialFilter: SerialPortFilter[] = this.state.noFilter
      ? []
      : [
          // ftdi chip vendor
          { usbVendorId: 0x0403 },
          // silicon labs
          { usbVendorId: 0x10c4 },
          // Evoluent
          { usbVendorId: 0x1a7c },
          // WCH
          { usbVendorId: 0x1a86 },
          // Prokufc Technology, Inc.
          { usbVendorId: 0x067b },
          // pycom (Microchip Technology Inc.)
          { usbVendorId: 0x04d8 },
        ];
    this.setState({
      inProgress: true,
    });
    try {
      const port = await navigator.serial.requestPort({
        filters: serialFilter,
      });
      if (this.props.currentPort !== undefined && this.props.currentPortOpen) {
        console.log("Closing ports");
        await this.props.currentPort.close();
      }
      this.props.updateCurrentPort(port);
      await this.onDetect();
      this.setState({ error: undefined });
      this.props.updateCurrentAction(WizardAction.SETUP);
    } catch (e) {
      console.log("Failed to connect, ", e);
      if (e instanceof DOMException && e.code === DOMException.NOT_FOUND_ERR) {
        this.setState({ error: ConnectError.NOT_FOUND_ERR, noFilter: true });
      } else if (e instanceof DOMException && e.code === DOMException.NETWORK_ERR) {
        this.setState({ error: ConnectError.NETWORK_ERR });
      } else {
        this.setState({ error: ConnectError.UNKNOWN_ERR });
      }
      await this.disconnect();
    }
  }

  private async connect() {
    try {
      await this.onConnect();
    } catch (e) {
      console.log("Connect error", e);
    }
  }

  async onDisconnect() {
    if (this.state.serialSupported) {
      this.setState({
        inProgress: true,
      });
      try {
        await closePort(this.props);
      } catch (e) {
        console.log("Failed to close ports on disconnect", e);
      }
    }
    this.props.updateCurrentPort(undefined);
    this.setState({
      inProgress: false,
    });
  }

  async onDetect() {
    if (!this.props.currentPort || this.props.detectState) {
      return;
    }
    await this.process(true, this.detectHandler.bind(this));
  }

  async detectHandler(port: SerialPort): Promise<void> {
    try {
      await detect(this.props);
    } catch (e) {
      console.log("detect error", e);
    }
    if (!this.props.detectState?.hardwareValid) {
      this.setState({ error: ConnectError.HARDWARE_INVALID });
      await this.disconnect();
      return;
    }
  }

  async disconnect() {
    try {
      await this.onDisconnect();
    } catch (e) {
      console.log("Disconnect error", e);
    }
  }

  async onRestart() {
    try {
      await this.process(true, async (port: SerialPort): Promise<void> => {
        await Serial.restart(port);
      });
    } catch (e) {
      console.log("Failed restarting", e);
    }
  }

  async process(portHandling: boolean, fn: (serialPort: SerialPort) => Promise<void>) {
    if (!this.props.currentPort) {
      return;
    }
    const p = async (currentPort: SerialPort | undefined): Promise<void> => {
      if (portHandling) {
        await openPort(this.props);
      }
      try {
        this.setState({
          inProgress: true,
        });
        if (currentPort) await fn(currentPort);
      } finally {
        if (portHandling) {
          try {
            await closePort(this.props);
          } catch (e) {
            console.log("got error trying to close port" + e);
          }
        }
        this.setState({
          inProgress: false,
        });
      }
    };
    await p(this.props.currentPort);
  }

  render() {
    return (
      <Box className={this.props.classes.scrollableWrapper}>
        <ScrollableContainer>
          <Grid className={this.props.classes.containerWrapper} container direction="row" justify="center">
            <Grid container justify="center" className={this.props.classes.contentContainer}>
              <Grid item xs={12} className={this.props.classes.textContent}>
                {this.state.error === undefined ? (
                  <GetStartedView
                    title="1. Connect the ESP32"
                    illustration={
                      <RiveAnimation
                        width={300}
                        height={220}
                        path={process.env.PUBLIC_URL + "/animations/connect_device.riv"}
                      />
                    }
                  >
                    <Typography className={this.props.classes.landingText}>
                      Install the USB serial driver from{" "}
                      <Link href={siliconlabs} target="_blank" rel="noreferrer">
                        Silicon Labs
                      </Link>
                      . Connect the ESP32 to your computer with a USB cable. Then, press the{" "}
                      <Typography className={this.props.classes.boldText}>Ready</Typography> button and choose the port
                      of the ESP32.
                    </Typography>
                  </GetStartedView>
                ) : this.state.error === ConnectError.NOT_FOUND_ERR ? (
                  <ErrorView
                    errorType={ConnectError.NOT_FOUND_ERR}
                    suggestionHeader="Suggestion to fix the error"
                    suggestionContent={[
                      <Typography key={1}>
                        Check that the ESP32 is physically connected to your computer and that the USB cable can
                        transfer data
                      </Typography>,
                      <Typography key={2}>
                        Install the
                        <Link
                          className={this.props.classes.link}
                          color="inherit"
                          href="https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {" "}
                          USB serial driver{" "}
                        </Link>{" "}
                        from Silicon Labs on your computer
                      </Typography>,
                      <Typography key={3}>
                        See the supported ESP32 models at the
                        <Link
                          className={this.props.classes.link}
                          color="inherit"
                          href="https://github.com/toitlang/toit/wiki/Devices"
                          target="_blank"
                          rel="noreferrer"
                        >
                          {" "}
                          Toitlang wiki{" "}
                        </Link>{" "}
                      </Typography>,
                    ]}
                  />
                ) : this.state.error === ConnectError.NETWORK_ERR ? (
                  <ErrorView
                    errorType={ConnectError.NETWORK_ERR}
                    suggestionHeader="Suggestion to fix the error"
                    suggestionContent={[
                      <Typography key={1}>Close other programs that block the use of serial communication</Typography>,
                    ]}
                  />
                ) : this.state.error === ConnectError.HARDWARE_INVALID ? (
                  <ErrorView
                    errorType={ConnectError.HARDWARE_INVALID}
                    suggestionHeader="Suggestion to fix the error"
                    suggestionContent={[
                      <Typography key={1}>Check that your device is an ESP32 and not another type of chip</Typography>,
                      <Typography key={2}>Check that you have chosen the correct USB port</Typography>,
                    ]}
                  />
                ) : (
                  <ErrorView
                    errorType={WizardErrorType.UNKNOWN_ERR}
                    suggestionHeader="An unknown error occurred"
                    suggestionContent={[<Typography key={1}>Unknown error occured. Used CLI instead</Typography>]}
                  />
                )}
              </Grid>
              <Grid container justify="center" className={this.props.classes.bottomGrid}>
                <Grid item className={this.props.classes.bottomInnerGrid}>
                  <Button
                    className={this.props.classes.button}
                    disabled={this.state.inProgress}
                    variant="contained"
                    size="large"
                    endIcon={this.state.inProgress ? undefined : <FaChevronRight />}
                    onClick={() => this.connect()}
                  >
                    {this.state.inProgress ? (
                      <CircularProgress size={20} color="primary" />
                    ) : !this.state.error ? (
                      <>Ready</>
                    ) : (
                      <>Retry</>
                    )}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </ScrollableContainer>
      </Box>
    );
  }
}

export default withStyles(styles)(ConnectView);
