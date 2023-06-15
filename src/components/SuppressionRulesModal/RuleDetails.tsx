import { Label, LabeledInput, Select, SelectOption, SelectValueChangeEvent } from "@itwin/itwinui-react";
import { ChangeEvent, Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from "react";
import ClashReviewApi from "../../configs/ClashReviewApi";
import { useClashContext } from "../../context/ClashContext";
import { convertStringtoObject } from "../ClashDetectionTestModal/useSelectedTestState";

interface RuleDetailsProps {
	setRuleDetails: Dispatch<SetStateAction<Record<string, any>>>;
	ruleDetails: Record<string, any>;
	selectedRuleForEdit?: string;
}

const RuleDetails: FunctionComponent<RuleDetailsProps> = ({ setRuleDetails, ruleDetails, selectedRuleForEdit }) => {
	const [mappingDropdown, setMappingDropdown] = useState<SelectOption<string>[]>([]);
	const [groupingDropdown, setGroupingDropdown] = useState<SelectOption<string>[]>([]);
	const { iModelId, iTwinId } = useClashContext();

	const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
		setRuleDetails((ruleDetails: any) => {
			return {
				...ruleDetails,
				[event.target.name]: event.target.value,
			};
		});
	};

	const handleMappingSelection = async (value: string) => {
		setRuleDetails((ruleDetails: any) => {
			return {
				...ruleDetails,
				mappingId: value,
			};
		});

		const groupingData = await ClashReviewApi.getGroupsForMappingId(iModelId, value);
		const structureGroupingData = groupingData?.groups?.map((grouping: any) => {
			return {
				label: grouping.groupName,
				value: grouping.id,
			};
		});
		setGroupingDropdown(structureGroupingData);
	};

	const handleGroupingSelection = (value: string, event: SelectValueChangeEvent) => {
		let groupingIds: Array<string> = ruleDetails.groupingIds || [];

		if (event === "added") {
			groupingIds = [...groupingIds, value];
		} else {
			groupingIds = groupingIds.filter((groupingId: string) => groupingId !== value);
		}

		setRuleDetails((ruleDetails: any) => {
			return {
				...ruleDetails,
				groupingIds: groupingIds,
			};
		});
	};

	const getMappingData = async () => {
		const mappingData = await ClashReviewApi.getMappingAndGrouping(iModelId);
		const structuredData = mappingData.map((mapping: any) => {
			return {
				label: mapping.name,
				value: mapping.id,
			};
		});

		setMappingDropdown(structuredData);
	};

	const getSuppressionRuleDetails = async () => {
		const response = await ClashReviewApi.getSuppressionRuleDetailsById(iTwinId, selectedRuleForEdit!);
		const ruleData = response.rows[0];
		const parameters = JSON.parse(ruleData.parameters);
		const mappingAndGroupingData = convertStringtoObject(parameters?.queries?.queryReference);
		ruleData.mappingId = Object.keys(mappingAndGroupingData)[0];
		ruleData.groupingIds = Object.values(mappingAndGroupingData)[0];
		if (ruleData.mappingId) {
			handleMappingSelection(ruleData.mappingId);
		}
		setRuleDetails(ruleData);
	};

	useEffect(() => {
		getMappingData();
		if (selectedRuleForEdit) {
			getSuppressionRuleDetails();
		}
	}, []);

	return (
		<>
			<LabeledInput
				placeholder="Name"
				label="Name"
				name="name"
				onChange={handleInput}
				value={ruleDetails.name || ""}
				style={{ margin: "10px 0px" }}
				required
			/>
			<LabeledInput
				placeholder="Reason"
				label="Reason"
				name="reason"
				onChange={handleInput}
				value={ruleDetails.reason || ""}
				style={{ margin: "10px 0px" }}
				required
			/>
			<Label htmlFor="mapping-dropdown" required>
				Mapping
			</Label>
			<Select<string>
				options={mappingDropdown}
				onChange={handleMappingSelection}
				value={ruleDetails.mappingId}
				placeholder={"Select Mapping"}
				multiple={false}
				id="mapping-dropdown"
				style={{ margin: "10px 0px" }}
			/>
			<Label htmlFor="grouping-dropdown">Grouping</Label>
			<Select<string>
				options={groupingDropdown}
				value={ruleDetails.groupingIds}
				placeholder={"Select Grouping"}
				multiple
				id="grouping-dropdown"
				onChange={handleGroupingSelection}
				disabled={!ruleDetails.mappingId}
				style={{ margin: "10px 0px" }}
			/>
		</>
	);
};

export default RuleDetails;
