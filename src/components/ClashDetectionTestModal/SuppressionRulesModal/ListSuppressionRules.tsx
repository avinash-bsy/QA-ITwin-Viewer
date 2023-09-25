import { SvgAdd, SvgEdit, SvgGoToStart } from "@itwin/itwinui-icons-react";
import { Button, ButtonGroup, IconButton, ModalButtonBar, ModalContent, Table } from "@itwin/itwinui-react";
import { Dispatch, FunctionComponent, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import ClashReviewApi from "../../../configs/ClashReviewApi";
import { useClashContext } from "../../../context/ClashContext";
import { useClashDetectionTestContext } from "../../../context/ClashDetectionTestContext";
import { useSuppressionModalContext } from "../../../context/SuppressionModalContext";

interface ListSuppressionRulesProps {
	handleOnClose: () => void;
	setSelectedRuleForEdit: Dispatch<SetStateAction<null | string>>;
	selectedRuleForEdit: null | string;
}

const ListSuppressionRules: FunctionComponent<ListSuppressionRulesProps> = ({handleOnClose, setSelectedRuleForEdit, selectedRuleForEdit}) => {
	const [suppressionRules, setSuppressionRules] = useState([]);
	const [loading, setLoading] = useState(false);
	const [addButtonDisabled, setAddButtonDisabled] = useState(false);
	const [editButtonDisabled, setEditButtonDisabled] = useState(true);
	const [selectedRules, setSelectedRules] = useState([]);
	const { iTwinId } = useClashContext();
	const {setTestDetails, testDetails} = useClashDetectionTestContext()
	const {currentPage, setCurrentPage} = useSuppressionModalContext()

	const columnDefinition = useMemo(
		() => [
			{
				Header: "Table",
				columns: [
					{
						id: "name",
						accessor: "name",
						Header: "Name",
					},
					{
						id: "createdBy",
						accessor: "userMetadata.createdBy.name",
						Header: "Created By",
					},
					{
						id: "reason",
						accessor: "reason",
						Header: "Reason",
					},
					{
						id: "description",
						accessor: "description",
						Header: "Description",
					},
				],
			},
		],
		[]
	);

	const handleSelect = (rows: any, state: any) => {
		if (rows.length === 0) {
			setAddButtonDisabled(false);
			setSelectedRuleForEdit(null);
			setEditButtonDisabled(true);
		} else if (rows.length === 1) {
			setSelectedRuleForEdit(rows[0].id);
			setEditButtonDisabled(false);
			setAddButtonDisabled(true);
		} else {
			setSelectedRuleForEdit(null);
			setEditButtonDisabled(true);
		}

		setSelectedRules(rows);
	};

	const getSelectedRows = useCallback(() => {
		const selectedRows: { [id: number]: boolean } = {};
		suppressionRules.forEach((rule: any, idx: number) => {
			if (rule.id === selectedRuleForEdit || testDetails.suppressionRules?.includes(rule.id)) {
				selectedRows[idx] = true;
			}
		});

		return selectedRows;
	}, [selectedRuleForEdit, suppressionRules]);

	const updateTestDetailsWithSelectedRules = () => {
		testDetails.suppressionRules = selectedRules.map((rule: any) => rule.id);
		setTestDetails({ ...testDetails });
		handleOnClose();
	};

	useEffect(() => {
		if (selectedRuleForEdit) {
			setEditButtonDisabled(false);
			setAddButtonDisabled(true);
		}

		if (testDetails.suppressionRules?.length === 1) {
			setSelectedRuleForEdit(testDetails.suppressionRules[0]);
			setEditButtonDisabled(false);
			setAddButtonDisabled(true);
		}

		const getSuppressionRules = async () => {
			setLoading(true);
			const response = await ClashReviewApi.getSuppressionRules(iTwinId);
			setSuppressionRules(response);
			setLoading(false);
		};

		getSuppressionRules();
	}, []);

	return (
		<>
			<ModalContent className="customModal">
				<div style={{ display: "inline-block", width: "100%", marginTop: "10px" }}>
					<ButtonGroup style={{ float: "right" }}>
						<IconButton
							onClick={() => {
								setCurrentPage("selectRuleType");
							}}
							disabled={addButtonDisabled}>
							<SvgAdd />
						</IconButton>
						<IconButton
							onClick={() => {
								setCurrentPage("ruleDetails");
							}}
							disabled={editButtonDisabled}>
							<SvgEdit />
						</IconButton>
					</ButtonGroup>
				</div>
				<div>
					<Table
						columns={columnDefinition}
						data={suppressionRules}
						emptyTableContent="No suppression rules"
						isLoading={loading}
						isSelectable={true}
						initialState={{
							selectedRowIds: getSelectedRows(),
						}}
						onSelect={handleSelect}
						selectionMode="multi"
					/>
				</div>
			</ModalContent>
			<ModalButtonBar>
				<Button styleType="high-visibility" onClick={updateTestDetailsWithSelectedRules}>
					Save
				</Button>
			</ModalButtonBar>
		</>
	);
};

export default ListSuppressionRules;
