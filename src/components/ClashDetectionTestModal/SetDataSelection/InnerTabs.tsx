import { Dispatch, FunctionComponent, SetStateAction, useState } from "react";
import { Tab, Tabs } from "@itwin/itwinui-react";
import ModelsTab from "./ModelsTab";
import CategoriesTab from "./CategoriesTab";
import MappingAndGroupingTab from "./MappingAndGroupingTab";
import { SetDataObject } from ".";

interface InnerTabsProps {
	setData: Record<string, any>;
	selectedDataItems: any;
	setSelectedDataItems: (data : SetDataObject) => void;
}

const InnerTabs: FunctionComponent<InnerTabsProps> = ({ setData, selectedDataItems, setSelectedDataItems }) => {
	const [activeTab, setActiveTab] = useState<number>(0);

	const setTabSelectedItems = (tab: "models" | "categories" | "mappingAndGroupings", ids: any): void => {
		selectedDataItems[tab] = ids;
		setSelectedDataItems(selectedDataItems);
	};

	return (
		<Tabs
			type="borderless"
			labels={[<Tab key={1} label="Models" />, <Tab key={2} label="Categories" />, <Tab key={3} label="Mapping And Grouping" />]}
			onTabSelected={(index: number) => {
				setActiveTab(index);
			}}
		>
			{activeTab === 0 && 
				<ModelsTab
					selectedModels={selectedDataItems.models || []}
					modelsList={setData.models}
					setSelectedItems={setTabSelectedItems}
				/>
			}
			{activeTab === 1 && 
				<CategoriesTab
					selectedCategories={selectedDataItems.categories || []}
					categoriesList={setData.categories}
					setSelectedItems={setTabSelectedItems}
				/>
			}
			{activeTab === 2 && 
				<MappingAndGroupingTab
					selectedMapAndGroups={selectedDataItems.mappingAndGroupings || {}}
					mapAndGroupsList={setData.mappingAndGroupings}
					setSelectedItems={setTabSelectedItems}
				/>
			}
		</Tabs>
	);
};

export default InnerTabs;
