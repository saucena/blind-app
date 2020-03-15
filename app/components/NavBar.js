/* eslint-disable no-plusplus */
import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';
import MoreIcon from '@material-ui/icons/MoreVert';
// import ShareIcon from '@material-ui/icons/Share';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
// import SettingsIcon from '@material-ui/icons/Settings';
import { moduleCount } from '../constants/device.json';

const fs = require('fs');
const path = require('path');
const childProcess = require('child_process');
const mexp = require('math-expression-evaluator');

const blueprintPath = path.join(
  __dirname,
  '..',
  'app',
  'constants',
  'sketch.ino'
);
const arduinoPath = path.join(__dirname, '..', 'app', 'Arduino', 'graphs');
const sketchPath = path.join(arduinoPath, 'graphs.ino');

mexp.math.isDegree = false;

type Props = {
  graph: object
};

const useStyles = makeStyles(theme => ({
  grow: {
    flexGrow: 1,
    marginBottom: theme.spacing(2)
  },
  backButton: {
    marginRight: theme.spacing(2)
  },
  title: {
    display: 'none',
    [theme.breakpoints.up('xs')]: {
      display: 'block'
    }
  },
  sectionDesktop: {
    display: 'none',
    [theme.breakpoints.up('sm')]: {
      display: 'flex'
    }
  },
  sectionMobile: {
    display: 'flex',
    [theme.breakpoints.up('sm')]: {
      display: 'none'
    }
  }
}));

const positions = values => {
  // add indexes so zero is in the center
  let output = '';

  for (let i = 0; i < moduleCount - 1; i++) {
    output += `${values[i]},`;
  }
  output += values[moduleCount - 1];
  return output;
};

export default function NavBar(props: Props) {
  const { graph } = props;

  const { formula, step, values } = graph;

  const insertGraph = data => {
    let sketch = fs.readFileSync(blueprintPath, 'utf8');

    console.log(positions(data.y));
    sketch = sketch.replace('INSERT_HERE', positions(data.y));

    fs.writeFileSync(sketchPath, sketch);

    try {
      childProcess.execSync(
        `arduino-cli compile --fqbn arduino:avr:uno ${arduinoPath}`
      );
    } catch (error) {
      console.log(error);
    }

    try {
      childProcess.execSync(
        `arduino-cli upload -p COM5 --fqbn arduino:avr:uno ${arduinoPath}`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const classes = useStyles();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMobileMenuOpen = event => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const mobileMenuId = 'primary-more-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      {
        // <MenuItem>
        //   <IconButton color="inherit">
        //     <ShareIcon />
        //   </IconButton>
        //   <p>Share</p>
        // </MenuItem>
      }
      <MenuItem>
        <IconButton onClick={() => onUpload()} color="inherit">
          <PlayArrowIcon />
        </IconButton>
        <p>Upload</p>
      </MenuItem>
      {
        //   <MenuItem>
        //   <IconButton color="inherit">
        //     <SettingsIcon />
        //   </IconButton>
        //   <p>Settings</p>
        // </MenuItem>
      }
    </Menu>
  );

  function onUpload() {
    if (values.isValid) {
      insertGraph(values);
    } else {
      console.log("DATA IS INVALID. CAN'T UPLOAD");
    }
  }

  return (
    <div className={classes.grow}>
      <AppBar position="static">
        <Toolbar>
          <Typography className={classes.title} variant="h6" noWrap>
            TactileTech
          </Typography>
          <div className={classes.grow} />
          <div className={classes.sectionDesktop}>
            {
              // <IconButton color="inherit">
              //   <ShareIcon />
              // </IconButton>
            }
            <IconButton onClick={() => onUpload()} color="inherit">
              <PlayArrowIcon />
            </IconButton>
            {
              // <IconButton color="inherit">
              //   <SettingsIcon />
              // </IconButton>
            }
          </div>
          <div className={classes.sectionMobile}>
            <IconButton
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
    </div>
  );
}
