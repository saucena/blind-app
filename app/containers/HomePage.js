import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Home from '../components/Home';
import {
  editGraph,
  editStep,
  editValidity,
  editLoading,
  editValues,
  showGraph
} from '../actions/graph';

function mapStateToProps(state) {
  return {
    graph: state.graph
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(
    {
      editGraph,
      editStep,
      editValidity,
      editLoading,
      editValues,
      showGraph
    },
    dispatch
  );
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
