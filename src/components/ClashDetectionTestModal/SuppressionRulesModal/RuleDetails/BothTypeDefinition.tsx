import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import RuleDetailFooter from "./RuleDetailFooter";
import { LabeledInput, ModalContent } from "@itwin/itwinui-react";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";
import ClashReviewApi from "../../../../configs/ClashReviewApi";
import { useClashContext } from "../../../../context/ClashContext";

interface BothTypeDefinitionProps {
    ruleData:any
}
 
const BothTypeDefition: FunctionComponent<BothTypeDefinitionProps> = ({ruleData}) => {
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
			parameters: {
				likeExpression1: {
					value : ruleDetails.likeExpression1
				},
				likeExpression2: {
					value : ruleDetails.likeExpression2
				}
			},
		};

		await ClashReviewApi.updateSuppressionRule(iTwinId, ruleDetails.id, requestBody);
	};

	const addSuppressionRule = async () => {
		const requestBody = {
			templateId: selectedRuleTemplate.id,
			name: ruleDetails.name,
			reason: ruleDetails.reason,
			parameters: {
				likeExpression1: {
					value : ruleDetails.likeExpression1
				},
				likeExpression2: {
					value : ruleDetails.likeExpression2
				}
			},
		};

		const response = await ClashReviewApi.createSuppressionRule(iTwinId, requestBody);
		console.log(response);
	};

	useEffect(() => {
		if(method === "update")
		{
			const parameters = JSON.parse(ruleData.parameters)
			let structuredRuleData = {
				...ruleData,
				likeExpression1 : parameters?.likeExpression1?.value,
				likeExpression2 : parameters?.likeExpression2?.value,
			}
	
			setRuleDetails(structuredRuleData)
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
				<LabeledInput
					placeholder="Like Expression 1"
					label="Like Expression 1"
					name="likeExpression1"
					onChange={handleInput}
					value={ruleDetails.likeExpression1 || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
				<LabeledInput
					placeholder="Like Expression 2"
					label="Like Expression 2"
					name="likeExpression2"
					onChange={handleInput}
					value={ruleDetails.likeExpression2 || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
			</ModalContent>
			<RuleDetailFooter actionHandler={handleAction} method={method}/>
        </>
    );
}
 
export default BothTypeDefition;