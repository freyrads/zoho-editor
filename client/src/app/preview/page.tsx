"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Preview() {
  const [filename, setFilename] = useState<string>();
  const router = useRouter();

  const handleGo = () => {
    router.push("/preview/" + filename);
  };

  return (
    <div>
      <input
        className="btn-look"
        value={filename}
        onChange={(e) => setFilename(e.target.value)}
      />
      <button className="btn-look" onClick={handleGo}>
        Go Preview
      </button>
    </div>
  );
}
