"use client";

import { getAllDocuments } from "@/services/root";
import { useQuery } from "@tanstack/react-query";

export default function Documents() {
  const { data } = useQuery({
    queryFn: getAllDocuments,
    queryKey: ["get-all-documents"],
  });

  const docList = data?.data ?? [];

  console.log({ docList });

  return <h1>Documents List</h1>;
}
