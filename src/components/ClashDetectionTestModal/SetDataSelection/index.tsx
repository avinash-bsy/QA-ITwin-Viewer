import { ProgressLinear, Tab, Tabs } from "@itwin/itwinui-react";
import { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from "react";
import { useClashDetectionTestContext } from "../../../context/ClashDetectionTestContext";
import InnerTabs from "./InnerTabs";
import { useClashContext } from "../../../context/ClashContext";
import ClashReviewApi from "../../../configs/ClashReviewApi";
import { convertStringtoObject } from "..";

interface SetDataSelectionProps {
	setSelectedDataItems : Dispatch<SetStateAction<Record<"setA" | "setB", SetDataObject>>>;
	selectedDataItems : Record<"setA" | "setB", SetDataObject>
}
export interface SetDataObject {
	models? : string[];
	categories? : string[];
	mappingAndGroupings? : Record<string, string[]>;
}

const SetDataSelection: FunctionComponent<SetDataSelectionProps> = ({setSelectedDataItems, selectedDataItems}) => {
	const [activeTab, setActiveTab] = useState<"setA" | "setB">("setA");
	const [loading, setLoading] = useState<boolean>(true);
	const [selectableDataItems, setSelectableDataItems] = useState<Record<string, any>>({});
	const { iModelId, iTwinId } = useClashContext();
	const { testDetails } = useClashDetectionTestContext();

	const getSelectedDataItemsForActiveTab = () => {
		console.log(selectedDataItems[activeTab])
		return { ...selectedDataItems[activeTab] };
	};

	// todo : improve this function
	const getDataItemsforActiveTab = (): SetDataObject => {
		let setDataToExclude = activeTab === "setA" ? selectedDataItems.setB : selectedDataItems.setA;
		let filteredDataItems = {
			models: [],
			categories: [],
			mappingAndGroupings: {},
		};

		// this is done to not modify main dataItems object
		const tempObject = JSON.parse(JSON.stringify(selectableDataItems));

		Object.entries(tempObject).map(([tab, values]:[string, any]) => {
			if (tab === "mappingAndGroupings") {
				filteredDataItems[tab] = values.filter((value: any) => {
					if (setDataToExclude[tab]![value.id]) {
						value.subRows = value.subRows.filter((subRow: any) => !setDataToExclude[tab]![value.id].includes(subRow.id));

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

	const updateSelectedDataItems = (updatedDataItems : SetDataObject) => {
		setSelectedDataItems({
			...selectedDataItems,
			[activeTab] : updatedDataItems
		})
	}

	useEffect(() => {
		const initApp = async () => {
			try {
				const modelAndCategories = await ClashReviewApi.getModelsAndCategories(iModelId, iTwinId);
				const { models, categories } = modelAndCategories;
				const mappingAndGroupings = await ClashReviewApi.getMappingAndGrouping(iModelId);

				setSelectableDataItems({ models, categories, mappingAndGroupings });
			} catch (error) {
				console.log(error);
				setLoading(false);
			} finally {
				setLoading(false);
			}
		};

		initApp();
	}, []);

	return (
		<Tabs
			labels={[<Tab key={1} label="Set A" />, <Tab key={2} label="Set B" />]}
			onTabSelected={(index: number) => {
				setActiveTab(index === 0 ? "setA" : "setB");
			}}
			activeIndex={activeTab === "setA" ? 0 : 1}>
			{loading ? <ProgressLinear indeterminate={true} /> : <InnerTabs setData={getDataItemsforActiveTab()} selectedDataItems={getSelectedDataItemsForActiveTab()} setSelectedDataItems={updateSelectedDataItems}/>}
		</Tabs>
	);
};

export default SetDataSelection;
