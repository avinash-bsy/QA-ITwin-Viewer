import { Button, DefaultCell, ExpandableBlock, ModalButtonBar, ModalContent, Table } from "@itwin/itwinui-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import ClashReviewApi from "../../../configs/ClashReviewApi";
import { useClashContext } from "../../../context/ClashContext";

const SelectRuleTemplates = ({ setSelectedRuleTemplate, selectedRuleTemplate }: any) => {
	const [ruleTemplates, setRuleTemplates] = useState<any>([]);
	const [loading, setLoading] = useState<boolean>(false);
	const { iModelId, iTwinId } = useClashContext();

	const getRuleTemplates = async () => {
		setLoading(true);
		let ruleTemplatesData = await ClashReviewApi.getRuleTemplates(iTwinId);
		let filteredArray = [];
		for (let rule of ruleTemplatesData.rows) {
			if (rule.name === "Suppression/Definition/Generic/MappingAndGrouping") {
				let selectedRule = Object.create(rule);
				selectedRule.name = "Suppress Mapping And Grouping";
				filteredArray.push(selectedRule);
				break;
			}
		}
		setRuleTemplates(filteredArray);
		setLoading(false);
	};

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						id: "name",
						accessor: "name",
						Header: "Rule",
					},
				],
			},
		],
		[]
	);

	const handleRowClick = (event: React.MouseEvent<Element, MouseEvent>, row: any) => {
		if (row.original.id === selectedRuleTemplate) {
			setSelectedRuleTemplate("");
			return;
		}

		setSelectedRuleTemplate(row.original.id);
	};

	const getSelectedRows = useCallback(() => {
		const selectedRows: { [id: number]: boolean } = {};
		ruleTemplates.forEach((rule: any, idx: number) => {
			if (rule.id === selectedRuleTemplate) {
				selectedRows[idx] = true;
			}
		});

		return selectedRows;
	}, [selectedRuleTemplate, ruleTemplates]);

	useEffect(() => {
		getRuleTemplates();
	}, []);

	return (
		<div className="customModal">
			<Table
				columns={columnDefinition}
				data={ruleTemplates}
				emptyTableContent="No rule templates"
				isSelectable={true}
				isLoading={loading}
				// onSelect={handleSelect}
				initialState={{
					selectedRowIds: getSelectedRows(),
				}}
				onRowClick={handleRowClick}
				selectionMode="single"
			/>
		</div>
	);
};

export default SelectRuleTemplates;
