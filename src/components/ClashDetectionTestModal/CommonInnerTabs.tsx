import { useEffect, useState } from "react";
import { Button, Tabs, Tab, IconButton } from "@itwin/itwinui-react";
import ModelsTab from "./ModelsTab";
import { SvgGoToStart } from "@itwin/itwinui-icons-react";
import CategoriesTab from "./CategoriesTab";
import MappingAndGroupingTab from "./MappingAndGrouping";
import { SetData } from "./useSelectedTestState";

interface CommonInnerTabProps {
	selectedDataItems: SetData;
	setData: Record<string, any>;
	saveUpdatedSetData: (setData: SetData) => void;
}

const CommonInnerTabs = ({ selectedDataItems, setData, saveUpdatedSetData }: CommonInnerTabProps) => {
	const [activeTab, setActiveTab] = useState<number>(0);
	const [selectedItems, setSelectedItems] = useState<SetData>(selectedDataItems);

	const setTabSelectedItems = (tab: "models" | "categories" | "mappingAndGroupings", ids: any): void => {
		selectedItems[tab] = ids;
		setSelectedItems(selectedItems);
		saveUpdatedSetData(selectedItems);
	};

	const getContent = () => {
		switch (activeTab) {
			case 0:
				return (
					<ModelsTab selectedModels={selectedItems?.models} modelsList={setData?.models} setSelectedItems={setTabSelectedItems} />
				);
			case 1:
				return (
					<CategoriesTab
						selectedCategories={selectedItems?.categories}
						categoriesList={setData?.categories}
						setSelectedItems={setTabSelectedItems}
					/>
				);
			case 2:
				return (
					<MappingAndGroupingTab
						selectedMapAndGroups={selectedItems?.mappingAndGroupings}
						mapAndGroupsList={setData?.mappingAndGroupings}
						setSelectedItems={setTabSelectedItems}
					/>
				);
		}
	};

	useEffect(() => {
		setSelectedItems(selectedDataItems);
	}, [selectedDataItems]);

	return (
		<Tabs
			type="borderless"
			labels={[<Tab key={1} label="Models" />, <Tab key={2} label="Categories" />, <Tab key={3} label="Mapping And Grouping" />]}
			onTabSelected={(index: number) => {
				setActiveTab(index);
			}}>
			<div>{getContent()}</div>
			<div style={{ float: "right", marginTop: "10px" }}>
				{/* {showBackButton && (
					<IconButton style={{ margin: "0px 10px" }} onClick={backButtonHandler}>
						<SvgGoToStart style={{ width: "25", height: "25" }} />
					</IconButton>
				)} */}
				{/* <Button
					styleType="high-visibility"
					onClick={() => {
						saveUpdatedSetData(selectedItems);
					}}>
					Save
				</Button> */}
			</div>
		</Tabs>
	);
};

export default CommonInnerTabs;
