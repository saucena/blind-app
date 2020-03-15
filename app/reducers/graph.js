import {
  EDIT_FORMULA,
  EDIT_STEP,
  EDIT_VALIDITY,
  EDIT_LOADING,
  EDIT_VALUES,
  SHOW_GRAPH
} from '../actions/graph';

const defaultState = {
  formula: '',
  step: 0,
  isValid: false,
  isLoading: false,
  isVisible: false,
  values: {
    unscaled: [],
    y: [],
    x: []
  }
};

const graph = (state = defaultState, action) => {
  switch (action.type) {
    case EDIT_FORMULA:
      return {
        ...state,
        formula: action.formula
      };
    case EDIT_STEP:
      return {
        ...state,
        step: action.step
      };
    case EDIT_VALIDITY:
      return {
        ...state,
        isValid: action.isValid
      };
    case EDIT_LOADING:
      return {
        ...state,
        isLoading: action.isLoading
      };
    case EDIT_VALUES:
      return {
        ...state,
        values: action.values
      };
    case SHOW_GRAPH:
      return {
        ...state,
        isVisible: action.flag
      };
    default:
      return state;
  }
};

export default graph;
