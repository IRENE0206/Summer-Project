import {createContext} from "react";

// Defines the shape and expected values for the OffCanvas context.
interface OffCanvasContextInterface {
    showOffCanvas: boolean;
    handleShowOffCanvas: () => void;
}

// Creates a context for OffCanvas with default values.
const OffCanvasContext = createContext<OffCanvasContextInterface>({
    showOffCanvas: true,
    handleShowOffCanvas: () => {
        console.warn("handleShowOffCanvas has been called without being overridden by a Provider.");
    }
});

export default OffCanvasContext;
