import { createStyles, CssBaseline, Theme, withStyles, WithStyles } from "@material-ui/core";
import clsx from "clsx";
import { UnregisterCallback } from "history";
import React from "react";
import { Route, RouteComponentProps, Switch, withRouter } from "react-router-dom";
import { dividerGrey, selected, white } from "../assets/theme/theme";
import Wizard from "../containers/wizard/Wizard";

export const drawerWidth = 200;
export const drawerWidthCollapsed = 68;
const drawerWidthMobile = "100%";
const gridSpacing = 8;
const appBarHeight = 64;

const styles = (theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
    },
    appBar: {
      height: appBarHeight,
      color: theme.palette.primary.main,
      // transition: theme.transitions.create(["margin", "width"], {
      //   easing: theme.transitions.easing.sharp,
      //   duration: theme.transitions.duration.leavingScreen,
      // }),
      zIndex: 0,
      backgroundColor: white,
      borderBottomWidth: "1px",
      borderBottomColor: dividerGrey,
      borderBottomStyle: "solid",
    },
    appBarShift: {
      height: appBarHeight,
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      // transition: theme.transitions.create(["margin", "width"], {
      //   easing: theme.transitions.easing.easeOut,
      //   duration: theme.transitions.duration.enteringScreen,
      // }),
    },
    drawerHeader: {
      display: "flex",
      alignItems: "center",
      ...theme.mixins.toolbar,
      height: appBarHeight,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
      whiteSpace: "nowrap",
      [theme.breakpoints.only("xs")]: {
        width: drawerWidthMobile,
        position: "absolute",
      },
    },
    drawerOpen: {
      width: drawerWidth,
      [theme.breakpoints.only("xs")]: {
        width: drawerWidthMobile,
      },
      // transition: theme.transitions.create("width", {
      //   easing: theme.transitions.easing.sharp,
      //   duration: theme.transitions.duration.enteringScreen,
      // }),
    },
    drawerClose: {
      // transition: theme.transitions.create("width", {
      //   easing: theme.transitions.easing.sharp,
      //   duration: theme.transitions.duration.leavingScreen,
      // }),
      width: 0,
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(6),
      },
    },
    drawerPaper: {
      borderRight: 0,
      overflow: "hidden",
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.light,
    },
    logo: {
      marginLeft: "13px",
      height: "1rem",
    },
    menuButton: {
      position: "absolute",
      right: theme.spacing(1.5),
      padding: 0,
    },
    menuExpandButton: {
      padding: 0,
      marginRight: theme.spacing(1.25),
    },
    appbarHeader: {
      marginLeft: drawerWidth + theme.spacing(1),
      display: "flex",
      alignItems: "center",
    },
    appbarHeaderAndIcon: {
      marginLeft: theme.spacing(1),
      display: "flex",
      alignItems: "center",
      [theme.breakpoints.up("sm")]: {
        marginLeft: drawerWidthCollapsed + theme.spacing(2) - 12,
      },
    },
    hide: {
      display: "none",
    },
    toolbar: {
      height: appBarHeight,
    },
    appBarContent: {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
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
    title: {
      flexGrow: 1,
    },
    typography: {
      padding: theme.spacing(3),
    },
    button: {
      color: theme.palette.common.black,
    },
    appBarRight: {
      display: "flex",
      alignItems: "center",
      marginLeft: "auto",
    },
    exitButton: {
      color: theme.palette.common.black,
      "&:hover": {
        backgroundColor: "transparent",
      },
    },
    list: {
      overflowX: "hidden",
      overflow: "auto",
    },
    listItem: {
      "&:hover, &.Mui-selected, &.Mui-selected:hover": {
        backgroundColor: selected,
      },
    },
    icon: {
      color: "black",
    },
    orgNameAndHelp: {
      display: "flex",
      alignItems: "center",
    },
    buttonDevEnv: {
      width: 110,
      fontWeight: 300,
    },
    bottomContent: {
      height: "100%",
      alignContent: "center",
      marginBottom: theme.spacing(2),
    },
    freeContainer: {
      paddingBottom: theme.spacing(2),
      width: 168,
    },
    progressionContainer: {
      paddingBottom: theme.spacing(3),
      width: 168,
    },
    columnContainer: {
      width: "100%",
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

  toggleMenu = (b: boolean) => () => {
    this.setState({ menuShown: b });
    sessionStorage.setItem("menuWidth", b === true ? drawerWidth.toString() : "0");
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
