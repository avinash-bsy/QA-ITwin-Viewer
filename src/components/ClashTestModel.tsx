import { useEffect, useReducer, useState } from "react";
import { Dialog, Button, Tabs, Tab, ProgressLinear } from "@itwin/itwinui-react";
import ClashReviewApi from "../configs/ClashReviewApi";
import { useClashContext } from "../context/ClashContext";
import ModelsTab from "./ModelsTab";
import CategoriesTab from "./CategoriesTab";
import MappingAndGroupingTab from "./MappingAndGrouping";

interface SetData {
	models: Array<string>;
	categories: Array<string>;
	mappingAndGroupings: Record<string, Array<string>>;
}

interface StateData {
	setA: SetData;
	setB: SetData;
}

interface ClashTestModelProps {
	isOpen: boolean;
	handleOnClose: () => void;
	currentTest: null | string;
}

interface Action {
	type: string;
	payload: any;
}

interface CommonComponentProps {
	dataItems: Record<string, any>;
	selectedDataItems: SetData;
	saveUpdatedSetData: (setData: SetData) => void;
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

const reducerMethods = (state: StateData, action: Action): StateData => {
	switch (action.type) {
		case "INITIALIZE_STATE": {
			const testDetails = action.payload;
			return {
				...state,
				setA: {
					models: testDetails.setA?.modelIds || [],
					categories: testDetails.setA?.categoryIds || [],
					mappingAndGroupings: convertStringtoObject(testDetails.setA?.queries?.queryReference),
				},
				setB: {
					models: testDetails.setB?.modelIds,
					categories: testDetails.setB?.categoryIds,
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

const convertStringtoObject = (queryReference: string): { [id: string]: Array<string> } => {
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

const ClashTestModel = (props: ClashTestModelProps) => {
	const [activeTab, setActiveTab] = useState<"setA" | "setB">("setA");
	const [loading, setLoading] = useState<boolean>(false);
	const [dataItems, setDataItems] = useState<Record<string, any>>({});
	const [testDetails, setTestDetails] = useState<any>({});
	const { iTwinId, iModelId } = useClashContext();

	const [selectedDataItems, dispatch] = useReducer(reducerMethods, initialState);

	// todo : improve this function
	const getDataItemsforActiveTab = (): Record<string, any> => {
		let setDataToExclude: SetData = activeTab === "setA" ? selectedDataItems.setB : selectedDataItems.setA;
		let filteredDataItems = {
			models: [],
			categories: [],
			mappingAndGroupings: {},
		};

		// this is done to not modify main dataItems object
		const tempObject: Record<string, any> = JSON.parse(JSON.stringify(dataItems));

		Object.entries(tempObject).map(([tab, values]) => {
			if (tab === "mappingAndGroupings") {
				filteredDataItems[tab] = values.filter((value: any) => {
					if (setDataToExclude[tab][value.id]) {
						value.subRows = value.subRows.filter((subRow: any) => !setDataToExclude[tab][value.id].includes(subRow.id));

						return value.subRows.length > 0;
					}
					return true;
				});
			} else if (tab === "models" || tab === "categories") {
				filteredDataItems[tab] = values.filter((value: any) => !setDataToExclude[tab]?.includes(value.id));
			}
		});

		return filteredDataItems;
	};

	const saveUpdatedSetData = (updatedSetData: SetData) => {
		dispatch({
			type: "SAVE_UPDATED_SET_DATA",
			payload: {
				updatedSetData,
				selectedSet: activeTab,
			},
		});
		alert("set data added");
	};

	const formatQueryReference = (mappingAndGroupings: Record<string, Array<string>>): string => {
		let queryReference = "";
		if (mappingAndGroupings) {
			Object.entries(mappingAndGroupings).map(([mappingId, groupingIds]: [string, Array<string>], index) => {
				queryReference += mappingId + ":[";
				groupingIds.forEach((groupingId: string, idx: number) => {
					queryReference += groupingId;
					if (idx !== groupingIds.length - 1) {
						queryReference += ",";
					}
				});
				queryReference += "]";
				if (index !== groupingIds.length - 1) {
					queryReference += ";";
				}
			});
		}
		return queryReference;
	};

	const saveUpdatedClashTest = async () => {
		const setAQueryReference = formatQueryReference(selectedDataItems.setA.mappingAndGroupings);
		const setBQueryReference = formatQueryReference(selectedDataItems.setB.mappingAndGroupings);

		testDetails.setA = {
			...testDetails.setA,
			modelIds: selectedDataItems.setA.models,
			categoryIds: selectedDataItems.setA.categories,
			queries: setAQueryReference
				? {
						type: 1,
						queryReference: formatQueryReference(selectedDataItems.setA.mappingAndGroupings),
				  }
				: undefined,
		};
		testDetails.setB = {
			...testDetails.setB,
			modelIds: selectedDataItems.setB.models,
			categoryIds: selectedDataItems.setB.categories,
			queries: setBQueryReference
				? {
						type: 1,
						queryReference: formatQueryReference(selectedDataItems.setB.mappingAndGroupings),
				  }
				: undefined,
		};

		if (testDetails.tag) {
			testDetails.tag = {
				repositoryId: testDetails.tag?.id,
				repositoryType: testDetails.tag?.type,
			};
		}

		const { contextId, createdBy, creationDate, id, lastModifiedBy, modificationDate, ...requiredData } = testDetails;

		const response = await ClashReviewApi.updateClashTest(iTwinId, props.currentTest!, requiredData);
		alert("Test updated successfully");
	};

	const getSelectedDataForActiveTab = (): SetData => {
		return selectedDataItems[activeTab];
	};

	useEffect(() => {
		const initApp = async () => {
			setLoading(true);
			const modelAndCategories = await ClashReviewApi.getModelsAndCategories(iModelId, iTwinId);
			const { models, categories } = modelAndCategories;
			const mappingAndGroupings = await ClashReviewApi.getMappingAndGrouping(iModelId);
			const response = await ClashReviewApi.getClashTestDetailById(iTwinId, props.currentTest!);

			setDataItems({ models, categories, mappingAndGroupings });
			setTestDetails(response);
			dispatch({ type: "INITIALIZE_STATE", payload: response });
			setLoading(false);
		};

		initApp();
	}, []);

	return (
		<Dialog
			isOpen={props.isOpen}
			onClose={props.handleOnClose}
			closeOnEsc
			closeOnExternalClick
			preventDocumentScroll
			trapFocus
			setFocus
			isDismissible>
			<Dialog.Backdrop />
			<Dialog.Main>
				<Dialog.TitleBar titleText="Modify Clash Detection Test" />
				<Dialog.Content>
					{
						<Tabs
							labels={[<Tab key={1} label="Set A" />, <Tab key={2} label="Set B" />]}
							onTabSelected={(index) => {
								setActiveTab(index === 0 ? "setA" : "setB");
							}}>
							{loading ? (
								<ProgressLinear indeterminate={true} />
							) : (
								<CommonInnerTabsComponent
									dataItems={getDataItemsforActiveTab()}
									selectedDataItems={getSelectedDataForActiveTab()}
									saveUpdatedSetData={saveUpdatedSetData}
								/>
							)}
						</Tabs>
					}
				</Dialog.Content>
				<Dialog.ButtonBar>
					<Button
						styleType="high-visibility"
						onClick={() => {
							saveUpdatedClashTest();
						}}>
						Submit
					</Button>
					<Button onClick={() => {}}>Close</Button>
				</Dialog.ButtonBar>
			</Dialog.Main>
		</Dialog>
	);
};

const CommonInnerTabsComponent = (props: CommonComponentProps) => {
	const [activeTab, setActiveTab] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<SetData>(props.selectedDataItems);

	const setTabSelectedItems = (tab: "models" | "categories" | "mappingAndGroupings", ids: any): void => {
		selectedItems[tab] = ids;
		setSelectedItems(selectedItems);
	};

	const mockupData = props.dataItems;

	const getContent = () => {
		switch (activeTab) {
			case 0:
				return (
					<ModelsTab
						selectedModels={selectedItems?.models}
						modelsList={mockupData?.models}
						setSelectedItems={setTabSelectedItems}
					/>
				);
			case 1:
				return (
					<CategoriesTab
						selectedCategories={selectedItems?.categories}
						categoriesList={mockupData?.categories}
						setSelectedItems={setTabSelectedItems}
					/>
				);
			case 2:
				return (
					<MappingAndGroupingTab
						selectedMapAndGroups={selectedItems?.mappingAndGroupings}
						mapAndGroupsList={mockupData?.mappingAndGroupings}
						setSelectedItems={setTabSelectedItems}
					/>
				);
		}
	};

	useEffect(() => {
		setSelectedItems(props.selectedDataItems);
	}, [props.selectedDataItems]);

	return (
		<Tabs
			type="borderless"
			labels={[<Tab key={1} label="Models" />, <Tab key={2} label="Categories" />, <Tab key={3} label="Mapping And Grouping" />]}
			onTabSelected={(index: number) => {
				setActiveTab(index);
			}}>
			<div className="customModal">{getContent()}</div>
			<div style={{ float: "right", marginTop: "10px" }}>
				<Button
					styleType="high-visibility"
					onClick={() => {
						props.saveUpdatedSetData(selectedItems);
					}}>
					Save
				</Button>
			</div>
		</Tabs>
	);
};

export default ClashTestModel;
