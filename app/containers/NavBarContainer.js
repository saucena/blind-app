import { connect } from 'react-redux';
import NavBar from '../components/NavBar';

function mapStateToProps(state) {
  return {
    graph: state.graph
  };
}

export default connect(mapStateToProps)(NavBar);
