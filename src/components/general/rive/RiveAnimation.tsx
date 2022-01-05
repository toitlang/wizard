// Copyright (C) 2022 Toitware ApS. All rights reserved.
// Use of this source code is governed by an MIT-style license that can be
// found in the LICENSE file.

import React from "react";
import { useRive } from "rive-react";

interface RiveAnimationProps {
  height: number;
  width: number;
  path: string;
}

function RiveAnimation(props: RiveAnimationProps): JSX.Element {
  const { RiveComponent, rive } = useRive({
    src: props.path,
    autoplay: true,
  });

  return (
    // The animation will fit to the parent element, so we set a large height
    // and width for this example
    // We set the height and width dynamically and therefore use the style attribute
    <div style={{ width: props.width, height: props.height }}>
      <RiveComponent />
    </div>
  );
}

export default RiveAnimation;
