import { SvgGoToEnd, SvgGoToStart, SvgSave, SvgSettings } from "@itwin/itwinui-icons-react";
import { IconButton, ModalButtonBar } from "@itwin/itwinui-react";
import { FunctionComponent } from "react";
import { useClashDetectionTestContext } from "../../context/ClashDetectionTestContext";

interface CDTestModalFooterProps {
	method: "create" | "update";
	actionHandler: () => void;
}

const CDTestModalFooter: FunctionComponent<CDTestModalFooterProps> = ({ method, actionHandler }) => {
	const { currentPage, setCurrentPage } = useClashDetectionTestContext();

	const handleBack = () => {
		switch (currentPage) {
			case "setSelection": {
				setCurrentPage("nameDescription");
				break;
			}
			case "advancedOptions": {
				setCurrentPage("setSelection");
				break;
			}
		}
	};

	const handleNext = () => {
		switch (currentPage) {
			case "nameDescription": {
				setCurrentPage("setSelection");
			}
		}
	};

	return (
		<ModalButtonBar style={{ justifyContent: "space-between" }}>
			<div>
				{currentPage !== "nameDescription" && (
					<IconButton onClick={handleBack}>
						<SvgGoToStart style={{ height: 25, width: 25 }} />
					</IconButton>
				)}
				&nbsp;&nbsp;
				{currentPage === "setSelection" && (
					<IconButton onClick={() => setCurrentPage("advancedOptions")}>
						<SvgSettings /> &nbsp; Advanced Options
					</IconButton>
				)}
			</div>
			<div>
				{currentPage === "advancedOptions" || currentPage === "setSelection" ? (
					<IconButton styleType="high-visibility" onClick={actionHandler}>
					<SvgSave />
					&nbsp; {method === "create" ? "Create" : "Update"}
				</IconButton>
				) : (
					<IconButton onClick={handleNext}>
						<SvgGoToEnd style={{ height: 25, width: 25 }} />
					</IconButton>
				)}
			</div>
		</ModalButtonBar>
	);
};

export default CDTestModalFooter;
