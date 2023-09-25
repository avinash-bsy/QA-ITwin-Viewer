import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import RuleDetailFooter from "./RuleDetailFooter";
import { LabeledInput, ModalContent } from "@itwin/itwinui-react";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";
import ClashReviewApi from "../../../../configs/ClashReviewApi";
import { useClashContext } from "../../../../context/ClashContext";

interface SameTypeDefinition {
    ruleData:any
}
 
const SameTypeDefinition: FunctionComponent<SameTypeDefinition> = ({ruleData}) => {
    const {selectedRuleTemplate} = useSuppressionModalContext()
	const {iTwinId} = useClashContext()
	const [method, setMethod] = useState<"update" | "create">(!!ruleData ? "update" : "create")
	const [ruleDetails, setRuleDetails] = useState<any>({});


    const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
		setRuleDetails((ruleDetails: any) => {
			return {
				...ruleDetails,
				[event.target.name]: event.target.value,
			};
		});
	};

    const handleAction = async () => {
		if(method === "update")
		{
			updateSuppressionRule()
		}
		else
		{
			addSuppressionRule()
		}
    }

	const updateSuppressionRule = async () => {
		const requestBody = {
			name: ruleDetails.name,
			reason: ruleDetails.reason,
			parameters: {},
		};

		await ClashReviewApi.updateSuppressionRule(iTwinId, ruleDetails.id, requestBody);
	};

	const addSuppressionRule = async () => {
		const requestBody = {
			templateId: selectedRuleTemplate.id,
			name: ruleDetails.name,
			reason: ruleDetails.reason,
			parameters: {},
		};

		const response = await ClashReviewApi.createSuppressionRule(iTwinId, requestBody);
		console.log(response);
	};

	useEffect(() => {
		if(method === "update")
		{
			// const parameters = JSON.parse(ruleData.parameters)
			// let structuredRuleData = {
			// 	...ruleData
			// }
	
			setRuleDetails(ruleData)
		}
	}, [])

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
			</ModalContent>
			<RuleDetailFooter actionHandler={handleAction} method={method}/>
        </>
    );
}
 
export default SameTypeDefinition;