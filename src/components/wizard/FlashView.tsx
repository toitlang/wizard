import { Box, createStyles, Grid, LinearProgress, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import { UnregisterCallback } from "history";
import React from "react";
import { Beforeunload } from "react-beforeunload";
import { RouteComponentProps, withRouter } from "react-router";
import { DetectState } from "../../actions/serial";
import { FlashingProperties, WizardAction, WizardError } from "../../actions/wizard";
import { black, pythonShade, white } from "../../assets/theme/theme";
import * as Serial from "../../misc/serial";
import ScrollableContainer from "../general/ScrollableContainer";
import { closePort } from "../general/util";

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
    percentage: {
      //BOLD
      fontSize: "2rem",
      fontFamily: "Clash Display",
      fontWeight: 700,
    },
    progressbar: {
      width: 260,
    },
    progressDescriptionText: {
      paddingTop: theme.spacing(0.5),
      fontSize: 11,
    },
  });

const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderStyle: "solid",
      borderColor: black,
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === "light" ? 200 : 700],
    },
    bar: {
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      backgroundColor: pythonShade,
    },
  })
)(LinearProgress);

interface FlashProps extends WithStyles<typeof styles>, RouteComponentProps {
  flashingProperties?: FlashingProperties;
  currentPort?: SerialPort;
  detectState?: DetectState;
  currentPortOpen?: boolean;
  updateDetectState: (state?: DetectState) => void;
  updateCurrentPortOpen: (state: boolean) => void;
  updateFlashingProperties: (state: FlashingProperties) => void;
  updateCurrentAction: (state: WizardAction | WizardError) => void;
}

interface FlashState {
  serialSupported: boolean;
  inProgress: boolean;
  output: OutputItem[];
  flashState: Serial.FlashState;
  flashDetails?: Serial.FlashDetails;
  flashPercentage: number;
}

export type OutputItem = {
  type: "out" | "err";
  text: string;
};

export class FlashLogger {
  private view: FlashView;
  private currentProgress?: string;

  constructor(view: FlashView) {
    this.view = view;
  }

  debug(message?: unknown, ...optionalParams: unknown[]): void {
    console.debug(message, ...optionalParams);
  }

  format(message?: unknown, ...optionalParams: unknown[]): string {
    let res = "";
    if (message !== undefined) {
      res += message;
    }
    optionalParams.forEach((v) => (res += " " + v));
    return res;
  }

  log(message?: unknown, ...optionalParams: unknown[]): void {
    const msg = this.format(message, ...optionalParams);
    this.view.setState((state, props) => ({
      output: [...state.output, { type: "out", text: msg }],
    }));
  }

  reset(): void {
    this.view.setState({
      output: [],
    });
  }

  error(message?: unknown, ...optionalParams: unknown[]): void {
    const msg = this.format(message, ...optionalParams);
    this.view.setState((state, props) => ({
      output: [...state.output, { type: "err", text: msg }],
    }));
  }

  progress(item: string, i: number, total: number): void {
    const percent = ((i + 1) / total) * 100;

    this.view.setState((state, props) => {
      const res: OutputItem[] = [...state.output];
      if (item == this.currentProgress) {
        res.pop();
      }
      this.currentProgress = item;

      res.push({ text: percent.toFixed(2) + "%", type: "out" });
      return {
        output: res,
      };
    });
  }

  //Displays animated dots while waiting for the loop to finish
  waiting(item: string, i: number, total: number): void {
    const numberOfDots = i % 4;
    let dotsText = "";
    for (i = 0; i < numberOfDots; i++) {
      dotsText += ".";
    }

    this.view.setState((state, props) => {
      const res: OutputItem[] = [...state.output];
      if (item == this.currentProgress) {
        res.pop();
      }
      this.currentProgress = item;

      res.push({ text: item + dotsText, type: "out" });
      return {
        output: res,
      };
    });
  }
}

class FlashView extends React.Component<FlashProps, FlashState> {
  constructor(props: FlashProps) {
    super(props);

    this.state = {
      serialSupported: Serial.isSupported(),
      inProgress: false,
      output: [],
      flashState: Serial.FlashState.STARTED,
      flashPercentage: 0,
    };
  }

  private unblock: UnregisterCallback | undefined;
  async componentDidMount() {
    this.unblock = this.props.history.block((tx) => {
      if (!this.state.inProgress || window.confirm("This will stop the flash process!")) {
        if (this.unblock !== undefined) {
          this.unblock();
          this.unblock = undefined;
        }
        return;
      }
      return false;
    });

    if (this.props.flashingProperties) {
      await this.flash(this.props.flashingProperties);
    } else {
      console.log("No flashing properties available");
      this.props.updateCurrentAction(WizardAction.SETUP);
    }
  }

  componentWillUnmount() {
    if (this.unblock !== undefined) {
      this.unblock();
      this.unblock = undefined;
    }
  }

  componentDidUpdate(prevProps: FlashProps, prevState: FlashState) {
    if (
      this.state.flashState !== prevState.flashState ||
      (this.state.flashDetails && this.state.flashDetails !== prevState.flashDetails)
    ) {
      let connecting_counter = 0;
      let erase_counter = 10;
      const erased = 35;
      switch (this.state.flashState) {
        case Serial.FlashState.CONNECTING:
          const connectInterval = setInterval(() => {
            if (this.state.flashState === Serial.FlashState.CONNECTING) {
              connecting_counter++;
              if (connecting_counter < erase_counter) {
                this.setState({ flashPercentage: connecting_counter });
              } else {
                // TODO: Show a this takes longer than normal.
                clearInterval(connectInterval);
              }
            } else {
              clearInterval(connectInterval);
            }
          }, 200);
          this.setState({ flashPercentage: connecting_counter });
          break;
        case Serial.FlashState.CONNECTED:
          this.setState({ flashPercentage: erase_counter });
          break;
        case Serial.FlashState.ERASING:
          const eraseInterval = setInterval(() => {
            if (this.state.flashState === Serial.FlashState.ERASING) {
              erase_counter++;
              if (erase_counter < erased) {
                this.setState({ flashPercentage: erase_counter });
              } else {
                // TODO: Show a this takes longer than normal.
                clearInterval(eraseInterval);
              }
            } else {
              clearInterval(eraseInterval);
            }
          }, 1000);
          // TODO: DO THIS NON BLOCKING
          // if (connecting_counter < erase_counter)
          //   const interval = setInterval(() => this.setState({ flashPercentage: erase_counter++ }), 200);
          this.setState({ flashPercentage: erase_counter });
          break;
        case Serial.FlashState.ERASED:
          this.setState({ flashPercentage: erased });
          break;
        case Serial.FlashState.WRITING:
          if (this.state.flashDetails)
            this.setState({
              flashPercentage: erased + (this.state.flashDetails?.idx / this.state.flashDetails?.total) * 65,
            });
          else console.log("No flashDetails provided");
          break;
        default:
          break;
      }
    }
  }

  async onFlash(properties: FlashingProperties): Promise<boolean> {
    if (!this.props.currentPort) {
      return false;
    }
    const port = this.props.currentPort;

    if (this.props.currentPortOpen) {
      await closePort(this.props);
    }
    const logger = new FlashLogger(this);
    logger.reset();

    const detectState = this.props.detectState;
    let partitions: Serial.Partition[];
    // TODO: Fetch partitions.

    this.props.updateCurrentAction(WizardAction.DONE);
    return true;
  }

  async flash(properties: FlashingProperties) {
    this.setState({
      inProgress: true,
    });
    try {
      const flashed = await this.onFlash(properties);
    } catch (e) {
      console.log("Uncaught exception from flash", e);
    } finally {
      this.setState({
        inProgress: false,
      });
    }
  }

  render() {
    const state: FlashState = this.state || {};
    return (
      <Box className={this.props.classes.scrollableWrapper}>
        <ScrollableContainer>
          <Grid className={this.props.classes.containerWrapper} container direction="row" justify="center">
            <Grid container justify="center" className={this.props.classes.contentContainer}>
              <Grid item xs={12} className={this.props.classes.textContent}>
                <Typography className={this.props.classes.heading}>3. Flash</Typography>
                <Typography className={this.props.classes.descriptionText}>
                  Hold tight while your device is being flashed with Jaguar
                </Typography>
              </Grid>
              <Grid item xs={12} className={this.props.classes.textContent}>
                <Typography className={this.props.classes.percentage}>
                  {this.state.flashPercentage.toFixed(0)}%
                </Typography>
                <Grid container justify="center">
                  <BorderLinearProgress
                    variant="determinate"
                    value={this.state.flashPercentage}
                    className={this.props.classes.progressbar}
                  />
                </Grid>
                <Typography className={this.props.classes.progressDescriptionText}>
                  {state.flashState === Serial.FlashState.STARTED
                    ? "Warming up"
                    : state.flashState === Serial.FlashState.CONNECTING
                    ? "Connecting..."
                    : state.flashState === Serial.FlashState.CONNECTED
                    ? "Connected"
                    : state.flashState === Serial.FlashState.ERASING
                    ? "Preparing your device"
                    : state.flashState === Serial.FlashState.ERASED
                    ? "Device is ready"
                    : state.flashState === Serial.FlashState.WRITING
                    ? "Installing Jaguar"
                    : state.flashState === Serial.FlashState.SUCCESS
                    ? "Successfully installed Jaguar"
                    : "An error occured"}
                </Typography>
                {/*
                TODO: Add support for serial output here
                */}
              </Grid>
            </Grid>
          </Grid>
        </ScrollableContainer>
        {this.state.inProgress && <Beforeunload onBeforeunload={() => "This will stop the flash process!"} />}
      </Box>
    );
  }
}

export default withRouter(withStyles(styles)(FlashView));
