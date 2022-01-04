import { createStyles, CssBaseline, Theme, withStyles, WithStyles } from "@material-ui/core";
import clsx from "clsx";
import { UnregisterCallback } from "history";
import React from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import Wizard from "../containers/wizard/Wizard";

const gridSpacing = 8;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    content: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.default,
      padding: gridSpacing / 2,
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      marginLeft: 0,
      width: "calc(100% - " + 0 + "px)",
    },
    contentShift: {
      transition: theme.transitions.create("margin", {
        easing: theme.transitions.easing.easeOut,
        duration: theme.transitions.duration.enteringScreen,
      }),
      marginLeft: 0,
    },
    list: {
      overflowX: "hidden",
      overflow: "auto",
    },
    icon: {
      color: "black",
    },
  });

interface MainProps extends WithStyles<typeof styles>, RouteComponentProps {}

interface MenuState {
  menuShown: boolean;
  currentPage?: PageComponent;
}

interface PageComponent {
  name: string;
  routepath: string;
  linkpath: string;
  exact: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render: (props: RouteComponentProps<any>) => React.ReactNode;
  icon?: JSX.Element;
  showInMenu?: boolean;
  selected?: string[];
  start?: boolean;
  developmentOnly?: boolean;
  newMenuGroup?: boolean;
  badge?: string;
}

class MainView extends React.Component<MainProps, MenuState> {
  unlisten?: UnregisterCallback = undefined;

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  state = {
    menuShown: true,
  };

  static pages: PageComponent[] = [
    {
      name: "SetupWizard",
      routepath: "/",
      linkpath: "wizard",
      exact: true,
      render: (routeProps) => <Wizard />,
      selected: ["/"],
    },
  ];

  static findCurrentPageComponent = (location: string): PageComponent | undefined => {
    for (let i = 0; i < MainView.pages.length; i++) {
      const page = MainView.pages[i];
      if (location === "/" && page.start) {
        return page;
      } else if (page.selected) {
        if (page.selected.filter((path) => location.startsWith(path)).length > 0) {
          return page;
        }
      }
    }
    return undefined;
  };

  render() {
    const { classes } = this.props;

    return (
      <div className={classes.root}>
        <CssBaseline />

        <main className={clsx(classes.content, { [classes.contentShift]: this.state.menuShown })}>
          <Switch>
            {MainView.pages.map((page, index) => (
              <Route key={index} path={page.routepath} exact={page.exact} render={page.render} />
            ))}
          </Switch>
        </main>
      </div>
    );
  }
}

export default withRouter(withStyles(styles)(MainView));
