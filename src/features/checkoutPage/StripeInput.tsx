import React, { useRef, useImperativeHandle } from "react";

export default React.forwardRef(function StripeInput(props: any, ref) {
  const { component: Component, inputRef, ...other } = props;
  const elementRef = useRef<any>();

  useImperativeHandle(
    inputRef,
    () => ({
      focus: () => elementRef.current?.focus,
    }),
    []
  );

  return (
    <Component
      onReady={(element: any) => (elementRef.current = element)}
      {...other}
    />
  );
});
