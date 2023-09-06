import "katex/dist/katex.min.css";
import Latex from "react-latex-next";

export default function TestComponent() {
    return (
        <Latex>We give illustrations for the three processes $e^+e^-$, gluon-gluon and $\\gamma\\gamma \\to W t\\bar
            b$.
        </Latex>
    );
}