import { Breadcrumbs, createStyles, Grid, Theme, Tooltip, Typography, withStyles, WithStyles } from "@material-ui/core";
import queryString from "query-string";
import React from "react";
import { DetectState } from "../../actions/serial";
import { FlashingProperties, WizardAction, WizardError, WizardErrorType } from "../../actions/wizard";
import { tigerShade } from "../../assets/theme/theme";
import Connect from "../../containers/wizard/Connect";
import Flash from "../../containers/wizard/Flash";
import Setup from "../../containers/wizard/Setup";
import * as Serial from "../../misc/serial";
import { initialWizardState } from "../../reducers/wizard";
import HeaderBodyView, { Body, Header } from "../general/HeaderBodyView";
import { closePort } from "../general/util";
import DoneView from "./DoneView";
import ErrorButtonView from "./ErrorButtonView";
import { ReactComponent as ArrowIcon } from "./images/arrow.svg";
import { ReactComponent as ConnectFocusIcon } from "./images/connect_focus.svg";
import { ReactComponent as DoneIcon } from "./images/done.svg";
import { ReactComponent as ProvisionIcon } from "./images/provision.svg";
import { ReactComponent as ProvisionFocusIcon } from "./images/provision_focus.svg";
import { ReactComponent as WifiIcon } from "./images/wifi.svg";
import { ReactComponent as WifiFocusIcon } from "./images/wifi_focus.svg";

const styles = (theme: Theme) =>
  createStyles({
    container: {
      width: "100%",
      height: "calc(100vh - 214px)",
      textAlign: "center",
    },
    navigation: {
      width: "calc(100% + 8px)",
      marginLeft: -4,
      height: 150,
      backgroundColor: tigerShade,
      alignContent: "center",
      justifyContent: "center",
    },
    breadcrumbGrid: {
      minWidth: 400,
      width: 580,
      height: 100,
      display: "flex",
      alignItems: "center",
    },
    unfocused: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
    },
    focused: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontWeight: 500,
    },
    icon: {
      width: 50,
      height: 51,
    },
    arrow: {
      marginBottom: 16,
    },
    boldText: {
      fontWeight: 500,
      display: "inline-block",
    },
  });

interface WizardProps extends WithStyles<typeof styles> {
  currentPort?: SerialPort | undefined;
  detectState?: DetectState;
  currentPortOpen?: boolean;
  flashingProperties?: FlashingProperties;
  currentAction?: WizardAction | WizardError;

  updateDetectState: (state: DetectState) => void;
  updateCurrentPort: (state: SerialPort | undefined) => void;
  updateCurrentPortOpen: (state: boolean) => void;
  updateFlashingProperties: (state: FlashingProperties) => void;
  updateCurrentAction: (state: WizardAction | WizardError) => void;
}

export const StyledBreadcrumbs = withStyles((theme) => ({
  root: {
    width: "100%",
    "& .MuiBreadcrumbs-ol": {
      justifyContent: "space-between",
    },
  },
}))(Breadcrumbs);

class WizardView extends React.Component<WizardProps> {
  constructor(props: WizardProps) {
    super(props);
  }

  viewRenderer(action?: WizardAction | WizardError): JSX.Element | undefined {
    switch (action) {
      case WizardAction.CONNECT:
        return <Connect />;
      case WizardAction.SETUP:
        return <Setup />;
      case WizardAction.FLASH:
        return <Flash />;
      case WizardAction.DONE:
        return <DoneView />;
      case undefined:
        return undefined;
      default:
        switch (action.type) {
          case WizardErrorType.FLASH_ERR:
            return (
              <ErrorButtonView
                buttonFunction={() => this.props.updateCurrentAction(WizardAction.SETUP)}
                buttonText="Try again"
                title="Error"
              />
            );
          case WizardErrorType.CREATE_PARTITION_ERR:
            return (
              <ErrorButtonView
                buttonFunction={() => this.props.updateCurrentAction(WizardAction.SETUP)}
                buttonText="Try again"
                title="Internal error"
              />
            );
          case WizardErrorType.SERIAL_NOT_SUPPORT:
            return (
              <ErrorButtonView
                buttonHref="https://docs.toit.io/getstarted/installation"
                buttonText="Install Toit locally"
                buttonTarget="_blank"
                title="Serial not supported in your browser"
                description={false}
              >
                Serial is not supported in the browser you use. We currently only support desktop versions of
                <strong> Google Chrome</strong> and <strong>Microsoft Edge</strong>.<br />
                <br />
                Alternative you can install the local Toit Development Environment and flash your device using the
                Command Line.
              </ErrorButtonView>
            );
          default:
            break;
        }
    }
  }

  async onDisconnect() {
    try {
      await closePort(this.props);
    } catch (e) {
      console.log("Failed to close ports on disconnect", e);
    }
    this.props.updateCurrentPort(undefined);
    this.props.updateCurrentAction(WizardAction.CONNECT);
  }

  componentDidMount() {
    const query = queryString.parse(window.location.search);

    if (!Serial.isSupported()) {
      this.props.updateCurrentAction({
        type: WizardErrorType.SERIAL_NOT_SUPPORT,
        error: "serial not supported",
      });
      return;
    }

    if (
      query["connected"] !== undefined &&
      this.props.currentPort !== undefined &&
      this.props.detectState?.hardwareValid
    ) {
      this.props.updateCurrentAction(WizardAction.SETUP);
    } else {
      this.props.updateCurrentPort(undefined);
      this.props.updateCurrentAction(initialWizardState.currentAction);
    }
    navigator.serial.ondisconnect = async () => {
      await this.onDisconnect();
    };
  }

  async componentDidUpdate() {
    if (this.props.currentAction === WizardAction.DONE && this.props.currentPort) {
      try {
        await closePort(this.props);
      } catch (e) {
        console.log("Failed to close", e);
      }
      this.props.updateCurrentPort(undefined);
    }
  }

  async componentWillUnmount() {
    await closePort(this.props);
  }

  render() {
    return (
      <HeaderBodyView>
        <Header>
          <Grid container className={this.props.classes.navigation}>
            <Grid item className={this.props.classes.breadcrumbGrid}>
              {this.props.currentAction && (
                <StyledBreadcrumbs
                  aria-label="breadcrumb"
                  separator={<ArrowIcon className={this.props.classes.arrow} />}
                >
                  <Tooltip title="Creates a connection between your device and computer">
                    <Typography
                      color="textPrimary"
                      className={
                        this.props.currentAction === WizardAction.CONNECT
                          ? this.props.classes.focused
                          : this.props.classes.unfocused
                      }
                    >
                      {this.props.currentAction === WizardAction.CONNECT ? (
                        <ConnectFocusIcon className={this.props.classes.icon} />
                      ) : (
                        <DoneIcon className={this.props.classes.icon} />
                      )}
                      Connect
                    </Typography>
                  </Tooltip>
                  <Tooltip title="WiFi credentials are used to connect your device to the internet">
                    <Typography
                      color="textPrimary"
                      className={
                        this.props.currentAction === WizardAction.SETUP
                          ? this.props.classes.focused
                          : this.props.classes.unfocused
                      }
                    >
                      {this.props.currentAction === WizardAction.SETUP ? (
                        <WifiFocusIcon className={this.props.classes.icon} />
                      ) : this.props.currentAction > WizardAction.SETUP ? (
                        <DoneIcon className={this.props.classes.icon} />
                      ) : (
                        <WifiIcon className={this.props.classes.icon} />
                      )}
                      Setup
                    </Typography>
                  </Tooltip>
                  <Tooltip title="Installs Toit firmware on your ESP32">
                    <Typography
                      color="textPrimary"
                      className={
                        this.props.currentAction === WizardAction.FLASH
                          ? this.props.classes.focused
                          : this.props.classes.unfocused
                      }
                    >
                      {this.props.currentAction === WizardAction.FLASH ? (
                        <ProvisionFocusIcon className={this.props.classes.icon} />
                      ) : this.props.currentAction > WizardAction.FLASH ? (
                        <DoneIcon className={this.props.classes.icon} />
                      ) : (
                        <ProvisionIcon className={this.props.classes.icon} />
                      )}
                      Flash
                    </Typography>
                  </Tooltip>
                </StyledBreadcrumbs>
              )}
            </Grid>
          </Grid>
        </Header>
        <Body>{this.viewRenderer(this.props.currentAction)}</Body>
      </HeaderBodyView>
    );
  }
}

export default withStyles(styles)(WizardView);
