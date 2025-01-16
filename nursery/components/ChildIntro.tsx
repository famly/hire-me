import React from 'react';
import { ChildrenInfo } from '../types/children';
import Image from 'next/image';

export default function ChildIntro(child: ChildrenInfo) {
  return (
    <div className="items-center justify-center">
      <h2 className="text-center font-bold">{child.child.name?.fullName}</h2>
      <Image
        className="mt-3 rounded-lg"
        src="/famly.jpg"
        alt="child image"
        width={200}
        height={200}
      />
    </div>
  );
}
