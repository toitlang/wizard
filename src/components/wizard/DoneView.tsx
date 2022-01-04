import { Box, Button, createStyles, Grid, Theme, withStyles, WithStyles } from "@material-ui/core";
import React from "react";
import { white } from "../../assets/theme/theme";
import ScrollableContainer from "../general/ScrollableContainer";

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
    button: {
      minWidth: 100,
      height: 36,
      marginRight: theme.spacing(0.5),
      marginLeft: theme.spacing(0.5),
    },
  });

type DoneProps = WithStyles<typeof styles>;

class DoneView extends React.Component<DoneProps> {
  render() {
    return (
      <Box className={this.props.classes.scrollableWrapper}>
        <ScrollableContainer>
          <Grid className={this.props.classes.containerWrapper} container direction="row" justify="center">
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
              </Grid>
            </Grid>
          </Grid>
        </ScrollableContainer>
      </Box>
    );
  }
}

export default withStyles(styles)(DoneView);
