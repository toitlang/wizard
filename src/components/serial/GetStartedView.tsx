import { Box, createStyles, Grid, Theme, Typography, withStyles, WithStyles } from "@material-ui/core";
import React from "react";

const styles = (theme: Theme) =>
  createStyles({
    container: {
      maxWidth: 450,
      textAlign: "center",
    },
    button: {
      marginTop: theme.spacing(2),
    },
    children: { marginTop: theme.spacing(1.5) },
    heading: {
      fontSize: "2rem",
      fontFamily: "Clash Display",
      fontWeight: 500,
    },
  });

interface GetStartedProps extends WithStyles<typeof styles> {
  title: string;
  illustration: React.ReactNode;
  children?: React.ReactChild | React.ReactChild[];
}

class GetStartedView extends React.Component<GetStartedProps> {
  componentDidMount(): void {}

  componentDidUpdate(): void {}

  render(): JSX.Element {
    return (
      <Box className={this.props.classes.container}>
        <Grid container justify="center" direction="row">
          <Grid container justify="center">
            <Typography className={this.props.classes.heading}>{this.props.title}</Typography>
          </Grid>
          <Grid container justify="center" className={this.props.classes.children}>
            {this.props.children}
          </Grid>
          <Grid container justify="center">
            {this.props.illustration}
          </Grid>
        </Grid>
      </Box>
    );
  }
}

export default withStyles(styles)(GetStartedView);
