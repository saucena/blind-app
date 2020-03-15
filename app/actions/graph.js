export const EDIT_FORMULA = 'EDIT_FORMULA';
export const EDIT_STEP = 'EDIT_STEP';
export const EDIT_VALIDITY = 'EDIT_VALIDITY';
export const EDIT_LOADING = 'EDIT_LOADING';
export const EDIT_VALUES = 'EDIT_VALUES';
export const SHOW_GRAPH = 'SHOW_GRAPH';

export const editGraph = formula => ({
  type: EDIT_FORMULA,
  formula
});

export const editStep = step => ({
  type: EDIT_STEP,
  step
});

export const editValidity = isValid => ({
  type: EDIT_VALIDITY,
  isValid
});

export const editLoading = isLoading => ({
  type: EDIT_LOADING,
  isLoading
});

export const editValues = values => ({
  type: EDIT_VALUES,
  values
});

export const showGraph = flag => ({
  type: SHOW_GRAPH,
  flag
});
