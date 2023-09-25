import { ChangeEvent, FunctionComponent, useEffect, useState } from "react";
import RuleDetailFooter from "./RuleDetailFooter";
import { LabeledInput, ModalContent } from "@itwin/itwinui-react";
import { useSuppressionModalContext } from "../../../../context/SuppressionModalContext";
import ClashReviewApi from "../../../../configs/ClashReviewApi";
import { useClashContext } from "../../../../context/ClashContext";

interface AnyAspectPropertyProps {
    ruleData:any
}
 
const AnyAspectProperty: FunctionComponent<AnyAspectPropertyProps> = ({ruleData}) => {
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
				propertyExpression: {
                    operator : ruleDetails.operator,
                    propertyName: ruleDetails.propertyName,
                    propertyValue: ruleDetails.propertyValue,
                    relationshipPath: ruleDetails.relationshipPath
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
				propertyExpression: {
                    operator : ruleDetails.operator,
                    propertyName: ruleDetails.propertyName,
                    propertyValue: ruleDetails.propertyValue,
                    relationshipPath: ruleDetails.relationshipPath
                }
			},
		};

		const response = await ClashReviewApi.createSuppressionRule(iTwinId, requestBody);
		console.log(response);
	};

	useEffect(() => {
        console.log(method, ruleData)
        if(method === "update")
        {
            console.log(method, ruleData)
            const parameters = JSON.parse(ruleData.parameters)
            let structuredRuleData = {
                ...ruleData,
                operator : parameters?.propertyExpression?.value,
                propertyName : parameters?.propertyExpression?.propertyName,
                propertyValue : parameters?.propertyExpression?.propertyValue,
                relationshipPath : parameters?.propertyExpression?.relationshipPath,
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
					placeholder="Operator"
					label="Operator"
					name="operator"
					onChange={handleInput}
					value={ruleDetails.operator || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
				<LabeledInput
					placeholder="Property Name"
					label="Property Name"
					name="propertyName"
					onChange={handleInput}
					value={ruleDetails.propertyName || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
				<LabeledInput
					placeholder="Property Value"
					label="Property Value"
					name="propertyValue"
					onChange={handleInput}
					value={ruleDetails.propertyValue || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
				<LabeledInput
					placeholder="Relationship Path"
					label="Relationship Path"
					name="relationshipPath"
					onChange={handleInput}
					value={ruleDetails.relationshipPath || ""}
					style={{ margin: "10px 0px" }}
					required
				/>
			</ModalContent>
			<RuleDetailFooter actionHandler={handleAction} method={method}/>
        </>
    );
}
 
export default AnyAspectProperty;