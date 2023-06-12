import { useEffect, useState } from "react";
import { Tabs, Tab, ProgressLinear } from "@itwin/itwinui-react";
import ClashReviewApi from "../../configs/ClashReviewApi";
import { useClashContext } from "../../context/ClashContext";
import CommonInnerTabsComponent from "./CommonInnerTabs";
import { SetData, StateData } from "./useSelectedTestState";

interface SetDataSelectionProps {
	selectedDataItems: StateData;
	saveUpdatedSetData: (updatedSetData: SetData, activeTab: "setA" | "setB") => void;
}

const SetDataSelection = ({ selectedDataItems, saveUpdatedSetData }: SetDataSelectionProps) => {
	const [activeTab, setActiveTab] = useState<"setA" | "setB">("setA");
	const [loading, setLoading] = useState<boolean>(false);
	const [dataItems, setDataItems] = useState<Record<string, any>>({});
	const { iModelId, iTwinId } = useClashContext();

	// todo : improve this function
	const getDataItemsforActiveTab = (): SetData => {
		let setDataToExclude: SetData = activeTab === "setA" ? selectedDataItems.setB : selectedDataItems.setA;
		let filteredDataItems = {
			models: [],
			categories: [],
			mappingAndGroupings: {},
		};

		// this is done to not modify main dataItems object
		const tempObject: SetData = JSON.parse(JSON.stringify(dataItems));

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

	const getSelectedDataForActiveTab = (): SetData => {
		return { ...selectedDataItems[activeTab] };
	};

	const saveSelectedData = (updatedSetData: SetData): void => {
		saveUpdatedSetData(updatedSetData, activeTab);
		// alert("set data added");
	};

	useEffect(() => {
		const initApp = async () => {
			setLoading(true);
			const modelAndCategories = await ClashReviewApi.getModelsAndCategories(iModelId, iTwinId);
			const { models, categories } = modelAndCategories;
			const mappingAndGroupings = await ClashReviewApi.getMappingAndGrouping(iModelId);

			setDataItems({ models, categories, mappingAndGroupings });
			setLoading(false);
		};

		initApp();
	}, []);

	return (
		<Tabs
			labels={[<Tab key={1} label="Set A" />, <Tab key={2} label="Set B" />]}
			onTabSelected={(index) => {
				setActiveTab(index === 0 ? "setA" : "setB");
			}}>
			{loading ? (
				<ProgressLinear indeterminate={true} />
			) : (
				<CommonInnerTabsComponent
					setData={getDataItemsforActiveTab()}
					selectedDataItems={getSelectedDataForActiveTab()}
					saveUpdatedSetData={saveSelectedData}
				/>
			)}
		</Tabs>
	);
};

export default SetDataSelection;
