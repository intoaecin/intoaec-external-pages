import { Slide, SlideProps } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { forwardRef } from "react";

export const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});
Transition.displayName = "Transition";


 

type CustomSlideTransitionProps = SlideProps;

const CustomSlideTransition = forwardRef<HTMLDivElement, CustomSlideTransitionProps>(
  function CustomSlideTransition(props, ref) {
    return <Slide direction="left" ref={ref} {...props} />;
  }
);

export default CustomSlideTransition;