import { persistState, getPersistedState } from '../config/store';
import { isLightTheme } from '../styles/themes';

const TOGGLE_THEME = 'UI/TOGGLE_THEME';
const UPDATE_CURRENT_PAGE = 'UI/UPDATE_CURRENT_PAGE';
const UPDATE_CURRENT_TAB = 'UI/UPDATE_CURRENT_TAB';
const TOGGLE_TRANSACTION_SETTINGS_POPUP = 'UI/TOGGLE_TRANSACTION_SETTINGS_POPUP';

const persistedState = getPersistedState('ui');

const defaultState = {
	theme: 'dark',
	currentPage: 'landing',
	currentTab: 'home',
	tabParams: null,
	transactionSettingsPopupIsVisible: false,
	...persistedState,
};

// Reducer
export default (state = defaultState, action) => {
	switch (action.type) {
		case TOGGLE_THEME: {
			const theme = isLightTheme(state.theme) ? 'dark' : 'light';
			persistState('ui', { theme });
			return { ...state, theme };
		}
		case UPDATE_CURRENT_PAGE: {
			return { ...state, currentPage: action.payload };
		}
		case UPDATE_CURRENT_TAB: {
			const { tab, params } = action.payload;
			return { ...state, currentTab: tab, tabParams: params };
		}

		case TOGGLE_TRANSACTION_SETTINGS_POPUP: {
			return { ...state, transactionSettingsPopupIsVisible: action.payload };
		}
		default:
			return state;
	}
};

// Actions
export const toggleTheme = () => {
	return {
		type: TOGGLE_THEME,
	};
};

export const updateCurrentPage = page => {
	return {
		type: UPDATE_CURRENT_PAGE,
		payload: page,
	};
};

export const updateCurrentTab = (tab, params = null) => {
	return {
		type: UPDATE_CURRENT_TAB,
		payload: { tab, params },
	};
};

export const toggleTransactionSettingsPopup = isVisible => {
	return {
		type: TOGGLE_TRANSACTION_SETTINGS_POPUP,
		payload: isVisible,
	};
};

export const getCurrentPage = state => state.ui.currentPage;
export const getCurrentTheme = state => state.ui.theme;
export const getCurrentTab = state => state.ui.currentTab;
export const getTabParams = state => state.ui.tabParams;
export const getTransactionSettingsPopupIsVisible = state =>
	state.ui.transactionSettingsPopupIsVisible;
