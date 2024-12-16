import configureStore from "redux-mock-store";

export const initialState = {
  walletAddress: "",
};
const mockStore = configureStore();
export let store = mockStore(initialState);