import { Button, Grid, Typography, WithStyles, withStyles } from "@material-ui/core";
import Collapse from "@material-ui/core/Collapse";
import { createStyles, Theme } from "@material-ui/core/styles";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import React from "react";
import { white } from "../../assets/theme/theme";

const styles = (theme: Theme) =>
  createStyles({
    root: {
      width: "100%",
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    listItem: {
      color: white,
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
