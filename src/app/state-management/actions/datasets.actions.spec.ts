import { Dataset, AccessGroup, Datablock } from 'shared/sdk/models';

import {SEARCH_COMPLETE } from './datasets.actions'; 
import {SEARCH_FAILED } from './datasets.actions'; 
import {UpdateFilterAction, FILTER_UPDATE } from './datasets.actions'; 
import {FILTER_UPDATE_COMPLETE } from './datasets.actions'; 
import {FILTER_FAILED } from './datasets.actions'; 
import {FILTER_VALUE_UPDATE } from './datasets.actions'; 
import {SearchIDAction, SEARCH_ID } from './datasets.actions'; 
import {SearchIDCompleteAction, SEARCH_ID_COMPLETE } from './datasets.actions'; 
import {SearchIDFailedAction, SEARCH_ID_FAILED } from './datasets.actions'; 
import {DatablocksAction, DATABLOCKS } from './datasets.actions'; 
import {DATABLOCKS_COMPLETE } from './datasets.actions'; 
import {DatablocksFailedAction, DATABLOCKS_FAILED } from './datasets.actions'; 
import {DatablockDeleteAction, DATABLOCK_DELETE } from './datasets.actions'; 
import {DatablockDeleteCompleteAction, DATABLOCK_DELETE_COMPLETE } from './datasets.actions'; 
import {DATABLOCK_DELETE_FAILED } from './datasets.actions'; 
import {AddGroupsAction, ADD_GROUPS } from './datasets.actions'; 
import {ADD_GROUPS_COMPLETE } from './datasets.actions'; 
import {ADD_GROUPS_FAILED } from './datasets.actions'; 
import {UpdateSelectedAction, SELECTED_UPDATE } from './datasets.actions'; 
import {UpdateSelectedDatablocksAction, SELECTED_DATABLOCKS_COMPLETE } from './datasets.actions'; 
import {CurrentSetAction, SELECT_CURRENT } from './datasets.actions'; 
import {CURRENT_BLOCKS_COMPLETE } from './datasets.actions'; 
import {ResetStatusAction, RESET_STATUS } from './datasets.actions'; 
import {RESET_STATUS_COMPLETE } from './datasets.actions'; 
import {TOTAL_UPDATE } from './datasets.actions'; 
import {SelectDatasetAction, SELECT_DATASET } from './datasets.actions'; 
import {DeselectDatasetAction, DESELECT_DATASET } from './datasets.actions'; 
import {ClearSelectionAction, CLEAR_SELECTION } from './datasets.actions'; 
import {ExportToCsvAction, EXPORT_TO_CSV } from './datasets.actions'; 
import {SortByColumnAction, SORT_BY_COLUMN } from './datasets.actions'; 
import {SetViewModeAction, SET_VIEW_MODE } from './datasets.actions'; 



describe('UpdateFilterAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new UpdateFilterAction(payload); 
		expect({ ...action }).toEqual({ type: FILTER_UPDATE,  payload }); 
	}); 
});


describe('SearchIDAction', () => { 
	it('should create an action', () => { 
		const payload = "idstring"; 
		const action = new SearchIDAction(payload); 
		expect({ ...action }).toEqual({ type: SEARCH_ID,  payload }); 
	}); 
});


describe('SearchIDCompleteAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new SearchIDCompleteAction(payload); 
		expect({ ...action }).toEqual({ type: SEARCH_ID_COMPLETE,  payload }); 
	}); 
});


describe('SearchIDFailedAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new SearchIDFailedAction(payload); 
		expect({ ...action }).toEqual({ type: SEARCH_ID_FAILED,  payload }); 
	}); 
});


describe('DatablocksAction', () => { 
	it('should create an action', () => { 
		const payload = "idstring";
		const action = new DatablocksAction(payload); 
		expect({ ...action }).toEqual({ type: DATABLOCKS,  payload }); 
	}); 
});

describe('DatablocksFailedAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new DatablocksFailedAction(payload); 
		expect({ ...action }).toEqual({ type: DATABLOCKS_FAILED,  payload }); 
	}); 
});


describe('DatablockDeleteAction', () => { 
	it('should create an action', () => { 
		const payload = new Datablock();
		const action = new DatablockDeleteAction(payload); 
		expect({ ...action }).toEqual({ type: DATABLOCK_DELETE,  payload }); 
	}); 
});


describe('DatablockDeleteCompleteAction', () => { 
	it('should create an action', () => { 

		const action = new DatablockDeleteCompleteAction(); 
		expect({ ...action }).toEqual({ type: DATABLOCK_DELETE_COMPLETE  }); 
	}); 
});

describe('AddGroupsAction', () => { 
	it('should create an action', () => { 
		const payload = "groupstring";
		const action = new AddGroupsAction(payload); 
		expect({ ...action }).toEqual({ type: ADD_GROUPS,  payload }); 
	}); 
});

describe('UpdateSelectedAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new UpdateSelectedAction(payload); 
		expect({ ...action }).toEqual({ type: SELECTED_UPDATE,  payload }); 
	}); 
});


describe('UpdateSelectedDatablocksAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new UpdateSelectedDatablocksAction(payload); 
		expect({ ...action }).toEqual({ type: SELECTED_DATABLOCKS_COMPLETE,  payload }); 
	}); 
});


describe('CurrentSetAction', () => { 
	it('should create an action', () => { 
		const payload = new Dataset();
		const action = new CurrentSetAction(payload); 
		expect({ ...action }).toEqual({ type: SELECT_CURRENT,  payload }); 
	}); 
});

describe('ResetStatusAction', () => { 
	it('should create an action', () => { 
		const payload = [{id:1}]; 
		const action = new ResetStatusAction(payload); 
		expect({ ...action }).toEqual({ type: RESET_STATUS,  payload }); 
	}); 
});


describe('SelectDatasetAction', () => { 
	it('should create an action', () => { 
		const dataset = new Dataset();
		const action = new SelectDatasetAction(dataset); 
		expect({ ...action }).toEqual({ type: SELECT_DATASET,  dataset }); 
	}); 
});


describe('DeselectDatasetAction', () => { 
	it('should create an action', () => { 
		const dataset = new Dataset();
		const action = new DeselectDatasetAction(dataset); 
		expect({ ...action }).toEqual({ type: DESELECT_DATASET,  dataset }); 
	}); 
});


describe('ClearSelectionAction', () => { 
	it('should create an action', () => { 

		const action = new ClearSelectionAction(); 
		expect({ ...action }).toEqual({ type: CLEAR_SELECTION  }); 
	}); 
});


describe('ExportToCsvAction', () => { 
	it('should create an action', () => { 
		
		const action = new ExportToCsvAction(); 
		expect({ ...action }).toEqual({ type: EXPORT_TO_CSV  }); 
	}); 
});



describe('SortByColumnAction', () => { 
	it('should create an action', () => { 
		const column ="3";
		const direction ="1";
		const action = new SortByColumnAction(column,direction); 
		expect({ ...action }).toEqual({ type: SORT_BY_COLUMN,  column, direction }); 
	}); 
});


describe('SetViewModeAction', () => { 
	it('should create an action', () => { 
		const mode = 'view';
		const action = new SetViewModeAction(mode); 
		expect({ ...action }).toEqual({ type: SET_VIEW_MODE,  mode }); 
	}); 
});
