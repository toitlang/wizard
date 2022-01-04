import {
  Box,
  Button,
  Checkbox,
  createStyles,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Select,
  Theme,
  Typography,
  withStyles,
  WithStyles,
} from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import React from "react";
import { reactLocalStorage } from "reactjs-localstorage";
import { DetectState } from "../../actions/serial";
import { FlashingProperties, WizardAction, WizardError } from "../../actions/wizard";
import { white } from "../../assets/theme/theme";
import ScrollableContainer from "../general/ScrollableContainer";
import AdvancedCollapsable from "../serial/AdvancedCollapsable";

const styles = (theme: Theme) =>
  createStyles({
    contentContainer: {
      maxWidth: 440,
    },
    textContent: {
      paddingTop: theme.spacing(5),
    },
    button: {
      height: 36,
      width: 120,
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
      fontFamily: "ClashDisplay-Medium",
    },
    form: {
      width: "100%",
    },
    inputRow: {
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
    advancedContent: {
      textAlign: "start",
    },
    selectText: {
      marginTop: theme.spacing(2),
      fontSize: "0.625rem",
    },
  });

interface SetupProps extends WithStyles<typeof styles> {
  detectState?: DetectState;
  flashingProperties?: FlashingProperties;
  updateFlashingProperties: (state: FlashingProperties) => void;
  updateCurrentAction: (state: WizardAction | WizardError) => void;
}

interface SetupState {
  ssid: string;
  password: string;
  compatibleModelsForSelectedFirmware: string[];
  firmwareName: string;
  firmwareModel: string;
  autoClaim: boolean;
  model: string;
  showPassword: boolean;
  remember: boolean;
}

//Name constants used in localStorage
const toitWifiSSID = "toit_wifi_ssid";
const toitWifiPassword = "toit_wifi_password";
const toitRemember = "toit_remember";

class SetupView extends React.Component<SetupProps, SetupState> {
  initialState = {
    ssid: reactLocalStorage.get(toitWifiSSID, "").toString() || "",
    password: reactLocalStorage.get(toitWifiPassword, "").toString() || "",
    firmwareModel: "esp32-4mb",
    autoClaim: true,
    showPassword: false,
    remember: reactLocalStorage.get("toit_remember", false),
  };

  constructor(props: SetupProps) {
    super(props);
  }

  componentDidMount() {
    this.setState(this.initialState);
  }

  beginFlash(flashingProperties: FlashingProperties) {
    this.props.updateFlashingProperties({
      ssid: flashingProperties.ssid,
      password: flashingProperties.password,
      firmware: flashingProperties.firmware,
      model: flashingProperties.model,
      autoClaim: flashingProperties.autoClaim,
    });
    if (this.state.remember) {
      reactLocalStorage.set(toitWifiSSID, this.state.ssid);
      reactLocalStorage.set(toitWifiPassword, this.state.password);
      reactLocalStorage.set(toitRemember, this.state.remember);
    } else {
      reactLocalStorage.remove(toitWifiSSID);
      reactLocalStorage.remove(toitWifiPassword);
      reactLocalStorage.remove(toitRemember);
    }
    this.props.updateCurrentAction(WizardAction.FLASH);
  }

  render() {
    const state: SetupState = this.state || {};
    return (
      <Box className={this.props.classes.scrollableWrapper}>
        <ScrollableContainer>
          <Grid className={this.props.classes.containerWrapper} container direction="row" justify="center">
            <Grid container justify="center" className={this.props.classes.contentContainer}>
              <Grid item xs={12} className={this.props.classes.textContent}>
                <Typography className={this.props.classes.heading}>2. WiFi credentials</Typography>
                <Typography variant="body2">Connect the ESP32 to your WiFi</Typography>
              </Grid>
              <Grid item xs={12} className={this.props.classes.textContent}>
                <form noValidate autoComplete="off" className={this.props.classes.form}>
                  <FormControl fullWidth className={this.props.classes.inputRow}>
                    <InputLabel>Network name (SSID) *</InputLabel>
                    <Input
                      className={this.props.classes.inputRow}
                      type="text"
                      value={state.ssid}
                      onChange={(e) => this.setState(() => ({ ssid: e.target.value || "" }))}
                      autoComplete="off"
                      aria-describedby="helper-text"
                    />
                    <FormHelperText id="helper-text">Note: The ESP32 only supports 2.4GHz networks</FormHelperText>
                  </FormControl>
                  <FormControl fullWidth className={this.props.classes.inputRow}>
                    <InputLabel htmlFor="standard-adornment-password">Password *</InputLabel>
                    <Input
                      className={this.props.classes.inputRow}
                      type={state.showPassword ? "text" : "password"}
                      value={state.password}
                      autoComplete="one-time-code"
                      onChange={(e) => this.setState(() => ({ password: e.target.value || "" }))}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => this.setState({ showPassword: !state.showPassword })}
                            onMouseDown={() => this.setState({ showPassword: !state.showPassword })}
                          >
                            {state.showPassword ? <Visibility /> : <VisibilityOff />}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>
                  <AdvancedCollapsable>
                    <Grid container className={this.props.classes.advancedContent}>
                      <InputLabel htmlFor="Version" className={this.props.classes.selectText}>
                        Firmware version
                      </InputLabel>
                      <Select
                        labelId="select-firmware-name"
                        id="firmware-name-selector"
                        value={state.firmwareName}
                        fullWidth
                      ></Select>
                      <Grid container item xs={12} className={this.props.classes.inputRow}>
                        <Grid container item xs={8} alignContent="center">
                          <Typography>Remember settings locally?</Typography>
                        </Grid>
                        <Grid container item xs={4} justify="flex-end">
                          <Checkbox
                            value={state.remember}
                            checked={state.remember}
                            onClick={() => this.setState({ remember: !state.remember })}
                            color="primary"
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </AdvancedCollapsable>
                </form>
              </Grid>
              <Grid container justify="center" className={this.props.classes.bottomGrid}>
                <Grid item className={this.props.classes.bottomInnerGrid}>
                  <Button
                    className={this.props.classes.button}
                    variant="contained"
                    size="large"
                    disabled={state.ssid === ""}
                    onClick={() =>
                      this.beginFlash({
                        ssid: state.ssid,
                        password: state.password,
                        firmware: state.firmwareName,
                        autoClaim: state.autoClaim,
                        model: state.firmwareModel,
                      })
                    }
                  >
                    <>Flash &gt;</>
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

export default withStyles(styles)(SetupView);
