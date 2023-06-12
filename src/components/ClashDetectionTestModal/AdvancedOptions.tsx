import React, { useState, ChangeEvent, useEffect } from "react";
import { SvgAdd } from "@itwin/itwinui-icons-react";
import { Button, InputGroup, ToggleSwitch, LabeledInput } from "@itwin/itwinui-react";
import SuppressionRulesModal from "../SuppressionRulesModal/SuppressionRulesModal";
import { PageTypes } from "./ClashDetectionModalContent";

interface AdvancedOptionProps {
	testDetails: any;
	setTestDetails: React.Dispatch<React.SetStateAction<any>>;
	setCurrentPage: React.Dispatch<React.SetStateAction<PageTypes>>;
}

const AdvancedOptions = ({ testDetails, setTestDetails, setCurrentPage }: AdvancedOptionProps) => {
	const [isSuppressionModalVisible, setIsSuppressionModalVisible] = useState<boolean>(false);

	const toggleAdvanced = (event: ChangeEvent<HTMLInputElement>): void => {
		if (!testDetails.advancedSettings) {
			testDetails.advancedSettings = {};
		}

		testDetails.advancedSettings[event.target.name] = event.target.checked;
		setTestDetails({ ...testDetails });
	};

	const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
		testDetails[event.target.name] = event.target.name === "touchingTolerance" ? Number(event.target.value) : event.target.checked;
		setTestDetails({ ...testDetails });
	};

	const closeSuppressionRulesModal = () => {
		setIsSuppressionModalVisible(false);
	};

	return (
		<>
			<div style={{ padding: "10px 0px" }}>
				<Button
					style={{ margin: "10px 0px" }}
					onClick={() => {
						setIsSuppressionModalVisible(true);
					}}
					styleType="high-visibility">
					Suppression Rules
				</Button>

				{/* <InputGroup displayStyle="inline" style={{ margin: "10px 0px" }}>
					<ToggleSwitch
						label="Include Reference Models"
						checked={testDetails.includeSubModels}
						name="includeSubModels"
						onChange={handleChange}
					/>
					<ToggleSwitch
						label="Allow long running clash test"
						checked={testDetails.longClash}
						name="longClash"
						onChange={toggleAdvanced}
					/>
				</InputGroup> */}

				{/* <ToggleSwitch
					label="Calculate Overlap"
					checked={testDetails.calculateOverlap}
					style={{ margin: "10px 0px" }}
					name="calculateOverlap"
					onChange={toggleAdvanced}
				/> */}
				<InputGroup displayStyle="inline" style={{ margin: "10px 0px" }}>
					<ToggleSwitch
						label="Suppress Touching"
						checked={testDetails.suppressTouching}
						name="suppressTouching"
						onChange={handleChange}
					/>
					<LabeledInput
						type="number"
						value={testDetails.touchingTolerance}
						label="Touching Tolerance"
						displayStyle="inline"
						name="touchingTolerance"
						onChange={handleChange}
					/>
				</InputGroup>
				<ToggleSwitch
					label="Validate Touching Tolerance"
					checked={testDetails.advancedSettings?.toleranceOverlapValidation}
					name="toleranceOverlapValidation"
					onChange={toggleAdvanced}
				/>
			</div>
			{isSuppressionModalVisible && (
				<SuppressionRulesModal
					handleOnClose={closeSuppressionRulesModal}
					testDetails={testDetails}
					setTestDetails={setTestDetails}
				/>
			)}
		</>
	);
};

export default AdvancedOptions;
