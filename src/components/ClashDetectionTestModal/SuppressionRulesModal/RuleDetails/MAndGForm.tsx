import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import {LabeledInput, Label, Select, SelectOption, SelectValueChangeEvent, ModalContent} from "@itwin/itwinui-react"
import { useClashContext } from "../../../../context/ClashContext";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";
import ClashReviewApi from "../../../../configs/ClashReviewApi";
import { convertStringtoObject } from "../..";
import RuleDetailFooter from "./RuleDetailFooter";

interface MappingAndGroupingRuleProps {
    ruleData : any
}
 
const MappingAndGroupingRule: FunctionComponent<MappingAndGroupingRuleProps> = ({ruleData}) => {
	const [mappingDropdown, setMappingDropdown] = useState<SelectOption<string>[]>([]);
	const [groupingDropdown, setGroupingDropdown] = useState<SelectOption<string>[]>([]);
	const { iModelId, iTwinId } = useClashContext();
	const {setCurrentPage, selectedRuleTemplate} = useSuppressionModalContext();
	const [ruleDetails, setRuleDetails] = useState<any>({})
	const [method, setMethod] = useState<"update" | "create">(!!ruleData ? "update" : "create")

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
		
		setGroupingDropdown(structureGroupingData ?? []);
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

	const handleAction = async () => {
		if(method == "update")
		{
			updateSuppressionRule()
		}
		else
		{
			addSuppressionRule()
		}
	}

	const updateSuppressionRule = async () => {
		try {
			const requestBody = {
				name: ruleDetails.name,
				reason: ruleDetails.reason,
				parameters: {
					queries: {
						type: 1,
						queryReference: `${ruleDetails.mappingId}:[${ruleDetails.groupingIds?.map((id: string) => id)}]`,
					},
				},
			};
	
			await ClashReviewApi.updateSuppressionRule(iTwinId, ruleDetails.id, requestBody);
			alert("Suppression rule updated successfully")
		} catch (error) {
			console.log(error)
			alert("Something went wrong!")
		}
		
	};

	const addSuppressionRule = async () => {
		const requestBody = {
			templateId: selectedRuleTemplate.id,
			name: ruleDetails.name,
			reason: ruleDetails.reason,
			parameters: {
				queries: {
					type: 1,
					queryReference: `${ruleDetails.mappingId}:[${ruleDetails.groupingIds?.map((id: string) => id)}]`,
				},
			},
		};

		const response = await ClashReviewApi.createSuppressionRule(iTwinId, requestBody);
		console.log(response);
	};

	useEffect(() => {
		const init = async () => {
			const mappingData = await ClashReviewApi.getMappingAndGrouping(iModelId);
			const structuredData = mappingData?.map((mapping: any) => {
				return {
					label: mapping.name,
					value: mapping.id,
				};
			});
			setMappingDropdown(structuredData);

			if(method === "update")
			{
				debugger
				const parameters = JSON.parse(ruleData.parameters);
				const mappingAndGroupingData = convertStringtoObject(parameters?.queries?.queryReference);
				const mappingId = Object.keys(mappingAndGroupingData)[0];
				let mappingIdPresent = false
				mappingData.forEach((mapping:any) => {
					if(mapping.id === mappingId)
					{
						mappingIdPresent = true
					}
				});

				if(mappingIdPresent)
				{
					ruleDetails.mappingId = mappingId
				}

				ruleDetails.groupingIds = Object.values(mappingAndGroupingData)[0] ?? [];
				if (ruleDetails.mappingId) {
					handleMappingSelection(ruleDetails.mappingId);
				}

				ruleDetails.name = ruleData.name
				ruleDetails.reason = ruleData.reason
				setRuleDetails(ruleDetails);
			}
		};

		init();

		return () => {
			setRuleDetails(null)
		}
	}, []);

    return ( 
        <>
		<ModalContent className="customModal">
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
			</ModalContent>
			<RuleDetailFooter actionHandler={handleAction} method={method}/>
        </>
    );
}
 
export default MappingAndGroupingRule;