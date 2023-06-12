import { Dialog, IconButton, Button, ModalButtonBar } from "@itwin/itwinui-react";
import { SvgGoToStart, SvgSettings } from "@itwin/itwinui-icons-react";
import { PageTypes } from "./ClashDetectionModalContent";

interface ModalFooterProps {
	handleSubmit: () => void;
	currentPage: string;
	setCurrentPage: React.Dispatch<React.SetStateAction<PageTypes>>;
	buttonLabel: "Create" | "Update";
}

const ModalFooter = ({ handleSubmit, currentPage, setCurrentPage, buttonLabel }: ModalFooterProps) => {
	const handleback = () => {
		switch (currentPage) {
			case "advancedOptions": {
				setCurrentPage("setSelection");
				break;
			}
		}
	};

	return (
		<ModalButtonBar style={{ justifyContent: "space-between" }}>
			<div>
				{currentPage === "setSelection" ? (
					<>
						<IconButton
							style={{ margin: "0px 10px" }}
							onClick={() => {
								setCurrentPage("nameDescription");
							}}>
							<SvgGoToStart style={{ width: "25", height: "25" }} />
						</IconButton>
						<IconButton
							onClick={() => {
								setCurrentPage("advancedOptions");
							}}>
							<SvgSettings />
							&nbsp;&nbsp;Advanced Options
						</IconButton>
					</>
				) : (
					<Button onClick={handleback}>
						<SvgGoToStart style={{ width: "25", height: "25" }} />
					</Button>
				)}
			</div>
			<div>
				<Button styleType="high-visibility" onClick={handleSubmit}>
					{buttonLabel}
				</Button>
			</div>
		</ModalButtonBar>
	);
};

export default ModalFooter;
