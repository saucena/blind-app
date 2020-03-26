/* eslint-disable eqeqeq */
/* eslint-disable no-unused-vars */
/* eslint-disable no-restricted-globals */
/* eslint-disable react/prop-types */
/* eslint-disable no-plusplus */
/* eslint react/prop-types: 0 */
// @flow
import React from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import { makeStyles } from '@material-ui/core/styles';
import { CardMedia, Card } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import NavBarContainer from '../containers/NavBarContainer';

import graphImage from '../../resources/graphs/1.png';
import { moduleCount } from '../constants/device.json';

const mexp = require('math-expression-evaluator');
const fs = require('fs');
const path = require('path');
const plotly = require('plotly')('lb4418', 'DS5f9RMG7cljvlteDUWa');

const graphsPath = path.join(__dirname, '..', 'resources', 'graphs');

mexp.math.isDegree = false;

// const path = require('path');

// const imagePath = path.join(
//   __dirname,
//   '..',
//   'app',
//   'Arduino',
//   'graphs',
//   '1.png'
// );

type Props = {
  editGraph: string => void,
  editStep: number => void,
  editValidity: boolean => void,
  editLoading: boolean => void
};

const styles = theme => ({
  grid: {
    padding: theme.spacing(2)
    // textAlign: 'center',
    // color: theme.palette.text.secondary,
  },
  // child: {
  //   padding: theme.spacing(1)
  // },
  myGraphs: {
    padding: theme.spacing(1)
  },
  title: {
    paddingLeft: theme.spacing(1)
  }
});

const useStyles = makeStyles(styles);

const mapRange = (value, x1, y1, x2, y2) =>
  value.map(v => ((v - x1) * (y2 - x2)) / (y1 - x1) + x2);

const validate = (text, step) => {
  // ensure 2x => 2*x
  const expression = text.replace(/ /g, '');
  let expSplit = expression.split('x');
  expSplit = expSplit.map((x, i) => {
    const lastChar = x.charAt(x.length - 1);
    const num = Number.parseInt(lastChar, 10);
    // eslint-disable-next-line no-restricted-globals
    if (!isNaN(num) && i < x.length - 2) {
      // eslint-disable-next-line no-param-reassign
      x += '*';
    }
    return x;
  });

  const axesOutput = {
    y: [],
    x: [],
    unscaled: [],
    isValid: true
  };

  if (step > 0) {
    let tmpExpression;

    console.log(expSplit.join('x'));
    for (
      let i = -Math.floor(moduleCount / 2);
      i <= Math.floor(moduleCount / 2);
      i++
    ) {
      axesOutput.x.push(i * Number(step));
      if (i * Number(step) < 0) {
        tmpExpression = expSplit.join(`(${i * Number(step)})`);
      } else {
        tmpExpression = expSplit.join(i * Number(step));
      }
      let value;
      try {
        value = mexp.eval(tmpExpression);
      } catch (error) {
        console.log(error);
        // axesOutput.isValid = false;
      }
      axesOutput.y.push(value);
    }
  } else axesOutput.isValid = false;

  if (!axesOutput.isValid) {
    axesOutput.x = [];
    axesOutput.y = [];
    axesOutput.unscaled = [];
  } else {
    // console.log(axesOutput.isValid);

    const max = Math.max(
      ...axesOutput.y.filter(
        x => !isNaN(x) && x != null && x != 'Infinity' && x != '-Infinity'
      )
    );
    const min = Math.min(
      ...axesOutput.y.filter(
        x => !isNaN(x) && x != null && x != 'Infinity' && x != '-Infinity'
      )
    );

    axesOutput.y = axesOutput.y.map(x => {
      if (isNaN(x) || x == null || x == '-Infinity' || x == 'Infinity') {
        return min;
      }
      return x;
    });

    // axesOutput.isValid = true;

    axesOutput.unscaled = axesOutput.y;

    axesOutput.y = mapRange(axesOutput.y, min, max, 0, 100);
  }
  return axesOutput;
};

export default function Home(props: Props) {
  const {
    editGraph,
    editStep,
    editValidity,
    editLoading,
    editValues,
    showGraph,
    graph
  } = props;
  const { formula, step, isValid, isLoading, values, isVisible } = graph;
  const classes = useStyles();

  const graphImageComponent = () => {
    if (isLoading) {
      return <CircularProgress />;
    }
    if (isVisible) {
      return (
        <Card>
          <CardMedia src={graphImage} component="img" title="Some title" />
        </Card>
      );
    }
  };

  function generatePlot(data) {
    return new Promise((resolve, reject) => {
      const trace1 = {
        x: data.x,
        y: data.unscaled,
        mode: 'markers',
        type: 'scatter'
      };

      const figure = { data: [trace1] };

      const imgOpts = {
        format: 'png',
        width: 1000,
        height: 500
      };

      plotly.getImage(figure, imgOpts, (error, imageStream) => {
        if (error) return reject(error);
        const fileStream = fs.createWriteStream(path.join(graphsPath, '1.png'));
        // console.log(imageStream);
        imageStream.pipe(fileStream);
        fileStream.on('finish', () => {
          // console.log('called');
          setTimeout(resolve, 1000);
        });
      });
    });
  }

  function createGraphImage(data) {
    // editLoading(true);
    if (data.isValid) {
      generatePlot(data)
        .then(() => {
          editLoading(false);
          return showGraph(true);
        })
        .catch(err => {
          console.log(err);
          showGraph(false);
          editLoading(false);
        });
    }
  }

  function onFormulaChange(value) {
    editGraph(value);
    const data = validate(value, step);
    editValues(data);
    if (!data.isValid) {
      showGraph(false);
      // editLoading(false);
    }
    editValidity(data.isValid);
    // console.log(data);
    // createGraphImage(data);
  }

  function onStepChange(value) {
    editStep(Number(value));
    const data = validate(formula, Number(value));
    editValues(data);
    if (!data.isValid) {
      showGraph(false);
      // editLoading(false);
    }
    editValidity(data.isValid);
    // console.log(data);
    // createGraphImage(data);
  }

  function onPreview() {
    // const data = validate(formula, step);
    // editValues(data);
    // editValidity(data.isValid);
    if (values.isValid) {
      editLoading(true);
      createGraphImage(values);
    }
  }

  return (
    <div>
      <NavBarContainer />
      <Grid container class={classes.myGraphs} spacing={3}>
        <Grid className={classes.grid} item xs={12}>
          <Typography variant="h4" gutterBottom>
            New Graph
          </Typography>
          <Typography variant="body1">
            Enter a graph you want displayed:
          </Typography>
          <TextField
            onChange={event => {
              onFormulaChange(event.target.value);
            }}
            onlabel="Formula"
            variant="outlined"
          />
        </Grid>
        <Grid className={classes.grid} item xs={12}>
          <Typography variant="body1">Enter your step size:</Typography>
          <TextField
            className={classes.child}
            onChange={event => {
              onStepChange(event.target.value);
            }}
            onlabel="Step size"
            variant="outlined"
            type="number"
          />
        </Grid>
        <Grid className={classes.grid} item xs={12}>
          <Button
            onClick={() => {
              onPreview();
            }}
            className={classes.child}
            color="primary"
            variant="contained"
          >
            Preview
          </Button>
        </Grid>
      </Grid>
      <Divider variant="fullWidth" />
      {graphImageComponent()}
    </div>
  );
}

/*
<Grid container class={classes.MyGraphs} spacing={3}>
        <Grid item xs={12} md={10} lg={6}>
          <Typography variant="h4" gutterBottom>
            My Graphs
          </Typography>
          <Typography variant="body1">
            To choose graphs, drag and drop them on your preffered button. You
            may choose up to three graphs. Once you&apos;re done, click the
            &quot;Upload&quot; button.
          </Typography>
        </Grid>
      </Grid>
      <Divider variant="fullWidth" />
      <Grid container class={classes.AvailableGraphs} spacing={3}>
        <Grid item xs={12} md={10} lg={6}>
          <Typography variant="h4" gutterBottom>
            Available Graphs
          </Typography>
          <Typography variant="body1">
            You can choose the graphs you like from the ones below. We
            constantly update this library - look out for more graphs in the
            future!
          </Typography>
        </Grid>
      </Grid>
*/
