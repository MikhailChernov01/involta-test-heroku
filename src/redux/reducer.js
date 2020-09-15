export const reducer = (state, action) => {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        names: [...state.names, action.payload]
      };
    default:
      return state;
  }
}
