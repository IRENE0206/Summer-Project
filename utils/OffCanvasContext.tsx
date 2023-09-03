import {createContext} from "react";

interface OffCanvasContextInterface {
    showOffCanvas: boolean;
    handleShowOffCanvas: () => void;
}

const OffCanvasContext = createContext<OffCanvasContextInterface>({
    showOffCanvas: true,
    handleShowOffCanvas: () => {
    }
});
export default OffCanvasContext;