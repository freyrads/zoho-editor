"use client";

import { getAllSessions } from "@/services/root";
import { useQuery } from "@tanstack/react-query";

export default function Sessions() {
  const { data } = useQuery({
    queryFn: getAllSessions,
    queryKey: ["get-all-sessions"],
  });

  const sessionList = data?.data ?? [];

  console.log({ sessionList });

  return <h1>Sessions List</h1>;
}
