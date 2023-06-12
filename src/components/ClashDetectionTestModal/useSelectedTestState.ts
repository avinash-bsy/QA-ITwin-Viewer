import { useReducer } from "react";

export interface SetData {
	models: Array<string>;
	categories: Array<string>;
	mappingAndGroupings: Record<string, Array<string>>;
}

const initialState: StateData = {
	setA: {
		models: [],
		categories: [],
		mappingAndGroupings: {},
	},
	setB: {
		models: [],
		categories: [],
		mappingAndGroupings: {},
	},
};

export interface StateData {
	setA: SetData;
	setB: SetData;
}

interface Action {
	type: string;
	payload: any;
}

const reducerMethods = (state: StateData, action: Action): StateData => {
	switch (action.type) {
		case "INITIALIZE_STATE": {
			const testDetails = action.payload;
			return {
				setA: {
					models: testDetails.setA?.modelIds || [],
					categories: testDetails.setA?.categoryIds || [],
					mappingAndGroupings: convertStringtoObject(testDetails.setA?.queries?.queryReference),
				},
				setB: {
					models: testDetails.setB?.modelIds || [],
					categories: testDetails.setB?.categoryIds || [],
					mappingAndGroupings: convertStringtoObject(testDetails.setB?.queries?.queryReference),
				},
			};
		}
		case "SAVE_UPDATED_SET_DATA": {
			const selectedSet = action.payload.selectedSet;
			return {
				...state,
				[selectedSet]: action.payload.updatedSetData,
			};
		}
		default: {
			return {
				...state,
			};
		}
	}
};

export const convertStringtoObject = (queryReference: string): { [id: string]: Array<string> } => {
	if (queryReference) {
		let responseObject: { [id: string]: Array<string> } = {};
		const mappingAndGrouppings = queryReference.split(";");
		mappingAndGrouppings.forEach((mappingAndGroupping) => {
			const mappingId = mappingAndGroupping.split(":")[0];
			const groupingIds = mappingAndGroupping.split(":")[1];
			const groupingIdsString = groupingIds.substring(1, groupingIds.length - 1);
			let groupingIdArray = groupingIdsString.split(",");

			responseObject[mappingId] = groupingIdArray;
		});

		return responseObject;
	} else {
		return {};
	}
};

const useSelectedItemState = () => {
	const [selectedDataItems, dispatch] = useReducer(reducerMethods, initialState);

	const initializeSelectedItems = (testDetails: any) => {
		console.log("called");
		dispatch({ type: "INITIALIZE_STATE", payload: testDetails });
	};

	const saveUpdatedSetData = (updatedSetData: SetData, activeTab: "setA" | "setB") => {
		console.log("called");
		dispatch({
			type: "SAVE_UPDATED_SET_DATA",
			payload: {
				updatedSetData,
				selectedSet: activeTab,
			},
		});
	};

	return {
		selectedDataItems,
		initializeSelectedItems,
		saveUpdatedSetData,
	};
};

export default useSelectedItemState;
